import {
  PropertyByIdInputSchema,
  PropertyCandlesInputSchema,
  PropertyListInputSchema,
} from "@surgexrp/shared";
import { mockCandles, mockOrderBook, mockProperties, mockTrades } from "@surgexrp/shared/mocks";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../init";

export const propertiesRouter = createTRPCRouter({
  list: publicProcedure.input(PropertyListInputSchema).query(({ input }) => {
    const sorted = [...mockProperties].sort((a, b) =>
      input.sort === "newest"
        ? a.id.localeCompare(b.id)
        : Number(b.roiAnnualPct) - Number(a.roiAnnualPct),
    );
    const start = (input.page - 1) * input.pageSize;
    return {
      items: sorted.slice(start, start + input.pageSize),
      total: sorted.length,
      page: input.page,
      pageSize: input.pageSize,
    };
  }),

  byId: publicProcedure.input(PropertyByIdInputSchema).query(({ input }) => {
    const item = mockProperties.find((p) => p.id === input.id) ?? mockProperties[0];
    if (!item) throw new TRPCError({ code: "NOT_FOUND", message: "Property not found" });
    return {
      ...item,
      description:
        "Perched atop the city's skyline, The Azure Penthouse is a masterclass in coastal modernism and elevated living. Designed for those who demand both high-octane energy and serene privacy.",
      developer: "The Azure Homes and Suites",
      bedroomCount: 4,
      areaSqm: 727,
      propertyValue: "2581023",
      holdPeriod: "3-5 Years",
      minInvestmentUsd: "1000",
      minInvestmentUnits: 5,
      documentsUrls: [],
      galleryUrls: [],
    };
  }),

  market: publicProcedure.input(z.object({ id: z.string().uuid() })).query(({ input }) => {
    const p = mockProperties.find((x) => x.id === input.id) ?? mockProperties[0];
    if (!p) throw new TRPCError({ code: "NOT_FOUND", message: "Property not found" });
    return {
      propertyId: p.id,
      lastPrice: p.pricePerUnit,
      valuation: "2581023",
      volume24h: p.tradeVolumeUsd ?? "0",
      unitsAvailable: p.unitsAvailable,
      priceChangePct: "1.2",
    };
  }),

  book: publicProcedure.input(z.object({ id: z.string().uuid() })).query(() => mockOrderBook),

  candles: publicProcedure.input(PropertyCandlesInputSchema).query(() => mockCandles),

  trades: publicProcedure.input(z.object({ id: z.string().uuid() })).query(() => mockTrades),
});
