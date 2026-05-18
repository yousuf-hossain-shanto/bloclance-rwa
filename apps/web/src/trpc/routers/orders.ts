import { CancelOrderSchema, ListOrdersSchema, OrderPreviewSchema } from "@surgexrp/shared";
import { mockOrders } from "@surgexrp/shared/mocks";
import { z } from "zod";
import { createTRPCRouter, kycProcedure, protectedProcedure } from "../init";

export const ordersRouter = createTRPCRouter({
  list: protectedProcedure.input(ListOrdersSchema).query(({ input }) => {
    return mockOrders.filter(
      (o) =>
        (!input.status || o.status === input.status) &&
        (!input.propertyId || o.propertyId === input.propertyId),
    );
  }),

  byId: protectedProcedure
    .input(z.object({ orderId: z.string().uuid() }))
    .query(({ input }) => mockOrders.find((o) => o.id === input.orderId) ?? null),

  preview: kycProcedure.input(OrderPreviewSchema).query(({ input }) => {
    const unitPrice = Number(input.pricePerUnit ?? "430");
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

  cancel: kycProcedure
    .input(CancelOrderSchema)
    .mutation(({ input }) => ({ ok: true, orderId: input.orderId })),
});
