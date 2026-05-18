import { z } from "zod";
import { AssetSchema } from "./common";

export const PurchasePreviewSchema = z.object({
  propertyId: z.string().uuid(),
  units: z.number().int().positive(),
  asset: AssetSchema,
});
export type PurchasePreviewInput = z.infer<typeof PurchasePreviewSchema>;

export const SubmitPurchaseSchema = PurchasePreviewSchema.extend({
  agreementAccepted: z.literal(true, {
    errorMap: () => ({ message: "You must accept the offering terms" }),
  }),
});
export type SubmitPurchaseInput = z.infer<typeof SubmitPurchaseSchema>;
