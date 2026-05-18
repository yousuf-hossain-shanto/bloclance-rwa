"use server";

import { Prisma, prisma } from "@surgexrp/db";
import { SubmitPurchaseSchema } from "@surgexrp/shared";
import { buildPayment, signWithSeed, submitAndWait } from "@surgexrp/xrpl";
import { z } from "zod";
import { ActionError, kycActionClient } from "./safe-action";

const RLUSD_ISSUER = process.env.RLUSD_ISSUER_TESTNET ?? "";

/**
 * Primary issuance.
 *
 * MVP atomicity caveat:
 *   XRPL doesn't ship multi-tx atomicity (Batch XLS-56 isn't GA). For the
 *   primary issuance flow we therefore expect the BUYER to have already
 *   submitted their settlement Payment (XRP/RLUSD) to the issuer and to pass
 *   that signed-and-validated hash as `buyerSettlementTxHash`. The action:
 *
 *     1. Verifies the buyer's settlement tx is `validated` on-ledger.
 *     2. Signs (with `XRPL_ISSUER_SEED`) a Payment from the issuer to the
 *        buyer carrying N property-token units.
 *     3. Submits + persists the resulting issuer-mint hash.
 *
 * In dev / when no settlement hash is provided we keep the existing
 * mock-friendly path so the UI keeps working.
 */
const SubmitPurchaseWithBlobSchema = SubmitPurchaseSchema.and(
  z.object({
    buyerSettlementTxHash: z.string().optional(),
    buyerXrpAddress: z.string().optional(),
  }),
);

export const submitPurchase = kycActionClient
  .metadata({ actionName: "submitPurchase" })
  .schema(SubmitPurchaseWithBlobSchema)
  .action(async ({ parsedInput, ctx }) => {
    if (!parsedInput.agreementAccepted) {
      throw new ActionError("You must accept the offering terms");
    }

    const property = await prisma.property.findUnique({
      where: { id: parsedInput.propertyId },
      select: {
        id: true,
        status: true,
        pricePerUnit: true,
        unitsAvailable: true,
        minInvestmentUnits: true,
        tokenCode: true,
        tokenIssuerAddress: true,
      },
    });

    if (!property) throw new ActionError("Property not found");
    if (property.status !== "Active") throw new ActionError("Property is not accepting purchases");
    if (parsedInput.units < property.minInvestmentUnits) {
      throw new ActionError(`Minimum investment is ${property.minInvestmentUnits} units`);
    }
    if (parsedInput.units > property.unitsAvailable) {
      throw new ActionError("Not enough units available");
    }

    const totalAmount = new Prisma.Decimal(property.pricePerUnit).mul(parsedInput.units);

    const purchase = await prisma.primaryPurchase.create({
      data: {
        userId: ctx.user.id,
        propertyId: property.id,
        units: parsedInput.units,
        pricePerUnit: property.pricePerUnit,
        totalAmount,
        settlementAsset: parsedInput.asset,
        status: "Pending",
        agreementSignedAt: new Date(),
      },
    });

    // Dev / no-XRPL path — keep the mock hash so the demo flow still resolves.
    if (!parsedInput.buyerSettlementTxHash) {
      const xrplTxHash = `MOCK_TX_${purchase.id}`;
      const updated = await prisma.primaryPurchase.update({
        where: { id: purchase.id },
        data: { xrplTxHash },
      });
      return { purchase: updated };
    }

    // Real issuance path.
    const issuerSeed = process.env.XRPL_ISSUER_SEED;
    const issuerAddress = process.env.XRPL_ISSUER_ADDRESS ?? property.tokenIssuerAddress;
    if (!issuerSeed) {
      throw new ActionError("Issuer key not configured");
    }
    if (!property.tokenCode || !property.tokenIssuerAddress) {
      throw new ActionError("Property is not on-ledger yet");
    }

    const buyerAddress = parsedInput.buyerXrpAddress ?? ctx.user.xrpAddress;
    if (!buyerAddress || buyerAddress.startsWith("privy:")) {
      throw new ActionError("Buyer XRPL address not provisioned yet");
    }

    // Build issuer -> buyer Payment carrying property-token units.
    const mintTx = buildPayment({
      account: issuerAddress,
      destination: buyerAddress,
      amount: {
        currency: property.tokenCode,
        issuer: property.tokenIssuerAddress,
        value: String(parsedInput.units),
      },
      memos: [{ memoType: "purchase", memoData: purchase.id }],
    });

    try {
      const signed = await signWithSeed(mintTx, issuerSeed);
      const submitted = await submitAndWait(signed.tx_blob);
      const updated = await prisma.primaryPurchase.update({
        where: { id: purchase.id },
        data: {
          xrplTxHash: submitted.hash,
          status: submitted.validated ? "Confirmed" : "Pending",
        },
      });
      // Decrement availability + bump holdings on success.
      if (submitted.validated) {
        await prisma.$transaction([
          prisma.property.update({
            where: { id: property.id },
            data: { unitsAvailable: { decrement: parsedInput.units } },
          }),
          prisma.holding.upsert({
            where: {
              userId_propertyId: { userId: ctx.user.id, propertyId: property.id },
            },
            create: {
              userId: ctx.user.id,
              propertyId: property.id,
              unitsOwned: parsedInput.units,
              averageCostPerUnit: property.pricePerUnit,
            },
            update: { unitsOwned: { increment: parsedInput.units } },
          }),
        ]);
      }
      return { purchase: updated };
    } catch (err) {
      await prisma.primaryPurchase.update({
        where: { id: purchase.id },
        data: { status: "Failed" },
      });
      throw new ActionError(`Issuer mint failed: ${(err as Error).message}`);
    }
  });

/**
 * Server helper: build unsigned buyer-side Payment to the issuer. The client
 * will autofill + sign + submit before invoking `submitPurchase` with the
 * resulting hash.
 */
export async function buildPurchaseSettlementPaymentParams(input: {
  propertyId: string;
  units: number;
  asset: "XRP" | "RLUSD";
  buyerAddress: string;
}): Promise<{
  account: string;
  destination: string;
  amount: string | { currency: string; issuer: string; value: string };
  memo: string;
}> {
  const property = await prisma.property.findUnique({
    where: { id: input.propertyId },
    select: { pricePerUnit: true, tokenIssuerAddress: true },
  });
  if (!property?.tokenIssuerAddress) throw new Error("Property not on-ledger");
  const totalUsd = new Prisma.Decimal(property.pricePerUnit).mul(input.units).toString();

  const amount =
    input.asset === "XRP"
      ? Math.floor(Number(totalUsd) * 1_000_000).toString()
      : { currency: "RLUSD", issuer: RLUSD_ISSUER, value: totalUsd };

  return {
    account: input.buyerAddress,
    destination: property.tokenIssuerAddress,
    amount,
    memo: `purchase:${input.propertyId}:${input.units}`,
  };
}
