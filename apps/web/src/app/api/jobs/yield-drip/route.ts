import { runJob } from "@/server/job-runner";
import { publishJob } from "@/server/qstash-publish";
import { prisma } from "@surgexrp/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Body {
  propertyId: string;
  /** Optional explicit YieldDistribution id. If absent, we create the current period. */
  periodId?: string;
  /** Optional: total amount to distribute (RLUSD). Pulled from property.financials if absent. */
  totalAmount?: string;
}

const CHUNK_SIZE = 50;

/**
 * `yield-drip` — monthly orchestrator. QStash schedules this once per property
 * per month. Fan-out happens by publishing chunked `yield-drip-chunk` messages.
 */
export async function POST(req: Request) {
  return runJob<Body>(req, {
    name: "yield-drip",
    lockParam: (b) => `${b.propertyId}:${b.periodId ?? "current"}`,
    lockTtlSec: 300,
    run: async (body) => {
      if (!body.propertyId) throw new Error("propertyId required");

      const property = await prisma.property.findUnique({
        where: { id: body.propertyId },
        select: { id: true, financials: true, roiAnnualPct: true, propertyValue: true },
      });
      if (!property) throw new Error(`property ${body.propertyId} not found`);

      // Resolve or create the YieldDistribution row for this period.
      const now = new Date();
      const periodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
      const periodEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));

      // Monthly amount = propertyValue * roiAnnualPct / 100 / 12 (default if not specified).
      const monthlyAmount =
        body.totalAmount ??
        property.propertyValue.mul(property.roiAnnualPct).div(100).div(12).toFixed(6);

      const distribution = body.periodId
        ? await prisma.yieldDistribution.findUniqueOrThrow({ where: { id: body.periodId } })
        : await prisma.yieldDistribution.upsert({
            where: {
              propertyId_periodStart: { propertyId: property.id, periodStart },
            },
            create: {
              propertyId: property.id,
              periodStart,
              periodEnd,
              totalAmount: monthlyAmount,
              settlementAsset: "RLUSD",
            },
            update: {},
          });

      // Fetch all holders for this property.
      const holdings = await prisma.holding.findMany({
        where: { propertyId: property.id, unitsOwned: { gt: 0 } },
        select: { userId: true },
      });

      if (holdings.length === 0) {
        return { distributionId: distribution.id, chunks: 0, holders: 0 };
      }

      // Skip holders that already received this distribution (idempotent restart).
      const paidUserIds = new Set(
        (
          await prisma.yieldPayout.findMany({
            where: { distributionId: distribution.id },
            select: { userId: true },
          })
        ).map((p) => p.userId),
      );
      const pending = holdings.map((h) => h.userId).filter((id) => !paidUserIds.has(id));

      // Chunk and publish.
      const chunks: string[] = [];
      for (let i = 0; i < pending.length; i += CHUNK_SIZE) {
        const slice = pending.slice(i, i + CHUNK_SIZE);
        const { messageId } = await publishJob("yield-drip-chunk", {
          propertyId: property.id,
          periodId: distribution.id,
          holderIds: slice,
        });
        chunks.push(messageId);
      }

      return {
        distributionId: distribution.id,
        chunks: chunks.length,
        holders: pending.length,
      };
    },
  });
}
