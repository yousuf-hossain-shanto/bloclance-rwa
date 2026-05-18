"use client";

import type { ReactElement } from "react";
import { ModalShell } from "../layouts/modal-shell";
import { Button } from "./button";
import { FormRow } from "./form-row";
import { LocationLabel } from "./location-label";
import { NoticeBanner } from "./notice-banner";
import { RoiBadge } from "./roi-badge";
import { SelectField } from "./select-field";
import { TextField } from "./text-field";

export interface PurchaseModalProperty {
  name: string;
  locationCity: string;
  locationRegion: string;
  roiAnnualPct: string;
  pricePerUnit: string;
  unitsAvailable: number;
  minUnits?: number;
}

export interface PurchaseModalProps {
  open: boolean;
  onClose: () => void;
  property: PurchaseModalProperty;
  units: number;
  onUnitsChange: (n: number) => void;
  selectedAsset: "XRP" | "RLUSD";
  onAssetChange: (a: "XRP" | "RLUSD") => void;
  availableBalance: string;
  total: string;
  insufficientFunds?: boolean;
  onFundWallet?: () => void;
  onSubmit: () => void;
  loading?: boolean;
}

const ASSET_OPTIONS = [
  { label: "RLUSD", value: "RLUSD" },
  { label: "XRP", value: "XRP" },
];

export function PurchaseModal({
  open,
  onClose,
  property,
  units,
  onUnitsChange,
  selectedAsset,
  onAssetChange,
  availableBalance,
  total,
  insufficientFunds = false,
  onFundWallet,
  onSubmit,
  loading = false,
}: PurchaseModalProps): ReactElement {
  return (
    <ModalShell open={open} onClose={onClose} title="Purchase shares for" size="md">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xl font-semibold text-white">{property.name}</h3>
          <RoiBadge value={property.roiAnnualPct} />
        </div>
        <LocationLabel city={property.locationCity} region={property.locationRegion} />
      </header>

      <TextField
        label="Units to buy"
        type="number"
        min={property.minUnits ?? 1}
        max={property.unitsAvailable}
        value={units}
        onChange={(e) => onUnitsChange(Number(e.target.value))}
      />
      <FormRow label="Price per unit" value={`$${property.pricePerUnit}`} />
      <FormRow label="Total" value={total} tone="emphasis" />
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <p className="text-xs uppercase tracking-wide text-text-subtle">Available balance</p>
        <p className="mt-1 text-base font-semibold text-white">{availableBalance}</p>
      </div>
      <SelectField
        label="Select Asset"
        options={ASSET_OPTIONS}
        value={selectedAsset}
        onChange={(e) => onAssetChange(e.target.value as "XRP" | "RLUSD")}
      />
      {insufficientFunds && (
        <NoticeBanner tone="error">
          Oops! insufficient funds.{" "}
          {onFundWallet && (
            <button
              type="button"
              onClick={onFundWallet}
              className="font-semibold text-gold hover:underline"
            >
              Fund Wallet
            </button>
          )}
        </NoticeBanner>
      )}

      <footer className="space-y-3 pt-2">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
          disabled={insufficientFunds}
          onClick={onSubmit}
        >
          Purchase Now
        </Button>
        <p className="text-xs text-text-subtle">
          By confirming, you agree to the offering terms and agreement
        </p>
      </footer>
    </ModalShell>
  );
}
