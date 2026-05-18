import { prisma } from "@surgexrp/db";
import { PurchasePreviewSchema } from "@surgexrp/shared";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, kycProcedure, protectedProcedure } from "../init";

export const purchasesRouter = createTRPCRouter({
  preview: kycProcedure.input(PurchasePreviewSchema).query(async ({ input }) => {
    const p = await prisma.property.findUnique({
      where: { id: input.propertyId },
      select: { pricePerUnit: true, unitsAvailable: true },
    });
    if (!p) throw new TRPCError({ code: "NOT_FOUND", message: "Property not found" });

    const unitPrice = Number(p.pricePerUnit);
    const total = unitPrice * input.units;
    const fee = total * 0.01;
    return {
      units: input.units,
      pricePerUnit: unitPrice.toFixed(2),
      total: total.toFixed(2),
      fee: fee.toFixed(2),
      asset: input.asset,
      // R1-B's `submitPurchase` action runs the actual balance check against
      // XRPL; this preview surfaces the conservative `true` so the UX stays
      // optimistic until the action returns.
      balanceSufficient: input.units <= p.unitsAvailable,
    };
  }),

  byId: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const row = await prisma.primaryPurchase.findFirst({
        where: { id: input.id, userId: ctx.user.id },
      });
      if (!row) return null;
      return {
        id: row.id,
        status: row.status,
        xrplTxHash: row.xrplTxHash ?? "",
      };
    }),
});
