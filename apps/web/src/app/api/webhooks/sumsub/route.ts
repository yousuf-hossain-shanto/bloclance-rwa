import { verifyWebhookSignature } from "@/server/sumsub";
import { prisma } from "@surgexrp/db";
import { NextResponse } from "next/server";

/**
 * Sumsub webhook receiver.
 *
 *   POST /api/webhooks/sumsub
 *
 * Sumsub signs the **raw body** with `SUMSUB_WEBHOOK_SECRET` (HMAC-SHA256, hex)
 * and includes it in the `X-Payload-Digest` header. We must read the body
 * verbatim before parsing JSON to verify the signature.
 *
 * We use the `nodejs` runtime so `node:crypto` (HMAC + constant-time compare)
 * is available — the Edge runtime ships a smaller `crypto` surface and our
 * `verifyWebhookSignature` helper relies on Buffer + `timingSafeEqual`.
 *
 * Event handling (per Sumsub `applicantReviewed` payload shape):
 *   - reviewAnswer = "GREEN"  -> kycStatus = Verified, kycVerifiedAt = now
 *                                (XRPL MPTokenAuthorize signing is owned by
 *                                 R2-A's XRPL adapter — TODO hook below.)
 *   - reviewAnswer = "RED"    -> kycStatus = NotVerified + log reason
 *   - applicantPending /
 *     applicantOnHold         -> kycStatus = Pending
 *
 * All other event types are acknowledged with `{ received: true }`.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface SumsubWebhookPayload {
  applicantId?: string;
  externalUserId?: string;
  type?: string;
  reviewStatus?: string;
  reviewResult?: {
    reviewAnswer?: "GREEN" | "RED";
    reviewRejectType?: string;
    moderationComment?: string;
    rejectLabels?: string[];
  };
}

async function findUser(payload: SumsubWebhookPayload) {
  if (payload.externalUserId) {
    const u = await prisma.user.findUnique({ where: { id: payload.externalUserId } });
    if (u) return u;
  }
  if (payload.applicantId) {
    return prisma.user.findUnique({ where: { sumsubApplicantId: payload.applicantId } });
  }
  return null;
}

export async function POST(req: Request): Promise<Response> {
  const rawBody = await req.text();
  const signature = req.headers.get("x-payload-digest");

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let payload: SumsubWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as SumsubWebhookPayload;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const user = await findUser(payload);
  if (!user) {
    // Acknowledge so Sumsub stops retrying; we just don't have a user to update.
    return NextResponse.json({ received: true, matched: false });
  }

  const eventType = payload.type ?? "";

  switch (eventType) {
    case "applicantReviewed": {
      const answer = payload.reviewResult?.reviewAnswer;
      if (answer === "GREEN") {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            kycStatus: "Verified",
            kycVerifiedAt: new Date(),
            kycProviderRef: payload.applicantId ?? user.kycProviderRef,
          },
        });
        // TODO(R2-XRPL): sign + submit MPTokenAuthorize for this user via
        // the XRPL adapter so they're allow-listed on every property's MPT.
      } else if (answer === "RED") {
        const reason =
          payload.reviewResult?.moderationComment ??
          payload.reviewResult?.rejectLabels?.join(",") ??
          "rejected";
        console.warn("[sumsub] applicantReviewed RED", { userId: user.id, reason });
        await prisma.user.update({
          where: { id: user.id },
          data: { kycStatus: "NotVerified" },
        });
      }
      break;
    }
    case "applicantPending":
    case "applicantOnHold": {
      if (user.kycStatus !== "Verified") {
        await prisma.user.update({
          where: { id: user.id },
          data: { kycStatus: "Pending" },
        });
      }
      break;
    }
    default:
      // Acknowledge other events (applicantCreated, applicantWorkflowCompleted, etc.)
      break;
  }

  return NextResponse.json({ received: true });
}
