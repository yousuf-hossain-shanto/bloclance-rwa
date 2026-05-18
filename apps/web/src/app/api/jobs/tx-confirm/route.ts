import { runJob } from "@/server/job-runner";
import { publishJob } from "@/server/qstash-publish";
import { getTxStatus } from "@/server/xrpl-status";
import { prisma } from "@surgexrp/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Body {
  hash: string;
  attempt?: number;
}

const RETRY_DELAYS_SEC = [2, 5, 10, 30, 60];
const MAX_ATTEMPTS = RETRY_DELAYS_SEC.length;

/**
 * `tx-confirm` — short-loop confirmation helper. Enqueued by submit actions
 * (e.g. `submitWithdrawal`) right after they push a tx to the ledger.
 *
 * Polls `getTxStatus` with exponential-ish backoff (2/5/10/30/60s). Once
 * validated, flips the matching DB row. After 5 misses, gives up and lets
 * the nightly `reconciliation` job take over.
 */
export async function POST(req: Request) {
  return runJob<Body>(req, {
    name: "tx-confirm",
    lockParam: (b) => `${b.hash}:${b.attempt ?? 0}`,
    lockTtlSec: 30,
    run: async (body) => {
      if (!body.hash) throw new Error("hash required");
      const attempt = body.attempt ?? 0;
      const status = await getTxStatus(body.hash);

      if (status.validated) {
        const updates = await Promise.all([
          prisma.withdrawal.updateMany({
            where: { xrplTxHash: body.hash, status: { in: ["Pending", "Submitted"] } },
            data: { status: "Confirmed", confirmedAt: new Date() },
          }),
          prisma.primaryPurchase.updateMany({
            where: { xrplTxHash: body.hash, status: "Pending" },
            data: { status: "Confirmed" },
          }),
        ]);
        const rowsUpdated = updates.reduce((sum, u) => sum + u.count, 0);
        return { hash: body.hash, attempt, validated: true, rowsUpdated };
      }

      if (attempt < MAX_ATTEMPTS) {
        const delay = RETRY_DELAYS_SEC[attempt] ?? 60;
        await publishJob(
          "tx-confirm",
          { hash: body.hash, attempt: attempt + 1 },
          { delaySec: delay },
        );
        return { hash: body.hash, attempt, validated: false, requeuedIn: delay };
      }

      // Out of attempts — log and let `reconciliation` pick it up nightly.
      // eslint-disable-next-line no-console
      console.error("[tx-confirm] stuck after max attempts", { hash: body.hash });
      return { hash: body.hash, attempt, validated: false, giveUp: true };
    },
  });
}
