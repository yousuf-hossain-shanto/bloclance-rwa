import { prisma } from "@surgexrp/db";
import type { Prisma } from "@surgexrp/db";
import { CancelOrderSchema, ListOrdersSchema, OrderPreviewSchema } from "@surgexrp/shared";
import { z } from "zod";
import { createTRPCRouter, kycProcedure, protectedProcedure } from "../init";

function serializeOrder(o: Prisma.OrderGetPayload<Record<string, never>>) {
  return {
    id: o.id,
    propertyId: o.propertyId,
    side: o.side,
    type: o.type,
    units: o.units,
    pricePerUnit: o.pricePerUnit ? o.pricePerUnit.toString() : null,
    settlementAsset: o.settlementAsset,
    totalAmount: o.totalAmount.toString(),
    status: o.status,
    filledUnits: o.filledUnits,
    averageFillPrice: o.averageFillPrice ? o.averageFillPrice.toString() : null,
    xrplTxHashes: o.xrplTxHashes,
    createdAt: o.createdAt.toISOString(),
    filledAt: o.filledAt ? o.filledAt.toISOString() : null,
  };
}

export const ordersRouter = createTRPCRouter({
  list: protectedProcedure.input(ListOrdersSchema).query(async ({ ctx, input }) => {
    const where: Prisma.OrderWhereInput = { userId: ctx.user.id };
    if (input.status) where.status = input.status;
    if (input.propertyId) where.propertyId = input.propertyId;
    const rows = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return rows.map(serializeOrder);
  }),

  byId: protectedProcedure
    .input(z.object({ orderId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const o = await prisma.order.findFirst({
        where: { id: input.orderId, userId: ctx.user.id },
      });
      return o ? serializeOrder(o) : null;
    }),

  preview: kycProcedure.input(OrderPreviewSchema).query(async ({ input }) => {
    // Pricing source: explicit limit price if provided, otherwise the current
    // property's `pricePerUnit`. Fees and slippage remain heuristic until R2.
    let unitPrice = Number(input.pricePerUnit ?? "0");
    if (input.type === "Market" || !input.pricePerUnit) {
      const p = await prisma.property.findUnique({
        where: { id: input.propertyId },
        select: { pricePerUnit: true },
      });
      if (p) unitPrice = Number(p.pricePerUnit);
    }
    const total = unitPrice * input.units;
    const fee = total * 0.005;
    return {
      units: input.units,
      pricePerUnit: unitPrice.toFixed(2),
      total: total.toFixed(2),
      fee: fee.toFixed(2),
      slippagePct: input.type === "Market" ? "0.50" : "0.00",
      asset: input.asset,
    };
  }),

  cancel: kycProcedure.input(CancelOrderSchema).mutation(async ({ ctx, input }) => {
    // Verify ownership; R1-B's `cancelOrder` server action does the write.
    const o = await prisma.order.findFirst({
      where: { id: input.orderId, userId: ctx.user.id },
    });
    return { ok: !!o, orderId: input.orderId };
  }),
});
