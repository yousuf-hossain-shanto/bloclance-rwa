import { createTRPCRouter, protectedProcedure } from "../init";

export const walletsRouter = createTRPCRouter({
  balances: protectedProcedure.query(() => [
    { asset: "XRP" as const, balance: "658.25", usdEquivalent: "412.56" },
    { asset: "RLUSD" as const, balance: "1240.00", usdEquivalent: "1240.00" },
  ]),

  depositAddress: protectedProcedure.query(({ ctx }) => ({
    address: ctx.user.xrpAddress,
  })),
});
