import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";

export const withdrawalsRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({ page: z.number().int().min(1).default(1) }).optional())
    .query(() => [] as Array<{ id: string; status: string; amount: string }>),

  byId: protectedProcedure.input(z.object({ id: z.string().uuid() })).query(({ input }) => ({
    id: input.id,
    asset: "XRP" as const,
    amount: "0",
    destinationAddress: "rMOCK",
    status: "Confirmed" as const,
    xrplTxHash: "MOCK_HASH",
    createdAt: new Date().toISOString(),
  })),
});
