import { prisma } from "@surgexrp/db";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";

export const withdrawalsRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({ page: z.number().int().min(1).default(1) }).optional())
    .query(async ({ ctx }) => {
      const rows = await prisma.withdrawal.findMany({
        where: { userId: ctx.user.id },
        orderBy: { createdAt: "desc" },
        take: 50,
      });
      return rows.map((w) => ({
        id: w.id,
        asset: w.asset,
        amount: w.amount.toString(),
        destinationAddress: w.destinationAddress,
        status: w.status,
        xrplTxHash: w.xrplTxHash,
        createdAt: w.createdAt.toISOString(),
        confirmedAt: w.confirmedAt ? w.confirmedAt.toISOString() : null,
      }));
    }),

  byId: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const w = await prisma.withdrawal.findFirst({
        where: { id: input.id, userId: ctx.user.id },
      });
      if (!w) return null;
      return {
        id: w.id,
        asset: w.asset,
        amount: w.amount.toString(),
        destinationAddress: w.destinationAddress,
        status: w.status,
        xrplTxHash: w.xrplTxHash ?? "",
        createdAt: w.createdAt.toISOString(),
      };
    }),
});
