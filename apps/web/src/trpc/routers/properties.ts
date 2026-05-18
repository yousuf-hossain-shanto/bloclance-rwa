import { cached } from "@/lib/redis";
import { prisma } from "@surgexrp/db";
import type { Prisma } from "@surgexrp/db";
import {
  PropertyByIdInputSchema,
  PropertyCandlesInputSchema,
  PropertyListInputSchema,
} from "@surgexrp/shared";
import type { PropertyCard, TradeRow } from "@surgexrp/shared";
import { mockCandles, mockOrderBook } from "@surgexrp/shared/mocks";
import {
  type CandleInterval,
  aggregateCandles,
  fetchAccountTx,
  fetchBookOffers,
  parseAccountTxToTrades,
} from "@surgexrp/xrpl";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../init";

/**
 * Property reads. Order-book and OHLCV now go through `@surgexrp/xrpl` when
 * the property has on-ledger `tokenCode` + `tokenIssuerAddress` configured,
 * with a 10s Redis read-through cache. Properties without on-ledger config
 * fall back to the mock fixtures so the UI keeps rendering during seed/dev.
 */

const RLUSD_ISSUER = process.env.RLUSD_ISSUER_TESTNET ?? "";

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
    const p = await prisma.property.findUnique({
      where: { id: input.id },
      select: { id: true, tokenCode: true, tokenIssuerAddress: true },
    });
    if (!p) throw new TRPCError({ code: "NOT_FOUND", message: "Property not found" });

    // No on-ledger config (seed/dev) -> mock fixture so the UI keeps rendering.
    if (!p.tokenCode || !p.tokenIssuerAddress || !RLUSD_ISSUER) {
      return mockOrderBook;
    }

    return cached(`book:${p.id}`, 10, async () => {
      try {
        return await fetchBookOffers({
          takerPays: { currency: p.tokenCode, issuer: p.tokenIssuerAddress, value: "0" },
          takerGets: { currency: "RLUSD", issuer: RLUSD_ISSUER, value: "0" },
          limit: 50,
        });
      } catch (err) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("[properties.book] xrpl fetch failed:", (err as Error)?.message);
        }
        return mockOrderBook;
      }
    });
  }),

  candles: publicProcedure.input(PropertyCandlesInputSchema).query(async ({ input }) => {
    const p = await prisma.property.findUnique({
      where: { id: input.id },
      select: { id: true, tokenCode: true, tokenIssuerAddress: true },
    });
    if (!p) throw new TRPCError({ code: "NOT_FOUND", message: "Property not found" });
    if (!p.tokenCode || !p.tokenIssuerAddress) return mockCandles;

    const interval: CandleInterval =
      input.interval === "1m" || input.interval === "5m" || input.interval === "1h"
        ? input.interval
        : "1d";
    return cached(`candles:${p.id}:${interval}:${input.range}`, 10, async () => {
      try {
        const resp = await fetchAccountTx({ account: p.tokenIssuerAddress, limit: 200 });
        const trades = parseAccountTxToTrades(resp, p.tokenIssuerAddress, p.tokenCode);
        const candles = aggregateCandles(trades, interval);
        return candles.length > 0 ? candles : mockCandles;
      } catch (err) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("[properties.candles] xrpl fetch failed:", (err as Error)?.message);
        }
        return mockCandles;
      }
    });
  }),

  trades: publicProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ input }) => {
    const rows = await prisma.trade.findMany({
      where: { propertyId: input.id },
      orderBy: { occurredAt: "desc" },
      take: 50,
    });
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
