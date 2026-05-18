import { prisma } from "@surgexrp/db";
import type { Prisma } from "@surgexrp/db";
import {
  PropertyByIdInputSchema,
  PropertyCandlesInputSchema,
  PropertyListInputSchema,
} from "@surgexrp/shared";
import type { PropertyCard, TradeRow } from "@surgexrp/shared";
import { mockCandles, mockOrderBook } from "@surgexrp/shared/mocks";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../init";

/**
 * tRPC router for property reads. Reads are backed by Prisma; order-book and
 * candles still return mock fixtures until the XRPL adapter ships in R2 (the
 * route signatures stay stable so the UI doesn't change).
 */

function rowToCard(p: Prisma.PropertyGetPayload<Record<string, never>>): PropertyCard {
  return {
    id: p.id,
    name: p.name,
    locationCity: p.locationCity,
    locationRegion: p.locationRegion,
    heroImageUrl: p.heroImageUrl,
    roiAnnualPct: p.roiAnnualPct.toString(),
    pricePerUnit: p.pricePerUnit.toString(),
    unitsAvailable: p.unitsAvailable,
    totalUnits: p.totalUnits,
    tradeVolumeUsd: p.tradeVolumeUsd ? p.tradeVolumeUsd.toString() : undefined,
  };
}

export const propertiesRouter = createTRPCRouter({
  list: publicProcedure.input(PropertyListInputSchema).query(async ({ input }) => {
    const where: Prisma.PropertyWhereInput = { status: "Active" };
    if (input.filters?.unitPriceMin !== undefined || input.filters?.unitPriceMax !== undefined) {
      where.pricePerUnit = {
        ...(input.filters.unitPriceMin !== undefined ? { gte: input.filters.unitPriceMin } : {}),
        ...(input.filters.unitPriceMax !== undefined ? { lte: input.filters.unitPriceMax } : {}),
      };
    }
    if (input.filters?.yieldMin !== undefined || input.filters?.yieldMax !== undefined) {
      where.roiAnnualPct = {
        ...(input.filters.yieldMin !== undefined ? { gte: input.filters.yieldMin } : {}),
        ...(input.filters.yieldMax !== undefined ? { lte: input.filters.yieldMax } : {}),
      };
    }
    if (input.filters?.location) {
      where.OR = [
        { locationCity: { contains: input.filters.location, mode: "insensitive" } },
        { locationRegion: { contains: input.filters.location, mode: "insensitive" } },
      ];
    }

    const orderBy: Prisma.PropertyOrderByWithRelationInput =
      input.sort === "newest" ? { createdAt: "desc" } : { roiAnnualPct: "desc" };

    const skip = (input.page - 1) * input.pageSize;

    const [rows, total] = await Promise.all([
      prisma.property.findMany({
        where,
        orderBy,
        skip,
        take: input.pageSize,
      }),
      prisma.property.count({ where }),
    ]);

    return {
      items: rows.map(rowToCard),
      total,
      page: input.page,
      pageSize: input.pageSize,
    };
  }),

  byId: publicProcedure.input(PropertyByIdInputSchema).query(async ({ input }) => {
    const p = await prisma.property.findUnique({ where: { id: input.id } });
    if (!p) throw new TRPCError({ code: "NOT_FOUND", message: "Property not found" });
    return {
      ...rowToCard(p),
      description: p.description,
      developer: p.developer,
      bedroomCount: p.bedroomCount,
      areaSqm: p.areaSqm,
      propertyValue: p.propertyValue.toString(),
      holdPeriod: p.holdPeriod,
      minInvestmentUsd: p.minInvestmentUsd.toString(),
      minInvestmentUnits: p.minInvestmentUnits,
      documentsUrls: p.documentsUrls,
      galleryUrls: p.galleryUrls,
    };
  }),

  market: publicProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ input }) => {
    const p = await prisma.property.findUnique({ where: { id: input.id } });
    if (!p) throw new TRPCError({ code: "NOT_FOUND", message: "Property not found" });

    // Compute 24h delta from recent trades.
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentTrades = await prisma.trade.findMany({
      where: { propertyId: p.id, occurredAt: { gte: since } },
      orderBy: { occurredAt: "asc" },
    });

    const firstTrade = recentTrades[0];
    const lastTrade = recentTrades[recentTrades.length - 1];
    const lastPrice = lastTrade ? lastTrade.pricePerUnit.toString() : p.pricePerUnit.toString();
    const firstPrice = firstTrade ? Number(firstTrade.pricePerUnit) : Number(p.pricePerUnit);
    const lastPriceNum = Number(lastPrice);
    const priceChangePct =
      firstPrice > 0 ? (((lastPriceNum - firstPrice) / firstPrice) * 100).toFixed(2) : "0.00";

    const volume24h =
      recentTrades.length > 0
        ? recentTrades.reduce((acc, t) => acc + Number(t.pricePerUnit) * t.units, 0).toFixed(2)
        : p.tradeVolumeUsd
          ? p.tradeVolumeUsd.toString()
          : "0";

    return {
      propertyId: p.id,
      lastPrice,
      valuation: p.propertyValue.toString(),
      volume24h,
      unitsAvailable: p.unitsAvailable,
      priceChangePct,
    };
  }),

  book: publicProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ input }) => {
    // R2 swaps this for the XRPL adapter. We still validate the property
    // exists so the UI doesn't render stale state for a missing id.
    const exists = await prisma.property.findUnique({
      where: { id: input.id },
      select: { id: true },
    });
    if (!exists) throw new TRPCError({ code: "NOT_FOUND", message: "Property not found" });
    return mockOrderBook;
  }),

  candles: publicProcedure.input(PropertyCandlesInputSchema).query(async ({ input }) => {
    const exists = await prisma.property.findUnique({
      where: { id: input.id },
      select: { id: true },
    });
    if (!exists) throw new TRPCError({ code: "NOT_FOUND", message: "Property not found" });
    // R2 derives OHLCV from Trade rows; we return the mock series for now.
    return mockCandles;
  }),

  trades: publicProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ input }) => {
    const rows = await prisma.trade.findMany({
      where: { propertyId: input.id },
      orderBy: { occurredAt: "desc" },
      take: 50,
    });
    // Side semantics: "Buy" if the trade's buyer matches the viewer. Without
    // a viewer in scope here (public procedure), we surface raw direction
    // based on whether buyOrderId precedes sellOrderId lexicographically —
    // this is just a display hint until R2 introduces a user-aware view.
    const out: TradeRow[] = rows.map((t) => ({
      id: t.id,
      units: t.units,
      pricePerUnit: t.pricePerUnit.toString(),
      side: t.buyOrderId < t.sellOrderId ? "Buy" : "Sell",
      occurredAt: t.occurredAt.toISOString(),
      xrplTxHash: t.xrplTxHash,
    }));
    return out;
  }),
});
