/**
 * Seed script — idempotent upserts of the M0 mock fixtures into Postgres.
 *
 * Run: `pnpm db:seed` (root) or `pnpm --filter @surgexrp/db seed`.
 * Requires DATABASE_URL pointing at a reachable Postgres database.
 */
import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Fixture data (mirrors packages/shared/src/mocks.ts — IDs intentionally match
// so client-side tests and SSR snapshots stay stable).
// ---------------------------------------------------------------------------

const AZURE_DESCRIPTION =
  "Perched atop the city's skyline, The Azure Penthouse is a masterclass in coastal modernism and elevated living. Designed for those who demand both high-octane energy and serene privacy, this residence offers an unparalleled vantage point over the shimmering Biscayne Bay and the Atlantic horizon.";

interface PropertyFixture {
  id: string;
  name: string;
  locationCity: string;
  locationRegion: string;
  heroImageUrl: string;
  galleryUrls: string[];
  description: string;
  developer: string;
  propertyValue: string;
  holdPeriod: string;
  bedroomCount: number | null;
  areaSqm: number | null;
  pricePerUnit: string;
  totalUnits: number;
  unitsAvailable: number;
  roiAnnualPct: string;
  minInvestmentUsd: string;
  minInvestmentUnits: number;
  tradeVolumeUsd: string | null;
  tokenIssuerAddress: string;
  tokenCode: string;
}

const ISSUER = "rLavENDERissuerPLACEHOLDERaddressXyZ12";

const PROPERTIES: PropertyFixture[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    name: "The Azure Penthouse",
    locationCity: "Miami",
    locationRegion: "Florida",
    heroImageUrl: "/mock/azure-penthouse.jpg",
    galleryUrls: [
      "/mock/azure-penthouse.jpg",
      "/mock/azure-penthouse-2.jpg",
      "/mock/azure-penthouse-3.jpg",
    ],
    description: AZURE_DESCRIPTION,
    developer: "The Azure Homes and Suites",
    propertyValue: "2581023.00",
    holdPeriod: "3-5 Years",
    bedroomCount: 4,
    areaSqm: 727,
    pricePerUnit: "430",
    totalUnits: 1_200,
    unitsAvailable: 400,
    roiAnnualPct: "11.20",
    minInvestmentUsd: "1000.00",
    minInvestmentUnits: 5,
    tradeVolumeUsd: "12587971.00",
    tokenIssuerAddress: ISSUER,
    tokenCode: "AZURE",
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    name: "Vela Commercial Tower",
    locationCity: "Austin",
    locationRegion: "Texas",
    heroImageUrl: "/mock/vela-tower.jpg",
    galleryUrls: ["/mock/vela-tower.jpg"],
    description:
      "Class-A commercial tower anchoring Austin's tech corridor with diversified tenant mix.",
    developer: "Vela Properties",
    propertyValue: "1480000.00",
    holdPeriod: "5-7 Years",
    bedroomCount: null,
    areaSqm: 4200,
    pricePerUnit: "130",
    totalUnits: 2_400,
    unitsAvailable: 810,
    roiAnnualPct: "8.40",
    minInvestmentUsd: "500.00",
    minInvestmentUnits: 5,
    tradeVolumeUsd: "256879.00",
    tokenIssuerAddress: ISSUER,
    tokenCode: "VELA",
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    name: "Coastal Retreat Villa",
    locationCity: "Malibu",
    locationRegion: "California",
    heroImageUrl: "/mock/coastal-retreat.jpg",
    galleryUrls: ["/mock/coastal-retreat.jpg"],
    description:
      "Beachfront villa with private cove access, fully managed short-term rental program.",
    developer: "Pacific Coast Estates",
    propertyValue: "1600000.00",
    holdPeriod: "3-5 Years",
    bedroomCount: 5,
    areaSqm: 540,
    pricePerUnit: "200",
    totalUnits: 8_000,
    unitsAvailable: 698,
    roiAnnualPct: "14.20",
    minInvestmentUsd: "1000.00",
    minInvestmentUnits: 5,
    tradeVolumeUsd: "1981201.00",
    tokenIssuerAddress: ISSUER,
    tokenCode: "COAST",
  },
  {
    id: "00000000-0000-0000-0000-000000000004",
    name: "Metropolitan Lofts",
    locationCity: "New Jersey",
    locationRegion: "New York",
    heroImageUrl: "/mock/metropolitan-lofts.jpg",
    galleryUrls: ["/mock/metropolitan-lofts.jpg"],
    description:
      "Boutique residential lofts steps from the Hudson waterfront with strong rental demand.",
    developer: "Metropolitan Developments",
    propertyValue: "18000000.00",
    holdPeriod: "5-7 Years",
    bedroomCount: 2,
    areaSqm: 110,
    pricePerUnit: "1500",
    totalUnits: 12_000,
    unitsAvailable: 205,
    roiAnnualPct: "9.80",
    minInvestmentUsd: "1500.00",
    minInvestmentUnits: 1,
    tradeVolumeUsd: "568713.00",
    tokenIssuerAddress: ISSUER,
    tokenCode: "METRO",
  },
  {
    id: "00000000-0000-0000-0000-000000000005",
    name: "Pasuma Penthouse",
    locationCity: "Houston",
    locationRegion: "Texas",
    heroImageUrl: "/mock/pasuma-penthouse.jpg",
    galleryUrls: ["/mock/pasuma-penthouse.jpg"],
    description:
      "Downtown penthouse with panoramic skyline views, leased to long-term corporate tenant.",
    developer: "Pasuma Holdings",
    propertyValue: "779000.00",
    holdPeriod: "3-5 Years",
    bedroomCount: 3,
    areaSqm: 320,
    pricePerUnit: "205",
    totalUnits: 3_800,
    unitsAvailable: 65,
    roiAnnualPct: "2.50",
    minInvestmentUsd: "500.00",
    minInvestmentUnits: 3,
    tradeVolumeUsd: "2587100.00",
    tokenIssuerAddress: ISSUER,
    tokenCode: "PASUMA",
  },
  {
    id: "00000000-0000-0000-0000-000000000006",
    name: "Ma Shalla Apartments",
    locationCity: "Monte Carlo",
    locationRegion: "Monaco",
    heroImageUrl: "/mock/ma-shalla.jpg",
    galleryUrls: ["/mock/ma-shalla.jpg"],
    description: "Luxury apartment complex steps from the Casino Square, full-service concierge.",
    developer: "Ma Shalla Group",
    propertyValue: "100000.00",
    holdPeriod: "3-5 Years",
    bedroomCount: 2,
    areaSqm: 180,
    pricePerUnit: "50",
    totalUnits: 2_000,
    unitsAvailable: 1_800,
    roiAnnualPct: "13.60",
    minInvestmentUsd: "250.00",
    minInvestmentUnits: 5,
    tradeVolumeUsd: "901300.00",
    tokenIssuerAddress: ISSUER,
    tokenCode: "MASHA",
  },
  {
    id: "00000000-0000-0000-0000-000000000007",
    name: "Duchess L' Crib",
    locationCity: "Madrid",
    locationRegion: "Spain",
    heroImageUrl: "/mock/duchess.jpg",
    galleryUrls: ["/mock/duchess.jpg"],
    description: "Historic residential block in central Madrid, post-renovation income-producing.",
    developer: "Duchess Estates",
    propertyValue: "5000000.00",
    holdPeriod: "5-7 Years",
    bedroomCount: 4,
    areaSqm: 410,
    pricePerUnit: "100",
    totalUnits: 50_000,
    unitsAvailable: 32_000,
    roiAnnualPct: "12.00",
    minInvestmentUsd: "500.00",
    minInvestmentUnits: 5,
    tradeVolumeUsd: "60000120.00",
    tokenIssuerAddress: ISSUER,
    tokenCode: "DUCH",
  },
  {
    id: "00000000-0000-0000-0000-000000000008",
    name: "Eye Pearl Condo",
    locationCity: "Bali",
    locationRegion: "Indonesia",
    heroImageUrl: "/mock/eye-pearl.jpg",
    galleryUrls: ["/mock/eye-pearl.jpg"],
    description: "Cliffside condo with infinity pools, premium short-term rental yield in Uluwatu.",
    developer: "Eye Pearl Resorts",
    propertyValue: "26700000.00",
    holdPeriod: "5-7 Years",
    bedroomCount: 3,
    areaSqm: 240,
    pricePerUnit: "300",
    totalUnits: 89_000,
    unitsAvailable: 66_250,
    roiAnnualPct: "6.00",
    minInvestmentUsd: "300.00",
    minInvestmentUnits: 1,
    tradeVolumeUsd: "421387.00",
    tokenIssuerAddress: ISSUER,
    tokenCode: "PEARL",
  },
  {
    id: "00000000-0000-0000-0000-000000000009",
    name: "Shanti Palazo",
    locationCity: "Chicago",
    locationRegion: "Illinois",
    heroImageUrl: "/mock/shanti-palazo.jpg",
    galleryUrls: ["/mock/shanti-palazo.jpg"],
    description: "Lakeshore palazzo conversion with stabilized residential income.",
    developer: "Shanti Group",
    propertyValue: "5000000.00",
    holdPeriod: "5-7 Years",
    bedroomCount: 4,
    areaSqm: 380,
    pricePerUnit: "100",
    totalUnits: 50_000,
    unitsAvailable: 32_000,
    roiAnnualPct: "12.00",
    minInvestmentUsd: "500.00",
    minInvestmentUnits: 5,
    tradeVolumeUsd: null,
    tokenIssuerAddress: ISSUER,
    tokenCode: "SHANTI",
  },
  {
    id: "00000000-0000-0000-0000-00000000000a",
    name: "Condo Al Cartie",
    locationCity: "South Carolina",
    locationRegion: "Tennessee",
    heroImageUrl: "/mock/condo-al-cartie.jpg",
    galleryUrls: ["/mock/condo-al-cartie.jpg"],
    description: "Mid-rise condo with on-site amenities and stable annual occupancy.",
    developer: "Al Cartie Realty",
    propertyValue: "26700000.00",
    holdPeriod: "3-5 Years",
    bedroomCount: 2,
    areaSqm: 150,
    pricePerUnit: "300",
    totalUnits: 89_000,
    unitsAvailable: 66_250,
    roiAnnualPct: "6.00",
    minInvestmentUsd: "300.00",
    minInvestmentUnits: 1,
    tradeVolumeUsd: null,
    tokenIssuerAddress: ISSUER,
    tokenCode: "ALCART",
  },
];

const USER_ID = "11111111-1111-1111-1111-111111111111";
const USER = {
  id: USER_ID,
  email: "jonathan.segwell@email",
  displayName: "Jonathan Segwell",
  xrpAddress: "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
  kycStatus: "Verified" as const,
  autoReinvest: false,
};

interface HoldingFixture {
  propertyId: string;
  unitsOwned: number;
  averageCostPerUnit: string;
}

// 10 holdings — one per property. Overview preview shows the first 4;
// "View All" shows the rest. Compound (userId, propertyId) PK prevents
// duplicates so we cap at 10.
const HOLDING_UNITS_AND_COST: Array<[number, string]> = [
  [12, "425"],
  [40, "128"],
  [25, "195"],
  [2, "1495"],
  [15, "200"],
  [100, "48"],
  [60, "98"],
  [35, "295"],
  [70, "100"],
  [20, "300"],
];
const HOLDINGS: HoldingFixture[] = PROPERTIES.map((p, i) => {
  const pair = HOLDING_UNITS_AND_COST[i];
  if (!pair) throw new Error(`Missing holding fixture at index ${i}`);
  return { propertyId: p.id, unitsOwned: pair[0], averageCostPerUnit: pair[1] };
});

function uuid(prefix: string, n: number): string {
  // Generate a deterministic UUID-ish string: `<prefix>0000-0000-0000-<seq>`.
  const seq = n.toString(16).padStart(12, "0");
  return `${prefix}-0000-0000-0000-${seq}`;
}

async function main(): Promise<void> {
  console.log("→ Seeding user");
  await prisma.user.upsert({
    where: { id: USER.id },
    update: {
      email: USER.email,
      displayName: USER.displayName,
      xrpAddress: USER.xrpAddress,
      kycStatus: USER.kycStatus,
      autoReinvest: USER.autoReinvest,
    },
    create: USER,
  });

  console.log(`→ Seeding ${PROPERTIES.length} properties`);
  for (const p of PROPERTIES) {
    const data = {
      name: p.name,
      locationCity: p.locationCity,
      locationRegion: p.locationRegion,
      heroImageUrl: p.heroImageUrl,
      galleryUrls: p.galleryUrls,
      description: p.description,
      developer: p.developer,
      propertyValue: new Prisma.Decimal(p.propertyValue),
      holdPeriod: p.holdPeriod,
      bedroomCount: p.bedroomCount,
      areaSqm: p.areaSqm,
      pricePerUnit: new Prisma.Decimal(p.pricePerUnit),
      totalUnits: p.totalUnits,
      unitsAvailable: p.unitsAvailable,
      roiAnnualPct: new Prisma.Decimal(p.roiAnnualPct),
      minInvestmentUsd: new Prisma.Decimal(p.minInvestmentUsd),
      minInvestmentUnits: p.minInvestmentUnits,
      tradeVolumeUsd: p.tradeVolumeUsd ? new Prisma.Decimal(p.tradeVolumeUsd) : null,
      tokenIssuerAddress: p.tokenIssuerAddress,
      tokenCode: p.tokenCode,
      documentsUrls: [],
      status: "Active" as const,
    };
    await prisma.property.upsert({
      where: { id: p.id },
      update: data,
      create: { id: p.id, ...data },
    });
  }

  console.log(`→ Seeding ${HOLDINGS.length} holdings`);
  for (const h of HOLDINGS) {
    await prisma.holding.upsert({
      where: {
        userId_propertyId: { userId: USER.id, propertyId: h.propertyId },
      },
      update: {
        unitsOwned: h.unitsOwned,
        averageCostPerUnit: new Prisma.Decimal(h.averageCostPerUnit),
      },
      create: {
        userId: USER.id,
        propertyId: h.propertyId,
        unitsOwned: h.unitsOwned,
        averageCostPerUnit: new Prisma.Decimal(h.averageCostPerUnit),
      },
    });
  }

  // Orders + Trades against The Azure Penthouse (first property).
  const azure = PROPERTIES[0];
  if (!azure) throw new Error("Seed fixtures missing The Azure Penthouse property");
  console.log("→ Seeding 5 orders + 30 trades for The Azure Penthouse");

  // 5 orders: 2 Open Buy, 1 Open Sell, 2 Filled.
  const orders = [
    {
      id: uuid("10000000", 1),
      side: "Buy" as const,
      type: "Limit" as const,
      units: 5,
      pricePerUnit: "428",
      status: "Open" as const,
      filledUnits: 0,
    },
    {
      id: uuid("10000000", 2),
      side: "Buy" as const,
      type: "Limit" as const,
      units: 8,
      pricePerUnit: "425",
      status: "Open" as const,
      filledUnits: 0,
    },
    {
      id: uuid("10000000", 3),
      side: "Sell" as const,
      type: "Limit" as const,
      units: 3,
      pricePerUnit: "433",
      status: "Open" as const,
      filledUnits: 0,
    },
    {
      id: uuid("10000000", 4),
      side: "Buy" as const,
      type: "Market" as const,
      units: 10,
      pricePerUnit: "430",
      status: "Filled" as const,
      filledUnits: 10,
    },
    {
      id: uuid("10000000", 5),
      side: "Sell" as const,
      type: "Limit" as const,
      units: 6,
      pricePerUnit: "431",
      status: "Filled" as const,
      filledUnits: 6,
    },
  ];

  for (const o of orders) {
    const total = (Number(o.pricePerUnit) * o.units).toFixed(2);
    await prisma.order.upsert({
      where: { id: o.id },
      update: {
        side: o.side,
        type: o.type,
        units: o.units,
        pricePerUnit: new Prisma.Decimal(o.pricePerUnit),
        settlementAsset: "RLUSD",
        totalAmount: new Prisma.Decimal(total),
        status: o.status,
        filledUnits: o.filledUnits,
        averageFillPrice: o.status === "Filled" ? new Prisma.Decimal(o.pricePerUnit) : null,
        filledAt: o.status === "Filled" ? new Date("2026-05-15T12:00:00Z") : null,
      },
      create: {
        id: o.id,
        userId: USER.id,
        propertyId: azure.id,
        side: o.side,
        type: o.type,
        units: o.units,
        pricePerUnit: new Prisma.Decimal(o.pricePerUnit),
        settlementAsset: "RLUSD",
        totalAmount: new Prisma.Decimal(total),
        status: o.status,
        filledUnits: o.filledUnits,
        averageFillPrice: o.status === "Filled" ? new Prisma.Decimal(o.pricePerUnit) : null,
        filledAt: o.status === "Filled" ? new Date("2026-05-15T12:00:00Z") : null,
      },
    });
  }

  // 30 historical trades — alternating Buy/Sell against the two filled orders.
  // Each trade references a buy order, sell order, buyer, seller. Since we only
  // have one user, the trades self-cross (acceptable for seed/demo).
  const filledBuyOrderId = uuid("10000000", 4);
  const filledSellOrderId = uuid("10000000", 5);
  for (let i = 0; i < 30; i++) {
    const id = uuid("20000000", i + 1);
    const minutesAgo = (29 - i) * 13;
    const occurredAt = new Date(Date.now() - minutesAgo * 60_000);
    const basePrice = 428 + (i % 7);
    await prisma.trade.upsert({
      where: { id },
      update: {
        propertyId: azure.id,
        units: 1 + (i % 4),
        pricePerUnit: new Prisma.Decimal(basePrice.toString()),
        settlementAsset: "RLUSD",
        xrplTxHash: `SEED-TRADE-${i + 1}`,
        occurredAt,
        buyOrderId: filledBuyOrderId,
        sellOrderId: filledSellOrderId,
        buyerUserId: USER.id,
        sellerUserId: USER.id,
      },
      create: {
        id,
        propertyId: azure.id,
        units: 1 + (i % 4),
        pricePerUnit: new Prisma.Decimal(basePrice.toString()),
        settlementAsset: "RLUSD",
        xrplTxHash: `SEED-TRADE-${i + 1}`,
        occurredAt,
        buyOrderId: filledBuyOrderId,
        sellOrderId: filledSellOrderId,
        buyerUserId: USER.id,
        sellerUserId: USER.id,
      },
    });
  }

  // YieldDistribution + YieldPayout against The Azure Penthouse for last month.
  console.log("→ Seeding yield distribution + payout");
  const distId = uuid("30000000", 1);
  const periodStart = new Date(Date.UTC(2026, 3, 1));
  const periodEnd = new Date(Date.UTC(2026, 3, 30));
  await prisma.yieldDistribution.upsert({
    where: { propertyId_periodStart: { propertyId: azure.id, periodStart } },
    update: {
      periodEnd,
      totalAmount: new Prisma.Decimal("1200.00"),
      settlementAsset: "RLUSD",
    },
    create: {
      id: distId,
      propertyId: azure.id,
      periodStart,
      periodEnd,
      totalAmount: new Prisma.Decimal("1200.00"),
      settlementAsset: "RLUSD",
    },
  });

  await prisma.yieldPayout.upsert({
    where: { distributionId_userId: { distributionId: distId, userId: USER.id } },
    update: {
      units: 12,
      amount: new Prisma.Decimal("48.00"),
      xrplTxHash: "SEED-YIELD-1",
    },
    create: {
      id: uuid("40000000", 1),
      distributionId: distId,
      userId: USER.id,
      propertyId: azure.id,
      units: 12,
      amount: new Prisma.Decimal("48.00"),
      xrplTxHash: "SEED-YIELD-1",
    },
  });

  console.log("✔ Seed complete");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
