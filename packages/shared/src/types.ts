import type { Asset } from "./schemas/common";

export type Money = { asset: Asset; amount: string };

export interface PropertyCard {
  id: string;
  name: string;
  locationCity: string;
  locationRegion: string;
  heroImageUrl: string;
  roiAnnualPct: string;
  pricePerUnit: string;
  unitsAvailable: number;
  totalUnits: number;
  /** Marketplace only */
  tradeVolumeUsd?: string;
}

export interface OrderBookLevel {
  pricePerUnit: string;
  units: number;
}

export interface OrderBook {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  lastUpdated: string;
}

export interface Candle {
  t: number; // unix ms
  o: string;
  h: string;
  l: string;
  c: string;
  v: string;
}

export interface TradeRow {
  id: string;
  units: number;
  pricePerUnit: string;
  side: "Buy" | "Sell";
  occurredAt: string;
  xrplTxHash: string;
}
