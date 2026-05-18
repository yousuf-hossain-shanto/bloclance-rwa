"use server";

import { Prisma, prisma } from "@surgexrp/db";
import { SubmitPurchaseSchema } from "@surgexrp/shared";
import { ActionError, kycActionClient } from "./safe-action";

export const submitPurchase = kycActionClient
  .metadata({ actionName: "submitPurchase" })
  .schema(SubmitPurchaseSchema)
  .action(async ({ parsedInput, ctx }) => {
    if (!parsedInput.agreementAccepted) {
      throw new ActionError("You must accept the offering terms");
    }

    const property = await prisma.property.findUnique({
      where: { id: parsedInput.propertyId },
      select: {
        id: true,
        status: true,
        pricePerUnit: true,
        unitsAvailable: true,
        minInvestmentUnits: true,
      },
    });

    if (!property) throw new ActionError("Property not found");
    if (property.status !== "Active") throw new ActionError("Property is not accepting purchases");
    if (parsedInput.units < property.minInvestmentUnits) {
      throw new ActionError(`Minimum investment is ${property.minInvestmentUnits} units`);
    }
    if (parsedInput.units > property.unitsAvailable) {
      throw new ActionError("Not enough units available");
    }

    const totalAmount = new Prisma.Decimal(property.pricePerUnit).mul(parsedInput.units);

    const purchase = await prisma.primaryPurchase.create({
      data: {
        userId: ctx.user.id,
        propertyId: property.id,
        units: parsedInput.units,
        pricePerUnit: property.pricePerUnit,
        totalAmount,
        settlementAsset: parsedInput.asset,
        status: "Pending",
        agreementSignedAt: new Date(),
      },
    });

    const xrplTxHash = `MOCK_TX_${purchase.id}`;
    const updated = await prisma.primaryPurchase.update({
      where: { id: purchase.id },
      data: { xrplTxHash },
    });

    return { purchase: updated };
  });
