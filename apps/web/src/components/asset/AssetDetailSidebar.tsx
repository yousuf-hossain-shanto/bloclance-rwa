"use client";

import { PurchaseFormClient } from "@/components/asset/PurchaseFormClient";
import { AuthGate } from "@/components/auth/AuthGateClient";
import { AssetAmountInput, Button, FormRow, NoticeBanner } from "@surgexrp/ui";
import { type ReactElement, useState } from "react";

export interface AssetDetailSidebarProps {
  propertyId: string;
  propertyName: string;
  locationCity: string;
  locationRegion: string;
  roiAnnualPct: string;
  pricePerUnit: string;
  unitsAvailable: number;
  /** Per spec — `$1,000 / 5 Units` for Azure Penthouse at $430/unit. */
  minUnits: number;
}

/**
 * Right-side pricing card on the Asset Detail page. Owns the units stepper
 * and the gated `Invest now` CTA. When the user is unauth, the CTA opens the
 * AuthModal via <AuthGate>; once auth'd, it opens the Purchase modal.
 */
export function AssetDetailSidebar({
  propertyId,
  propertyName,
  locationCity,
  locationRegion,
  roiAnnualPct,
  pricePerUnit,
  unitsAvailable,
  minUnits,
}: AssetDetailSidebarProps): ReactElement {
  const [units, setUnits] = useState<number>(minUnits);
  const [purchaseOpen, setPurchaseOpen] = useState<boolean>(false);

  const pricePerUnitNum = Number(pricePerUnit);
  const totalUsd = Number.isFinite(pricePerUnitNum) ? pricePerUnitNum * units : 0;

  return (
    <div className="space-y-5 rounded-2xl border border-white/5 bg-bg-tertiary/60 p-6 backdrop-blur-md">
      <div>
        <p className="text-xs uppercase tracking-wide text-text-subtle">Price per unit</p>
        <p className="mt-1 text-3xl font-semibold text-white">${pricePerUnit}</p>
      </div>
      <FormRow label="Units available" value={unitsAvailable.toLocaleString()} />
      <FormRow label="Annual ROI" value={`${roiAnnualPct}%`} />

      <AssetAmountInput
        label="Units to buy"
        value={units}
        onChange={(e) => setUnits(Math.max(minUnits, Number(e.target.value) || 0))}
        helperText={`Total $${totalUsd.toLocaleString()}`}
      />

      <AuthGate onAuthorized={() => setPurchaseOpen(true)}>
        {(open) => (
          <Button variant="primary" size="lg" fullWidth onClick={open}>
            Invest now
          </Button>
        )}
      </AuthGate>

      <NoticeBanner tone="info">
        Minimum investment is{" "}
        <span className="font-semibold text-white">$1,000 ({minUnits} Units)</span>
      </NoticeBanner>

      <PurchaseFormClient
        open={purchaseOpen}
        onClose={() => setPurchaseOpen(false)}
        propertyId={propertyId}
        propertyName={propertyName}
        locationCity={locationCity}
        locationRegion={locationRegion}
        roiAnnualPct={roiAnnualPct}
        pricePerUnit={pricePerUnit}
        unitsAvailable={unitsAvailable}
        minUnits={minUnits}
        initialUnits={units}
      />
    </div>
  );
}
