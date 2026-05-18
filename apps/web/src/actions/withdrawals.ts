"use server";

import { Prisma, prisma } from "@surgexrp/db";
import { SubmitWithdrawalSchema } from "@surgexrp/shared";
import { ActionError, kycActionClient } from "./safe-action";

export const submitWithdrawal = kycActionClient
  .metadata({ actionName: "submitWithdrawal" })
  .schema(SubmitWithdrawalSchema)
  .action(async ({ parsedInput, ctx }) => {
    const amount = new Prisma.Decimal(parsedInput.amount);
    if (amount.lte(0)) throw new ActionError("Withdrawal amount must be positive");

    const withdrawal = await prisma.withdrawal.create({
      data: {
        userId: ctx.user.id,
        asset: parsedInput.asset,
        amount,
        destinationAddress: parsedInput.destinationAddress,
        destinationTag: parsedInput.destinationTag ?? null,
        status: "Pending",
      },
    });

    const xrplTxHash = `MOCK_TX_${withdrawal.id}`;
    const updated = await prisma.withdrawal.update({
      where: { id: withdrawal.id },
      data: { xrplTxHash },
    });

    return { withdrawal: updated };
  });
