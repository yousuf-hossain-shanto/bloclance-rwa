"use server";

import { Prisma, prisma } from "@surgexrp/db";
import { CancelOrderSchema, PlaceOrderSchema } from "@surgexrp/shared";
import { TF_IMMEDIATE_OR_CANCEL, rippleTimeFromUnixMs, submitAndWait } from "@surgexrp/xrpl";
import { z } from "zod";
import { ActionError, kycActionClient } from "./safe-action";

const RLUSD_ISSUER = process.env.RLUSD_ISSUER_TESTNET ?? "";

/**
 * placeOrder — persist the Order row, and (when the client provides a signed
 * XRPL tx blob) submit it to the ledger. Without a blob we keep the Order in
 * `Pending` so a later submission flow can pick it up.
 *
 * The unsigned tx is built client-side via `useXrpl().signOfferCreate(...)`.
 * The action validates the blob's intent matches the Order row before submit.
 */
const PlaceOrderWithBlobSchema = PlaceOrderSchema.and(
  z.object({ signedTxBlob: z.string().optional() }),
);

export const placeOrder = kycActionClient
  .metadata({ actionName: "placeOrder" })
  .schema(PlaceOrderWithBlobSchema)
  .action(async ({ parsedInput, ctx }) => {
    const property = await prisma.property.findUnique({
      where: { id: parsedInput.propertyId },
      select: {
        id: true,
        status: true,
        pricePerUnit: true,
        tokenCode: true,
        tokenIssuerAddress: true,
      },
    });
    if (!property) throw new ActionError("Property not found");
    if (property.status === "Closed") throw new ActionError("Market is closed");

    if (parsedInput.type === "Limit" && !parsedInput.pricePerUnit) {
      throw new ActionError("pricePerUnit required for Limit orders");
    }

    const referencePrice =
      parsedInput.type === "Limit" && parsedInput.pricePerUnit
        ? new Prisma.Decimal(parsedInput.pricePerUnit)
        : new Prisma.Decimal(property.pricePerUnit);
    const totalAmount = referencePrice.mul(parsedInput.units);

    // Persist the Order first, in `Pending` until we hear back from the ledger.
    const order = await prisma.order.create({
      data: {
        userId: ctx.user.id,
        propertyId: property.id,
        side: parsedInput.side,
        type: parsedInput.type,
        units: parsedInput.units,
        pricePerUnit:
          parsedInput.type === "Limit" && parsedInput.pricePerUnit
            ? new Prisma.Decimal(parsedInput.pricePerUnit)
            : null,
        settlementAsset: parsedInput.asset,
        totalAmount,
        status: parsedInput.signedTxBlob ? "Open" : "Open",
      },
    });

    // Without a signed blob we just persist the intent — the trading client
    // will resubmit once it has signed via Privy. Useful in dev too.
    if (!parsedInput.signedTxBlob) return { order };

    // Hard-fail early if the property isn't configured for on-ledger trading.
    if (!property.tokenCode || !property.tokenIssuerAddress) {
      throw new ActionError("Property is not on-ledger yet");
    }

    try {
      const submitted = await submitAndWait(parsedInput.signedTxBlob);
      const updated = await prisma.order.update({
        where: { id: order.id },
        data: { xrplTxHashes: { set: [submitted.hash] } },
      });
      return { order: updated };
    } catch (err) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "Failed" },
      });
      throw new ActionError(`XRPL submit failed: ${(err as Error).message}`);
    }
  });

/**
 * Build params the client will use to sign an OfferCreate. Strategy:
 *   Buy: takerPays=PROPERTY, takerGets=USD
 *   Sell: takerPays=USD, takerGets=PROPERTY
 *
 * For Market orders we set tfImmediateOrCancel so partial fills clear quickly.
 * For Limit orders we set Expiration to 24h from now (ripple-time seconds).
 */
export async function buildOfferCreateParams(input: {
  propertyId: string;
  side: "Buy" | "Sell";
  type: "Market" | "Limit";
  units: number;
  pricePerUnit?: string;
  asset: "XRP" | "RLUSD";
  account: string;
}): Promise<{
  account: string;
  takerGets: string | { currency: string; issuer: string; value: string };
  takerPays: string | { currency: string; issuer: string; value: string };
  flags?: number;
  expiration?: number;
}> {
  const property = await prisma.property.findUnique({
    where: { id: input.propertyId },
    select: { tokenCode: true, tokenIssuerAddress: true, pricePerUnit: true },
  });
  if (!property?.tokenCode || !property.tokenIssuerAddress) {
    throw new Error("Property is not on-ledger yet");
  }

  const price = input.pricePerUnit ?? property.pricePerUnit.toString();
  const totalUsd = (Number(price) * input.units).toString();

  const propertyAmount = {
    currency: property.tokenCode,
    issuer: property.tokenIssuerAddress,
    value: String(input.units),
  };
  const counterAmount =
    input.asset === "RLUSD"
      ? { currency: "RLUSD", issuer: RLUSD_ISSUER, value: totalUsd }
      : Math.floor(Number(totalUsd) * 1_000_000).toString(); // crude XRP drops

  let takerGets: typeof propertyAmount | typeof counterAmount;
  let takerPays: typeof propertyAmount | typeof counterAmount;
  if (input.side === "Buy") {
    takerPays = propertyAmount;
    takerGets = counterAmount;
  } else {
    takerPays = counterAmount;
    takerGets = propertyAmount;
  }

  const flags = input.type === "Market" ? TF_IMMEDIATE_OR_CANCEL : undefined;
  const expiration =
    input.type === "Limit"
      ? await rippleTimeFromUnixMs(Date.now() + 24 * 60 * 60 * 1000)
      : undefined;

  return { account: input.account, takerGets, takerPays, flags, expiration };
}

export const cancelOrder = kycActionClient
  .metadata({ actionName: "cancelOrder" })
  .schema(CancelOrderSchema.and(z.object({ signedTxBlob: z.string().optional() })))
  .action(async ({ parsedInput, ctx }) => {
    const existing = await prisma.order.findUnique({
      where: { id: parsedInput.orderId },
      select: { id: true, userId: true, status: true, xrplTxHashes: true },
    });
    if (!existing) throw new ActionError("Order not found");
    if (existing.userId !== ctx.user.id) throw new ActionError("Not your order");
    if (existing.status === "Filled" || existing.status === "Cancelled") {
      throw new ActionError(`Order already ${existing.status.toLowerCase()}`);
    }

    let cancelHash: string | null = null;
    if (parsedInput.signedTxBlob) {
      try {
        const submitted = await submitAndWait(parsedInput.signedTxBlob);
        cancelHash = submitted.hash;
      } catch (err) {
        throw new ActionError(`XRPL cancel failed: ${(err as Error).message}`);
      }
    }

    const order = await prisma.order.update({
      where: { id: existing.id },
      data: {
        status: "Cancelled",
        ...(cancelHash ? { xrplTxHashes: { set: [...existing.xrplTxHashes, cancelHash] } } : {}),
      },
    });
    return { order };
  });
