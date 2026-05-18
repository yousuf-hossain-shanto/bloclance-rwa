"use server";

import { prisma } from "@surgexrp/db";
import { ToggleAutoReinvestSchema } from "@surgexrp/shared";
import { authActionClient } from "./safe-action";

export const toggleAutoReinvest = authActionClient
  .metadata({ actionName: "toggleAutoReinvest" })
  .schema(ToggleAutoReinvestSchema)
  .action(async ({ parsedInput, ctx }) => {
    const user = await prisma.user.update({
      where: { id: ctx.user.id },
      data: { autoReinvest: parsedInput.enabled },
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        kycStatus: true,
        xrpAddress: true,
        autoReinvest: true,
      },
    });
    return { user };
  });
