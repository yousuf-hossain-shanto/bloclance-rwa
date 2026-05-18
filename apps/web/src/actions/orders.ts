"use server";

import { Prisma, prisma } from "@surgexrp/db";
import { CancelOrderSchema, PlaceOrderSchema } from "@surgexrp/shared";
import { ActionError, kycActionClient } from "./safe-action";

export const placeOrder = kycActionClient
  .metadata({ actionName: "placeOrder" })
  .schema(PlaceOrderSchema)
  .action(async ({ parsedInput, ctx }) => {
    const property = await prisma.property.findUnique({
      where: { id: parsedInput.propertyId },
      select: { id: true, status: true, pricePerUnit: true },
    });
    if (!property) throw new ActionError("Property not found");
    if (property.status === "Closed") throw new ActionError("Market is closed");

    if (parsedInput.type === "Limit" && !parsedInput.pricePerUnit) {
      throw new ActionError("pricePerUnit required for Limit orders");
    }

    const referencePrice =
      parsedInput.type === "Limit" && parsedInput.pricePerUnit
        ? new Prisma.Decimal(parsedInput.pricePerUnit)
        : new Prisma.Decimal(property.pricePerUnit);
    const totalAmount = referencePrice.mul(parsedInput.units);

    const order = await prisma.order.create({
      data: {
        userId: ctx.user.id,
        propertyId: property.id,
        side: parsedInput.side,
        type: parsedInput.type,
        units: parsedInput.units,
        pricePerUnit:
          parsedInput.type === "Limit" && parsedInput.pricePerUnit
            ? new Prisma.Decimal(parsedInput.pricePerUnit)
            : null,
        settlementAsset: parsedInput.asset,
        totalAmount,
        status: "Open",
      },
    });

    const xrplTxHash = `MOCK_TX_${order.id}`;
    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { xrplTxHashes: { set: [xrplTxHash] } },
    });

    return { order: updated };
  });

export const cancelOrder = kycActionClient
  .metadata({ actionName: "cancelOrder" })
  .schema(CancelOrderSchema)
  .action(async ({ parsedInput, ctx }) => {
    const existing = await prisma.order.findUnique({
      where: { id: parsedInput.orderId },
      select: { id: true, userId: true, status: true },
    });
    if (!existing) throw new ActionError("Order not found");
    if (existing.userId !== ctx.user.id) throw new ActionError("Not your order");
    if (existing.status === "Filled" || existing.status === "Cancelled") {
      throw new ActionError(`Order already ${existing.status.toLowerCase()}`);
    }

    const order = await prisma.order.update({
      where: { id: existing.id },
      data: { status: "Cancelled" },
    });
    return { order };
  });
