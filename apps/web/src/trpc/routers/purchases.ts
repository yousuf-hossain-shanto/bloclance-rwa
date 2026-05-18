import { PurchasePreviewSchema } from "@surgexrp/shared";
import { z } from "zod";
import { createTRPCRouter, kycProcedure, protectedProcedure } from "../init";

export const purchasesRouter = createTRPCRouter({
  preview: kycProcedure.input(PurchasePreviewSchema).query(({ input }) => {
    const unitPrice = 430;
    const total = unitPrice * input.units;
    const fee = total * 0.01;
    return {
      units: input.units,
      pricePerUnit: unitPrice.toFixed(2),
      total: total.toFixed(2),
      fee: fee.toFixed(2),
      asset: input.asset,
      balanceSufficient: true,
    };
  }),

  byId: protectedProcedure.input(z.object({ id: z.string().uuid() })).query(({ input }) => ({
    id: input.id,
    status: "Confirmed" as const,
    xrplTxHash: "MOCK_HASH",
  })),
});
