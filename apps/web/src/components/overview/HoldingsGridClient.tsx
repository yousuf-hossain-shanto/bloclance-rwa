"use client";

import { PropertyCard, type PropertyCardData } from "@surgexrp/ui";
import { useRouter } from "next/navigation";
import type { ReactElement } from "react";

export interface HoldingsGridClientProps {
  properties: PropertyCardData[];
}

/**
 * Grid of `<PropertyCard variant="holding">` for the Overview dashboard +
 * the "View All" sub-page. Click → routes to `/overview/assets/[id]`.
 *
 * Card-level fields like `unitsOwned` and `currentValueUsd` are derived
 * from the mock data so the holding variant has values to display.
 */
export function HoldingsGridClient({ properties }: HoldingsGridClientProps): ReactElement {
  const router = useRouter();
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {properties.map((p) => {
        const pricePerUnitNum = Number(p.pricePerUnit);
        // Mock: assume the user owns half of what's available, valued at
        // current price per unit. Good enough for the populated demo.
        const unitsOwned = Math.max(1, Math.floor((p.totalUnits - p.unitsAvailable) / 2));
        const currentValueUsd = Number.isFinite(pricePerUnitNum)
          ? String(pricePerUnitNum * unitsOwned)
          : p.tradeVolumeUsd;
        return (
          <PropertyCard
            key={p.id}
            variant="holding"
            data={{ ...p, unitsOwned, currentValueUsd }}
            onClick={() => router.push(`/overview/assets/${p.id}`)}
          />
        );
      })}
    </div>
  );
}
