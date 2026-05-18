"use client";

import type { ReactElement } from "react";
import { cn } from "../lib/cn";
import { AssetAmountInput } from "./asset-amount-input";
import { Button } from "./button";
import { FormRow } from "./form-row";
import { NoticeBanner } from "./notice-banner";
import { SelectField } from "./select-field";
import { Tabs, type TabsOption } from "./tabs";
import { TextField } from "./text-field";

export type TradeSide = "buy" | "sell";
export type OrderType = "market" | "limit";
export type SettlementAsset = "XRP" | "RLUSD";

export interface BuySellTicketProps {
  side: TradeSide;
  onSideChange: (s: TradeSide) => void;
  orderType: OrderType;
  onOrderTypeChange: (t: OrderType) => void;
  units: number;
  onUnitsChange: (n: number) => void;
  /** Limit order only — editable price. */
  pricePerUnit?: string;
  onPricePerUnitChange?: (p: string) => void;
  /** Market order — display only. */
  marketPrice?: string;
  total: string;
  availableBalance: string;
  selectedAsset: SettlementAsset;
  onAssetChange: (a: SettlementAsset) => void;
  errorText?: string;
  disclaimer?: string;
  onSubmit: () => void;
  loading?: boolean;
  className?: string;
}

const SIDE_TABS: TabsOption<TradeSide>[] = [
  { label: "Buy", value: "buy" },
  { label: "Sell", value: "sell" },
];

const ORDER_TYPE_OPTIONS = [
  { label: "Market Order", value: "market" },
  { label: "Limit Order", value: "limit" },
];

const ASSET_OPTIONS = [
  { label: "RLUSD", value: "RLUSD" },
  { label: "XRP", value: "XRP" },
];

const DEFAULT_DISCLAIMER =
  "Disclaimer: Ensure to verify the amount of units and right amount you are about to purchase to avoid over purchasing an asset. This order will be filled at the market price.";

export function BuySellTicket({
  side,
  onSideChange,
  orderType,
  onOrderTypeChange,
  units,
  onUnitsChange,
  pricePerUnit,
  onPricePerUnitChange,
  marketPrice,
  total,
  availableBalance,
  selectedAsset,
  onAssetChange,
  errorText,
  disclaimer,
  onSubmit,
  loading = false,
  className,
}: BuySellTicketProps): ReactElement {
  const ctaLabel = side === "buy" ? "Buy" : "Sell";

  return (
    <aside
      className={cn(
        "rounded-2xl border border-white/5 bg-bg-tertiary/60 p-6 backdrop-blur-md",
        className,
      )}
    >
      <Tabs
        variant="segmented"
        fullWidth
        options={SIDE_TABS}
        value={side}
        onChange={onSideChange}
        className="mb-5"
      />
      <div className="space-y-4">
        <SelectField
          label="Order Type"
          options={ORDER_TYPE_OPTIONS}
          value={orderType}
          onChange={(e) => onOrderTypeChange(e.target.value as OrderType)}
        />
        <TextField
          label="Choose Units"
          type="number"
          min={0}
          value={units}
          onChange={(e) => onUnitsChange(Number(e.target.value))}
        />
        {orderType === "limit" ? (
          <TextField
            label="Price per Unit"
            type="number"
            min={0}
            prefix="$"
            value={pricePerUnit ?? ""}
            onChange={(e) => onPricePerUnitChange?.(e.target.value)}
          />
        ) : (
          <FormRow label="Market Price" value={marketPrice ? `$${marketPrice}` : "—"} />
        )}
        {orderType === "limit" && (
          <FormRow label="Limit Price" value={pricePerUnit ? `$${pricePerUnit}` : "—"} />
        )}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-wide text-text-subtle">Available balance</p>
          <p className="mt-1 text-base font-semibold text-white">{availableBalance}</p>
        </div>
        <SelectField
          label="Select Asset"
          options={ASSET_OPTIONS}
          value={selectedAsset}
          onChange={(e) => onAssetChange(e.target.value as SettlementAsset)}
        />
        <FormRow
          tone="emphasis"
          label={side === "buy" ? "Total Payable" : "Total Receivable"}
          value={total}
        />
        {errorText && <NoticeBanner tone="error">{errorText}</NoticeBanner>}
        <Button
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
          onClick={onSubmit}
          disabled={!!errorText}
        >
          {ctaLabel}
        </Button>
        <p className="text-xs text-text-subtle">{disclaimer ?? DEFAULT_DISCLAIMER}</p>
      </div>
    </aside>
  );
}
