import { runJob } from "@/server/job-runner";
import { cacheSet } from "@/server/redis";
import { prisma } from "@surgexrp/db";
import { type IssuedAmount, fetchBookOffers } from "@surgexrp/xrpl";

const RLUSD_ISSUER = process.env.RLUSD_ISSUER_TESTNET ?? "";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Body {
  propertyId?: string;
}

/**
 * `xrpl-poll-book` — runs every ~3s per active property (QStash schedule).
 *
 * Refreshes the order-book snapshot for one property in Redis so the
 * Marketplace UI can read a cached view without hitting the XRPL on every
 * page load.
 */
export async function POST(req: Request) {
  return runJob<Body>(req, {
    name: "xrpl-poll-book",
    // Lock per propertyId so different properties don't block each other.
    lockParam: (b) => b.propertyId,
    lockTtlSec: 10,
    run: async (body) => {
      const propertyId = body.propertyId;
      if (!propertyId) {
        return { skipped: "missing propertyId" };
      }

      const property = await prisma.property.findUnique({
        where: { id: propertyId },
        select: { id: true, tokenCode: true, tokenIssuerAddress: true, status: true },
      });

      if (!property) return { propertyId, skipped: "property not found" };
      if (!property.tokenCode || !property.tokenIssuerAddress) {
        return { propertyId, skipped: "token not issued" };
      }
      if (property.status === "Closed") {
        return { propertyId, skipped: "closed" };
      }

      // Book = property-token (TakerGets) priced in RLUSD (TakerPays).
      const tokenAmount: IssuedAmount = {
        currency: property.tokenCode,
        issuer: property.tokenIssuerAddress,
        value: "0",
      };
      const rlusdAmount: IssuedAmount = {
        currency: "524C555344000000000000000000000000000000", // RLUSD hex
        issuer: RLUSD_ISSUER,
        value: "0",
      };

      const book = await fetchBookOffers({
        takerGets: tokenAmount,
        takerPays: rlusdAmount,
      });

      await cacheSet(`book:${propertyId}`, { propertyId, book, fetchedAt: Date.now() }, 5);

      return {
        propertyId,
        offerCount: book.bids.length + book.asks.length,
        bids: book.bids.length,
        asks: book.asks.length,
      };
    },
  });
}
