import { prisma } from "@surgexrp/db";
import { PaginationOffsetSchema } from "@surgexrp/shared";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";

/**
 * Portfolio reads. Wallet-balance placeholders stay in `walletsRouter`; the
 * value series here is a static monthly snapshot until R2 ledger backfill.
 */
export const portfolioRouter = createTRPCRouter({
  overview: protectedProcedure.query(async ({ ctx }) => {
    const holdings = await prisma.holding.findMany({
      where: { userId: ctx.user.id },
      include: { property: true },
    });

    let totalValueUsd = 0;
    let weightedRoi = 0;
    let unitsTotal = 0;
    for (const h of holdings) {
      const pricePerUnit = Number(h.property.pricePerUnit);
      const value = pricePerUnit * h.unitsOwned;
      totalValueUsd += value;
      weightedRoi += Number(h.property.roiAnnualPct) * h.unitsOwned;
      unitsTotal += h.unitsOwned;
    }

    const totalYield = await prisma.yieldPayout.aggregate({
      where: { userId: ctx.user.id },
      _sum: { amount: true },
    });

    const avgRoiPct = unitsTotal > 0 ? (weightedRoi / unitsTotal).toFixed(2) : "0.00";

    return {
      totalValueUsd: totalValueUsd.toFixed(2),
      totalYieldUsd: totalYield._sum.amount ? totalYield._sum.amount.toString() : "0.00",
      propertiesOwned: holdings.length,
      avgRoiPct,
      // Static 4-point monthly series — R2 ledger replays real history.
      valueSeries: [
        { t: Date.UTC(2026, 1, 1), v: (totalValueUsd * 0.88).toFixed(2) },
        { t: Date.UTC(2026, 2, 1), v: (totalValueUsd * 0.93).toFixed(2) },
        { t: Date.UTC(2026, 3, 1), v: (totalValueUsd * 0.97).toFixed(2) },
        { t: Date.UTC(2026, 4, 1), v: totalValueUsd.toFixed(2) },
      ],
    };
  }),

  holdings: protectedProcedure.input(PaginationOffsetSchema).query(async ({ ctx, input }) => {
    const skip = (input.page - 1) * input.pageSize;
    const [rows, total] = await Promise.all([
      prisma.holding.findMany({
        where: { userId: ctx.user.id },
        include: { property: true },
        orderBy: { acquiredAt: "desc" },
        skip,
        take: input.pageSize,
      }),
      prisma.holding.count({ where: { userId: ctx.user.id } }),
    ]);

    const items = rows.map((h) => {
      const currentPricePerUnit = Number(h.property.pricePerUnit);
      const valueUsd = (currentPricePerUnit * h.unitsOwned).toFixed(2);
      return {
        propertyId: h.propertyId,
        unitsOwned: h.unitsOwned,
        averageCostPerUnit: h.averageCostPerUnit.toString(),
        currentPricePerUnit: currentPricePerUnit.toFixed(2),
        valueUsd,
      };
    });

    return { items, total, page: input.page, pageSize: input.pageSize };
  }),

  valueSeries: protectedProcedure
    .input(z.object({ range: z.enum(["1M", "3M", "6M", "1Y", "ALL"]).default("3M") }))
    .query(async ({ ctx }) => {
      const holdings = await prisma.holding.findMany({
        where: { userId: ctx.user.id },
        include: { property: true },
      });
      const totalValueUsd = holdings.reduce(
        (acc, h) => acc + Number(h.property.pricePerUnit) * h.unitsOwned,
        0,
      );
      return [
        { t: Date.UTC(2026, 1, 1), v: (totalValueUsd * 0.88).toFixed(2) },
        { t: Date.UTC(2026, 2, 1), v: (totalValueUsd * 0.93).toFixed(2) },
        { t: Date.UTC(2026, 3, 1), v: (totalValueUsd * 0.97).toFixed(2) },
        { t: Date.UTC(2026, 4, 1), v: totalValueUsd.toFixed(2) },
      ];
    }),
});
