import { runJob } from "@/server/job-runner";
import { Prisma, prisma } from "@surgexrp/db";
import { buildPayment, signWithSeed, submitAndWait } from "@surgexrp/xrpl";

const RLUSD_ISSUER = process.env.RLUSD_ISSUER_TESTNET ?? "";
const RLUSD_HEX = "524C555344000000000000000000000000000000";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Body {
  propertyId: string;
  periodId: string;
  holderIds: string[];
}

/**
 * `yield-drip-chunk` — pays out RLUSD yield to a batch of holders for a single
 * YieldDistribution. Idempotent via the unique `(distributionId, userId)`
 * constraint on `YieldPayout`.
 */
export async function POST(req: Request) {
  return runJob<Body>(req, {
    name: "yield-drip-chunk",
    lockParam: (b) => `${b.periodId}:${(b.holderIds ?? []).slice(0, 3).join(",")}`,
    lockTtlSec: 300,
    run: async (body) => {
      if (!body.propertyId || !body.periodId || !Array.isArray(body.holderIds)) {
        throw new Error("propertyId, periodId, holderIds required");
      }

      const distribution = await prisma.yieldDistribution.findUniqueOrThrow({
        where: { id: body.periodId },
      });

      // Compute per-unit amount over the whole property at this period.
      const totalUnitsOwned = await prisma.holding.aggregate({
        where: { propertyId: body.propertyId, unitsOwned: { gt: 0 } },
        _sum: { unitsOwned: true },
      });
      const totalUnits = totalUnitsOwned._sum.unitsOwned ?? 0;
      if (totalUnits === 0) return { paid: 0, skipped: "no units" };

      const perUnit = distribution.totalAmount.div(totalUnits);

      const issuerAddress = process.env.XRPL_ISSUER_ADDRESS ?? "";
      const issuerSeed = process.env.XRPL_ISSUER_SEED ?? "";
      if (!issuerAddress) throw new Error("XRPL_ISSUER_ADDRESS not configured");
      if (!issuerSeed) throw new Error("XRPL_ISSUER_SEED not configured");
      if (!RLUSD_ISSUER) throw new Error("RLUSD_ISSUER_TESTNET not configured");

      const holders = await prisma.user.findMany({
        where: { id: { in: body.holderIds } },
        select: {
          id: true,
          xrpAddress: true,
          holdings: {
            where: { propertyId: body.propertyId },
            select: { unitsOwned: true },
          },
        },
      });

      let paid = 0;
      let skipped = 0;
      for (const holder of holders) {
        const units = holder.holdings[0]?.unitsOwned ?? 0;
        if (units === 0) {
          skipped += 1;
          continue;
        }
        const amount = perUnit.mul(units).toDecimalPlaces(6);

        // Idempotency check: skip if a payout already exists.
        const existing = await prisma.yieldPayout.findUnique({
          where: { distributionId_userId: { distributionId: distribution.id, userId: holder.id } },
          select: { id: true },
        });
        if (existing) {
          skipped += 1;
          continue;
        }

        // Build, sign, submit RLUSD Payment from the issuer-controlled
        // distributor wallet to the holder's XRP address.
        const tx = buildPayment({
          account: issuerAddress,
          destination: holder.xrpAddress,
          amount: {
            currency: RLUSD_HEX,
            issuer: RLUSD_ISSUER,
            value: amount.toString(),
          },
        });
        const signed = await signWithSeed(tx, issuerSeed);
        const submitted = await submitAndWait(signed.tx_blob);

        try {
          await prisma.yieldPayout.create({
            data: {
              userId: holder.id,
              propertyId: body.propertyId,
              distributionId: distribution.id,
              units,
              amount: new Prisma.Decimal(amount.toString()),
              xrplTxHash: submitted.hash,
            },
          });
          paid += 1;
        } catch (err) {
          // Unique-constraint race → another worker beat us; treat as skipped.
          if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
            skipped += 1;
            continue;
          }
          throw err;
        }
      }

      return { paid, skipped, distributionId: distribution.id };
    },
  });
}
