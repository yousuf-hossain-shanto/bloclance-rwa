"use server";

import { publishJob } from "@/server/qstash-publish";
import { Prisma, prisma } from "@surgexrp/db";
import { SubmitWithdrawalSchema } from "@surgexrp/shared";
import { submitAndWait, xrpToDrops } from "@surgexrp/xrpl";
import { z } from "zod";
import { ActionError, kycActionClient } from "./safe-action";

const RLUSD_ISSUER = process.env.RLUSD_ISSUER_TESTNET ?? "";

/**
 * submitWithdrawal — persists the row immediately, then (when a signed blob
 * is supplied) submits the Payment to XRPL and stores the validated hash.
 * Without a blob the row stays `Pending` so the wallet flow can retry later.
 */
export const submitWithdrawal = kycActionClient
  .metadata({ actionName: "submitWithdrawal" })
  .schema(SubmitWithdrawalSchema.and(z.object({ signedTxBlob: z.string().optional() })))
  .action(async ({ parsedInput, ctx }) => {
    const amount = new Prisma.Decimal(parsedInput.amount);
    if (amount.lte(0)) throw new ActionError("Withdrawal amount must be positive");

    const withdrawal = await prisma.withdrawal.create({
      data: {
        userId: ctx.user.id,
        asset: parsedInput.asset,
        amount,
        destinationAddress: parsedInput.destinationAddress,
        destinationTag: parsedInput.destinationTag ?? null,
        status: "Pending",
      },
    });

    if (!parsedInput.signedTxBlob) {
      return { withdrawal };
    }

    try {
      const submitted = await submitAndWait(parsedInput.signedTxBlob);
      const updated = await prisma.withdrawal.update({
        where: { id: withdrawal.id },
        data: {
          xrplTxHash: submitted.hash,
          status: submitted.validated ? "Confirmed" : "Submitted",
          confirmedAt: submitted.validated ? new Date() : null,
        },
      });

      // If the ledger hasn't fully confirmed yet, kick off the tx-confirm
      // retry chain so we don't have to wait for the nightly reconciliation.
      // Best-effort: in dev or when QStash creds are missing, just log.
      if (!submitted.validated && submitted.hash) {
        try {
          await publishJob("tx-confirm", { hash: submitted.hash, attempt: 0 }, { delaySec: 2 });
        } catch (qErr) {
          // eslint-disable-next-line no-console
          console.error("[submitWithdrawal] failed to enqueue tx-confirm", qErr);
        }
      }

      return { withdrawal: updated };
    } catch (err) {
      await prisma.withdrawal.update({
        where: { id: withdrawal.id },
        data: { status: "Failed" },
      });
      throw new ActionError(`XRPL submit failed: ${(err as Error).message}`);
    }
  });

/**
 * Server helper called from the WithdrawModal client. Returns the unsigned
 * Payment params so the client can autofill + sign via Privy/local key.
 */
export async function buildWithdrawalPaymentParams(input: {
  account: string;
  asset: "XRP" | "RLUSD";
  amount: string;
  destinationAddress: string;
  destinationTag?: number;
}): Promise<{
  account: string;
  destination: string;
  amount: string | { currency: string; issuer: string; value: string };
  destinationTag?: number;
}> {
  if (input.asset === "XRP") {
    return {
      account: input.account,
      destination: input.destinationAddress,
      amount: await xrpToDrops(input.amount),
      destinationTag: input.destinationTag,
    };
  }
  return {
    account: input.account,
    destination: input.destinationAddress,
    amount: { currency: "RLUSD", issuer: RLUSD_ISSUER, value: input.amount },
    destinationTag: input.destinationTag,
  };
}
