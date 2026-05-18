"use client";

import type { ReactElement } from "react";
import { ModalShell } from "../layouts/modal-shell";
import { Button } from "./button";
import { FormRow } from "./form-row";
import { LocationLabel } from "./location-label";
import { RoiBadge } from "./roi-badge";

export interface ConfirmOrderModalProperty {
  name: string;
  locationCity: string;
  locationRegion: string;
  roiAnnualPct: string;
}

export interface ConfirmOrderModalProps {
  open: boolean;
  onClose: () => void;
  side: "buy" | "sell";
  property: ConfirmOrderModalProperty;
  orderType: "market" | "limit";
  units: number;
  pricePerUnit: string;
  selectedAsset: "XRP" | "RLUSD";
  total: string;
  onConfirm: () => void;
  loading?: boolean;
}

export function ConfirmOrderModal({
  open,
  onClose,
  side,
  property,
  orderType,
  units,
  pricePerUnit,
  selectedAsset,
  total,
  onConfirm,
  loading = false,
}: ConfirmOrderModalProps): ReactElement {
  const title = side === "buy" ? "Purchase shares for" : "Sell shares for";
  const cta = side === "buy" ? "Confirm Buy" : "Confirm Sell";
  const footerNote =
    side === "buy"
      ? "The asset right will be transferred to you once trade is matched"
      : "Funds released once trade is matched";

  return (
    <ModalShell open={open} onClose={onClose} title={title} size="md">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xl font-semibold text-white">{property.name}</h3>
          <RoiBadge value={property.roiAnnualPct} />
        </div>
        <LocationLabel city={property.locationCity} region={property.locationRegion} />
      </header>

      <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-5">
        <FormRow
          label="Order type"
          value={orderType === "market" ? "Market Order" : "Limit Order"}
        />
        <FormRow
          label={side === "buy" ? "Units to buy" : "Units to sell"}
          value={units.toLocaleString()}
        />
        <FormRow label="Price per unit" value={`$${pricePerUnit}`} />
        <FormRow label="Asset for purchase" value={selectedAsset} />
        <FormRow label="Total" value={total} tone="emphasis" />
      </div>

      <footer className="space-y-3 pt-2">
        <Button variant="primary" size="lg" fullWidth onClick={onConfirm} loading={loading}>
          {cta}
        </Button>
        <p className="text-xs text-text-subtle">{footerNote}</p>
      </footer>
    </ModalShell>
  );
}
