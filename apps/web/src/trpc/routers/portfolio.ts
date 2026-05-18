import { PaginationOffsetSchema } from "@surgexrp/shared";
import { mockHoldings } from "@surgexrp/shared/mocks";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";

export const portfolioRouter = createTRPCRouter({
  overview: protectedProcedure.query(() => ({
    totalValueUsd: "10160",
    totalYieldUsd: "412.56",
    propertiesOwned: mockHoldings.length,
    avgRoiPct: "12.7",
    valueSeries: [
      { t: Date.UTC(2026, 1, 1), v: "9000" },
      { t: Date.UTC(2026, 2, 1), v: "9550" },
      { t: Date.UTC(2026, 3, 1), v: "9890" },
      { t: Date.UTC(2026, 4, 1), v: "10160" },
    ],
  })),

  holdings: protectedProcedure.input(PaginationOffsetSchema).query(({ input }) => {
    const start = (input.page - 1) * input.pageSize;
    return {
      items: mockHoldings.slice(start, start + input.pageSize),
      total: mockHoldings.length,
      page: input.page,
      pageSize: input.pageSize,
    };
  }),

  valueSeries: protectedProcedure
    .input(z.object({ range: z.enum(["1M", "3M", "6M", "1Y", "ALL"]).default("3M") }))
    .query(() => [
      { t: Date.UTC(2026, 1, 1), v: "9000" },
      { t: Date.UTC(2026, 2, 1), v: "9550" },
      { t: Date.UTC(2026, 3, 1), v: "9890" },
      { t: Date.UTC(2026, 4, 1), v: "10160" },
    ]),
});
