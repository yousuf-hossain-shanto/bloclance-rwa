import { z } from "zod";
import { AssetSchema, DecimalString, XrpAddressSchema } from "./common";

export const SubmitWithdrawalSchema = z.object({
  asset: AssetSchema,
  amount: DecimalString,
  destinationAddress: XrpAddressSchema,
  destinationTag: z.number().int().nonnegative().optional(),
});
export type SubmitWithdrawalInput = z.infer<typeof SubmitWithdrawalSchema>;
