import { z } from "zod";

export const AssetSchema = z.enum(["XRP", "RLUSD"]);
export type Asset = z.infer<typeof AssetSchema>;

export const KycStatusSchema = z.enum(["NotVerified", "Pending", "Verified"]);
export type KycStatus = z.infer<typeof KycStatusSchema>;

/** Decimals are passed as strings to avoid JS float loss. */
export const DecimalString = z.string().regex(/^-?\d+(\.\d+)?$/, "Must be a decimal string");

export const PaginationOffsetSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});
export type PaginationOffset = z.infer<typeof PaginationOffsetSchema>;

export const PaginationCursorSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(50),
});
export type PaginationCursor = z.infer<typeof PaginationCursorSchema>;

export const XrpAddressSchema = z
  .string()
  .regex(/^r[1-9A-HJ-NP-Za-km-z]{24,34}$/, "Invalid XRPL r-address");
