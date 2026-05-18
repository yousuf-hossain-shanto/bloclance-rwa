import { prisma } from "@surgexrp/db";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";

/**
 * tx.status — resolves a single XRPL tx hash against any of the persisted
 * record tables (Order via `xrplTxHashes`, Trade, PrimaryPurchase,
 * Withdrawal, YieldPayout). Returns `Pending` if not found yet — the live
 * XRPL polling adapter in R2 fills the gap.
 */
export const txRouter = createTRPCRouter({
  status: protectedProcedure
    .input(z.object({ hash: z.string().min(8) }))
    .query(async ({ ctx, input }) => {
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
        return { hash: input.hash, status: "Confirmed" as const, ledgerIndex: 0 };
      }
      if (purchase) {
        return {
          hash: input.hash,
          status: purchase.status === "Confirmed" ? ("Confirmed" as const) : ("Pending" as const),
          ledgerIndex: 0,
        };
      }
      if (withdrawal) {
        return {
          hash: input.hash,
          status: withdrawal.status === "Confirmed" ? ("Confirmed" as const) : ("Pending" as const),
          ledgerIndex: 0,
        };
      }
      if (order) {
        return {
          hash: input.hash,
          status: order.status === "Filled" ? ("Confirmed" as const) : ("Pending" as const),
          ledgerIndex: 0,
        };
      }
      return { hash: input.hash, status: "Pending" as const, ledgerIndex: 0 };
    }),
});
