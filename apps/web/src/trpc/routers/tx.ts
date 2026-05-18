import { prisma } from "@surgexrp/db";
import { getTxStatus } from "@surgexrp/xrpl";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";

/**
 * tx.status — first consults XRPL directly (validated ledger or not yet seen),
 * then falls back to our own tables so legacy mock hashes still resolve.
 */
export const txRouter = createTRPCRouter({
  status: protectedProcedure
    .input(z.object({ hash: z.string().min(8) }))
    .query(async ({ ctx, input }) => {
      // Real XRPL lookup. We swallow not-found and treat as "Pending"; any
      // other error bubbles up as { status: 'Failed', error }.
      try {
        const live = await getTxStatus(input.hash);
        if (live.validated) {
          return {
            hash: input.hash,
            status: "Validated" as const,
            ledgerIndex: live.ledgerIndex ?? 0,
          };
        }
      } catch (err) {
        return {
          hash: input.hash,
          status: "Failed" as const,
          ledgerIndex: 0,
          error: (err as Error)?.message ?? "XRPL request failed",
        };
      }

      // Local fallback for mock hashes / queued submits.
      const [trade, purchase, withdrawal, payout, order] = await Promise.all([
        prisma.trade.findUnique({
          where: { xrplTxHash: input.hash },
          select: { id: true },
        }),
        prisma.primaryPurchase.findFirst({
          where: { xrplTxHash: input.hash, userId: ctx.user.id },
          select: { id: true, status: true },
        }),
        prisma.withdrawal.findFirst({
          where: { xrplTxHash: input.hash, userId: ctx.user.id },
          select: { id: true, status: true },
        }),
        prisma.yieldPayout.findFirst({
          where: { xrplTxHash: input.hash, userId: ctx.user.id },
          select: { id: true },
        }),
        prisma.order.findFirst({
          where: { xrplTxHashes: { has: input.hash }, userId: ctx.user.id },
          select: { id: true, status: true },
        }),
      ]);

      if (trade || payout) {
        return { hash: input.hash, status: "Validated" as const, ledgerIndex: 0 };
      }
      if (purchase?.status === "Confirmed") {
        return { hash: input.hash, status: "Validated" as const, ledgerIndex: 0 };
      }
      if (withdrawal?.status === "Confirmed") {
        return { hash: input.hash, status: "Validated" as const, ledgerIndex: 0 };
      }
      if (order?.status === "Filled") {
        return { hash: input.hash, status: "Validated" as const, ledgerIndex: 0 };
      }
      return { hash: input.hash, status: "Pending" as const, ledgerIndex: 0 };
    }),
});
