import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";

export const txRouter = createTRPCRouter({
  status: protectedProcedure.input(z.object({ hash: z.string().min(8) })).query(({ input }) => ({
    hash: input.hash,
    status: "Confirmed" as const,
    ledgerIndex: 0,
  })),
});
