"use server";

import { CancelOrderSchema, PlaceOrderSchema } from "@surgexrp/shared";
import { kycActionClient } from "./safe-action";

export const placeOrder = kycActionClient
  .metadata({ actionName: "placeOrder" })
  .schema(PlaceOrderSchema)
  .action(async ({ parsedInput }) => {
    // TODO: build OfferCreate, sign via Privy, submit
    return {
      ok: true as const,
      orderId: "00000000-0000-0000-0000-000000000000",
      txHash: "MOCK_HASH",
      input: parsedInput,
    };
  });

export const cancelOrder = kycActionClient
  .metadata({ actionName: "cancelOrder" })
  .schema(CancelOrderSchema)
  .action(async ({ parsedInput }) => {
    // TODO: build OfferCancel, sign, submit
    return { ok: true as const, orderId: parsedInput.orderId, txHash: "MOCK_HASH" };
  });
