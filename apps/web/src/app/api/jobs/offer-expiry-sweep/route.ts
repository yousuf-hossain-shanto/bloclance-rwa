import { runJob } from "@/server/job-runner";
import { prisma } from "@surgexrp/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * `offer-expiry-sweep` — hourly bookkeeping safety net.
 *
 * XRPL handles offer expiry natively via the `Expiration` field; this job
 * just keeps our DB in sync by flipping `Order` rows older than 30d to
 * `Expired`. Real cancellation happened on-ledger long before.
 */
export async function POST(req: Request) {
  return runJob(req, {
    name: "offer-expiry-sweep",
    lockTtlSec: 300,
    run: async () => {
      const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const result = await prisma.order.updateMany({
        where: {
          type: "Limit",
          status: "Open",
          createdAt: { lt: cutoff },
        },
        data: { status: "Expired" },
      });
      return { expired: result.count };
    },
  });
}
