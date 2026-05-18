import { z } from "zod";
import { AssetSchema, DecimalString } from "./common";

export const OrderSideSchema = z.enum(["Buy", "Sell"]);
export type OrderSide = z.infer<typeof OrderSideSchema>;

export const OrderTypeSchema = z.enum(["Market", "Limit"]);
export type OrderType = z.infer<typeof OrderTypeSchema>;

export const OrderStatusSchema = z.enum([
  "Open",
  "PartiallyFilled",
  "Filled",
  "Cancelled",
  "Expired",
  "Failed",
]);
export type OrderStatus = z.infer<typeof OrderStatusSchema>;

export const PlaceOrderSchema = z
  .object({
    propertyId: z.string().uuid(),
    side: OrderSideSchema,
    type: OrderTypeSchema,
    units: z.number().int().positive(),
    pricePerUnit: DecimalString.optional(),
    asset: AssetSchema,
  })
  .refine((d) => d.type === "Market" || !!d.pricePerUnit, {
    message: "pricePerUnit required for Limit orders",
    path: ["pricePerUnit"],
  });
export type PlaceOrderInput = z.infer<typeof PlaceOrderSchema>;

export const OrderPreviewSchema = PlaceOrderSchema;
export type OrderPreviewInput = z.infer<typeof OrderPreviewSchema>;

export const CancelOrderSchema = z.object({
  orderId: z.string().uuid(),
});
export type CancelOrderInput = z.infer<typeof CancelOrderSchema>;

export const ListOrdersSchema = z.object({
  status: OrderStatusSchema.optional(),
  propertyId: z.string().uuid().optional(),
});
export type ListOrdersInput = z.infer<typeof ListOrdersSchema>;
