import { cached } from "@/lib/redis";
import { prisma } from "@surgexrp/db";
import { dropsToXrp, fetchAccountInfo, fetchAccountLines } from "@surgexrp/xrpl";
import { createTRPCRouter, protectedProcedure } from "../init";

/**
 * Wallet balance/deposit reads. Live XRPL fetch lands here via
 * `@surgexrp/xrpl` with a 5s Redis read-through cache. If the user doesn't
 * have a real r-address yet (Privy hasn't minted, dev placeholder), we
 * surface zeros instead of crashing.
 */
const RLUSD_ISSUER = process.env.RLUSD_ISSUER_TESTNET ?? "";

export const walletsRouter = createTRPCRouter({
  balances: protectedProcedure.query(async ({ ctx }) => {
    const addr = ctx.user.xrpAddress;
    if (!addr || addr.startsWith("privy:")) {
      return [
        { asset: "XRP" as const, balance: "0", usdEquivalent: "0" },
        { asset: "RLUSD" as const, balance: "0", usdEquivalent: "0" },
      ];
    }
    return cached(`wallet:balances:${addr}`, 5, async () => {
      try {
        const [info, lines] = await Promise.all([fetchAccountInfo(addr), fetchAccountLines(addr)]);
        const xrp = info ? await dropsToXrp(info.xrpDrops) : "0";
        const rlusdLine = lines.find(
          (l) => l.currency === "RLUSD" && (RLUSD_ISSUER === "" || l.issuer === RLUSD_ISSUER),
        );
        const rlusd = rlusdLine?.balance ?? "0";
        return [
          { asset: "XRP" as const, balance: xrp, usdEquivalent: xrp },
          { asset: "RLUSD" as const, balance: rlusd, usdEquivalent: rlusd },
        ];
      } catch (err) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("[wallets.balances] xrpl fetch failed:", (err as Error)?.message);
        }
        return [
          { asset: "XRP" as const, balance: "0", usdEquivalent: "0" },
          { asset: "RLUSD" as const, balance: "0", usdEquivalent: "0" },
        ];
      }
    });
  }),

  depositAddress: protectedProcedure.query(async ({ ctx }) => {
    const u = await prisma.user.findUnique({
      where: { id: ctx.user.id },
      select: { xrpAddress: true },
    });
    return { address: u?.xrpAddress ?? ctx.user.xrpAddress };
  }),
});
