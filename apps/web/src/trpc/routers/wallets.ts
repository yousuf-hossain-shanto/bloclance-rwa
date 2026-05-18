import { prisma } from "@surgexrp/db";
import { createTRPCRouter, protectedProcedure } from "../init";

/**
 * Wallet balance/deposit reads. Live XRPL fetch lands in R2 via
 * `@surgexrp/xrpl`; for now we surface placeholder values but pull the
 * deposit address straight from the user record so KYC + Privy flows stay
 * deterministic.
 */
export const walletsRouter = createTRPCRouter({
  balances: protectedProcedure.query(() => [
    { asset: "XRP" as const, balance: "658.25", usdEquivalent: "412.56" },
    { asset: "RLUSD" as const, balance: "1240.00", usdEquivalent: "1240.00" },
  ]),

  depositAddress: protectedProcedure.query(async ({ ctx }) => {
    // Prefer DB record so wallet rotation in R1-C propagates instantly.
    const u = await prisma.user.findUnique({
      where: { id: ctx.user.id },
      select: { xrpAddress: true },
    });
    return { address: u?.xrpAddress ?? ctx.user.xrpAddress };
  }),
});
