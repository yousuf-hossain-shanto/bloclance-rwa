import { runJob } from "@/server/job-runner";
import { getTxStatus } from "@/server/xrpl-status";
import { prisma } from "@surgexrp/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * `reconciliation` — nightly drift check.
 *
 * For every pending row with an `xrplTxHash`, ask the ledger if it's validated.
 * Flip status accordingly. Anything stuck > 24h without resolution is logged
 * loudly so on-call can investigate.
 */
export async function POST(req: Request) {
  return runJob(req, {
    name: "reconciliation",
    lockTtlSec: 600,
    run: async () => {
      const stuckThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000);
      let reconciled = 0;
      let stuck = 0;

      // --- Primary purchases -------------------------------------------------
      const purchases = await prisma.primaryPurchase.findMany({
        where: { status: "Pending", xrplTxHash: { not: null } },
        select: { id: true, xrplTxHash: true, createdAt: true },
      });
      for (const row of purchases) {
        if (!row.xrplTxHash) continue;
        const status = await getTxStatus(row.xrplTxHash);
        if (status.validated) {
          await prisma.primaryPurchase.update({
            where: { id: row.id },
            data: { status: "Confirmed" },
          });
          reconciled += 1;
        } else if (row.createdAt < stuckThreshold) {
          stuck += 1;
          // eslint-disable-next-line no-console
          console.error("[reconciliation] stuck PrimaryPurchase", {
            id: row.id,
            hash: row.xrplTxHash,
          });
        }
      }

      // --- Withdrawals -------------------------------------------------------
      const withdrawals = await prisma.withdrawal.findMany({
        where: {
          status: { in: ["Pending", "Submitted"] },
          xrplTxHash: { not: null },
        },
        select: { id: true, xrplTxHash: true, createdAt: true },
      });
      for (const row of withdrawals) {
        if (!row.xrplTxHash) continue;
        const status = await getTxStatus(row.xrplTxHash);
        if (status.validated) {
          await prisma.withdrawal.update({
            where: { id: row.id },
            data: { status: "Confirmed", confirmedAt: new Date() },
          });
          reconciled += 1;
        } else if (row.createdAt < stuckThreshold) {
          stuck += 1;
          // eslint-disable-next-line no-console
          console.error("[reconciliation] stuck Withdrawal", {
            id: row.id,
            hash: row.xrplTxHash,
          });
        }
      }

      // --- Orders ------------------------------------------------------------
      // Orders may have multiple hashes (xrplTxHashes). We treat the order as
      // confirmed if *any* hash is validated — partial-fill detail is handled
      // by trade-ingestion elsewhere.
      const orders = await prisma.order.findMany({
        where: { status: "Open", xrplTxHashes: { isEmpty: false } },
        select: { id: true, xrplTxHashes: true, createdAt: true },
      });
      for (const row of orders) {
        let anyValidated = false;
        for (const hash of row.xrplTxHashes) {
          const status = await getTxStatus(hash);
          if (status.validated) {
            anyValidated = true;
            break;
          }
        }
        if (anyValidated) {
          await prisma.order.update({
            where: { id: row.id },
            data: { status: "Filled", filledAt: new Date() },
          });
          reconciled += 1;
        } else if (row.createdAt < stuckThreshold) {
          stuck += 1;
          // eslint-disable-next-line no-console
          console.error("[reconciliation] stuck Order", {
            id: row.id,
            hashes: row.xrplTxHashes,
          });
        }
      }

      return { reconciled, stuck };
    },
  });
}
