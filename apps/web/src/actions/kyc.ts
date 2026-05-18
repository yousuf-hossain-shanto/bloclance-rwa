"use server";

import { prisma } from "@surgexrp/db";
import { authActionClient } from "./safe-action";

/**
 * Starts a Sumsub KYC session.
 *
 * R1 stub: flips the user's status to `Pending` and returns a mock access token.
 * R2 swaps the body for the real Sumsub server-SDK call.
 */
export const startKyc = authActionClient
  .metadata({ actionName: "startKyc" })
  .action(async ({ ctx }) => {
    const user = await prisma.user.update({
      where: { id: ctx.user.id },
      data: {
        kycStatus: ctx.user.kycStatus === "Verified" ? "Verified" : "Pending",
      },
      select: { id: true, kycStatus: true, kycProviderRef: true },
    });

    return {
      user,
      accessToken: "STUB_FOR_R2_SUMSUB",
      levelName: "basic-kyc-level",
    };
  });
