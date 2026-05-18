"use server";

import { createApplicant, generateAccessToken, isSumsubConfigured } from "@/server/sumsub";
import { prisma } from "@surgexrp/db";
import { ActionError, authActionClient } from "./safe-action";

const LEVEL_NAME = "basic-kyc-level";

/**
 * Starts a Sumsub KYC session for the current user.
 *
 *  1. Ensures a Sumsub applicant exists (creates one on demand, persists
 *     `sumsubApplicantId` to `User`).
 *  2. Flips `kycStatus` to `Pending` unless the user is already `Verified`.
 *  3. Returns a short-lived WebSDK access token the client mounts into
 *     `<KycSdkClient />`.
 *
 * The final `kycStatus = Verified` flip happens server-side from the Sumsub
 * webhook (`/api/webhooks/sumsub`).
 */
export const startKyc = authActionClient
  .metadata({ actionName: "startKyc" })
  .action(async ({ ctx }) => {
    if (!isSumsubConfigured()) {
      throw new ActionError("Sumsub not configured");
    }

    let applicantId = ctx.user.sumsubApplicantId;

    if (!applicantId) {
      const created = await createApplicant(ctx.user.id, LEVEL_NAME);
      if (!created) {
        throw new ActionError("Sumsub not configured");
      }
      applicantId = created.id;
      await prisma.user.update({
        where: { id: ctx.user.id },
        data: { sumsubApplicantId: applicantId },
      });
    }

    if (ctx.user.kycStatus !== "Verified") {
      await prisma.user.update({
        where: { id: ctx.user.id },
        data: { kycStatus: "Pending" },
      });
    }

    const token = await generateAccessToken(ctx.user.id, LEVEL_NAME);
    if (!token) {
      throw new ActionError("Sumsub not configured");
    }

    return {
      accessToken: token.token,
      levelName: LEVEL_NAME,
      applicantId,
    };
  });
