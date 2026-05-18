// Mock fixtures derived from docs/screens/explore.md + docs/screens/marketplace.md.
// All UUIDs are deterministic placeholders for dev.
import type { Candle, OrderBook, PropertyCard, TradeRow } from "./types";

export const mockProperties: PropertyCard[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    name: "The Azure Penthouse",
    locationCity: "Miami",
    locationRegion: "Florida",
    heroImageUrl: "/mock/azure-penthouse.jpg",
    roiAnnualPct: "11.2",
    pricePerUnit: "430",
    unitsAvailable: 400,
    totalUnits: 1_200,
    tradeVolumeUsd: "12587971",
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    name: "Vela Commercial Tower",
    locationCity: "Austin",
    locationRegion: "Texas",
    heroImageUrl: "/mock/vela-tower.jpg",
    roiAnnualPct: "8.4",
    pricePerUnit: "130",
    unitsAvailable: 810,
    totalUnits: 2_400,
    tradeVolumeUsd: "256879",
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    name: "Coastal Retreat Villa",
    locationCity: "Malibu",
    locationRegion: "California",
    heroImageUrl: "/mock/coastal-retreat.jpg",
    roiAnnualPct: "14.2",
    pricePerUnit: "200",
    unitsAvailable: 698,
    totalUnits: 8_000,
    tradeVolumeUsd: "1981201",
  },
  {
    id: "00000000-0000-0000-0000-000000000004",
    name: "Metropolitan Lofts",
    locationCity: "New Jersey",
    locationRegion: "New York",
    heroImageUrl: "/mock/metropolitan-lofts.jpg",
    roiAnnualPct: "9.8",
    pricePerUnit: "1500",
    unitsAvailable: 205,
    totalUnits: 12_000,
    tradeVolumeUsd: "568713",
  },
  {
    id: "00000000-0000-0000-0000-000000000005",
    name: "Pasuma Penthouse",
    locationCity: "Houston",
    locationRegion: "Texas",
    heroImageUrl: "/mock/pasuma-penthouse.jpg",
    roiAnnualPct: "2.5",
    pricePerUnit: "205",
    unitsAvailable: 65,
    totalUnits: 3_800,
    tradeVolumeUsd: "2587100",
  },
  {
    id: "00000000-0000-0000-0000-000000000006",
    name: "Ma Shalla Apartments",
    locationCity: "Monte Carlo",
    locationRegion: "Monaco",
    heroImageUrl: "/mock/ma-shalla.jpg",
    roiAnnualPct: "13.6",
    pricePerUnit: "50",
    unitsAvailable: 1_800,
    totalUnits: 2_000,
    tradeVolumeUsd: "901300",
  },
  {
    id: "00000000-0000-0000-0000-000000000007",
    name: "Duchess L' Crib",
    locationCity: "Madrid",
    locationRegion: "Spain",
    heroImageUrl: "/mock/duchess.jpg",
    roiAnnualPct: "12",
    pricePerUnit: "100",
    unitsAvailable: 32_000,
    totalUnits: 50_000,
    tradeVolumeUsd: "60000120",
  },
  {
    id: "00000000-0000-0000-0000-000000000008",
    name: "Eye Pearl Condo",
    locationCity: "Bali",
    locationRegion: "Indonesia",
    heroImageUrl: "/mock/eye-pearl.jpg",
    roiAnnualPct: "6",
    pricePerUnit: "300",
    unitsAvailable: 66_250,
    totalUnits: 89_000,
    tradeVolumeUsd: "421387",
  },
  {
    id: "00000000-0000-0000-0000-000000000009",
    name: "Shanti Palazo",
    locationCity: "Chicago",
    locationRegion: "Illinois",
    heroImageUrl: "/mock/shanti-palazo.jpg",
    roiAnnualPct: "12",
    pricePerUnit: "100",
    unitsAvailable: 32_000,
    totalUnits: 50_000,
  },
  {
    id: "00000000-0000-0000-0000-00000000000a",
    name: "Condo Al Cartie",
    locationCity: "South Carolina",
    locationRegion: "Tennessee",
    heroImageUrl: "/mock/condo-al-cartie.jpg",
    roiAnnualPct: "6",
    pricePerUnit: "300",
    unitsAvailable: 66_250,
    totalUnits: 89_000,
  },
];

export const mockHoldings = [
  {
    propertyId: "00000000-0000-0000-0000-000000000001",
    unitsOwned: 12,
    averageCostPerUnit: "425",
    currentPricePerUnit: "430",
    valueUsd: "5160",
  },
  {
    propertyId: "00000000-0000-0000-0000-000000000003",
    unitsOwned: 25,
    averageCostPerUnit: "195",
    currentPricePerUnit: "200",
    valueUsd: "5000",
  },
] as const;

export const mockOrders = [
  {
    id: "10000000-0000-0000-0000-000000000001",
    propertyId: "00000000-0000-0000-0000-000000000001",
    side: "Buy" as const,
    type: "Limit" as const,
    units: 5,
    pricePerUnit: "428",
    settlementAsset: "RLUSD" as const,
    totalAmount: "2140",
    status: "Open" as const,
    filledUnits: 0,
    createdAt: new Date("2026-05-01T10:00:00Z").toISOString(),
  },
] as const;

export const mockTrades: TradeRow[] = [
  {
    id: "20000000-0000-0000-0000-000000000001",
    units: 3,
    pricePerUnit: "430",
    side: "Buy",
    occurredAt: new Date("2026-05-17T13:22:00Z").toISOString(),
    xrplTxHash: "0xMOCKHASH1",
  },
  {
    id: "20000000-0000-0000-0000-000000000002",
    units: 10,
    pricePerUnit: "429",
    side: "Sell",
    occurredAt: new Date("2026-05-17T12:11:00Z").toISOString(),
    xrplTxHash: "0xMOCKHASH2",
  },
];

export const mockOrderBook: OrderBook = {
  bids: [
    { pricePerUnit: "429", units: 12 },
    { pricePerUnit: "428", units: 30 },
    { pricePerUnit: "427", units: 45 },
  ],
  asks: [
    { pricePerUnit: "431", units: 10 },
    { pricePerUnit: "432", units: 25 },
    { pricePerUnit: "433", units: 50 },
  ],
  lastUpdated: new Date().toISOString(),
};

export const mockCandles: Candle[] = Array.from({ length: 30 }, (_, i) => {
  const base = 420 + Math.sin(i / 3) * 8;
  return {
    t: Date.UTC(2026, 3, i + 1),
    o: base.toFixed(2),
    h: (base + 3).toFixed(2),
    l: (base - 2).toFixed(2),
    c: (base + 1).toFixed(2),
    v: ((i + 1) * 120).toString(),
  };
});
