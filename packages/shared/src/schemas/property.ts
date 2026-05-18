import { z } from "zod";
import { PaginationOffsetSchema } from "./common";

export const PropertyStatusSchema = z.enum(["Active", "SoldOut", "Closed"]);
export type PropertyStatus = z.infer<typeof PropertyStatusSchema>;

export const PropertySortSchema = z.enum(["highest-roi", "newest"]).default("highest-roi");
export type PropertySort = z.infer<typeof PropertySortSchema>;

export const PropertyFiltersSchema = z.object({
  unitPriceMin: z.number().nonnegative().optional(),
  unitPriceMax: z.number().nonnegative().optional(),
  yieldMin: z.number().nonnegative().optional(),
  yieldMax: z.number().nonnegative().optional(),
  location: z.string().optional(),
});

export const PropertyListInputSchema = PaginationOffsetSchema.extend({
  sort: PropertySortSchema.optional(),
  filters: PropertyFiltersSchema.optional(),
});
export type PropertyListInput = z.infer<typeof PropertyListInputSchema>;

export const PropertyByIdInputSchema = z.object({ id: z.string().uuid() });
export type PropertyByIdInput = z.infer<typeof PropertyByIdInputSchema>;

export const CandleIntervalSchema = z.enum(["1m", "5m", "1h", "1d"]);
export const CandleRangeSchema = z.enum(["1D", "1W", "1M", "3M", "6M", "1Y", "ALL"]);
export const CandleAxisSchema = z.enum(["price", "yield"]);

export const PropertyCandlesInputSchema = z.object({
  id: z.string().uuid(),
  interval: CandleIntervalSchema.default("1h"),
  range: CandleRangeSchema.default("1M"),
  axis: CandleAxisSchema.default("price"),
});
export type PropertyCandlesInput = z.infer<typeof PropertyCandlesInputSchema>;

export const PropertyMarketSchema = z.object({
  propertyId: z.string().uuid(),
});
