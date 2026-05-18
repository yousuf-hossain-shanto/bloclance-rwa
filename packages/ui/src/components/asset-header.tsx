import type { ReactElement, ReactNode } from "react";
import { cn } from "../lib/cn";
import { KpiTile } from "./kpi-tile";
import { LocationLabel } from "./location-label";
import { RoiBadge } from "./roi-badge";
import { StatusPill } from "./status-pill";

export interface AssetHeaderKpi {
  label: string;
  value: ReactNode;
  secondary?: ReactNode;
  delta?: { value: string; direction: "up" | "down"; suffix?: string };
}

export type AssetHeaderVariant = "detail" | "trading";

export interface AssetHeaderProps {
  name: string;
  locationCity: string;
  locationRegion: string;
  roiAnnualPct: string;
  kpis: AssetHeaderKpi[];
  /** Trading-variant only — secondary smaller KPI row. */
  subKpis?: AssetHeaderKpi[];
  /** Trading-variant only — `Active` etc. */
  status?: "active" | "paused";
  variant?: AssetHeaderVariant;
  /** Right-side action slot — e.g. `View Property Details` link or Invest now CTA. */
  actionSlot?: ReactNode;
  className?: string;
}

export function AssetHeader({
  name,
  locationCity,
  locationRegion,
  roiAnnualPct,
  kpis,
  subKpis,
  status,
  variant = "detail",
  actionSlot,
  className,
}: AssetHeaderProps): ReactElement {
  return (
    <section className={cn("space-y-6", className)}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1
              className={cn(
                "font-semibold text-white",
                variant === "trading" ? "text-2xl sm:text-3xl" : "text-3xl sm:text-4xl",
              )}
            >
              {name}
            </h1>
            {variant === "trading" && status && (
              <StatusPill tone={status === "active" ? "success" : "neutral"}>
                {status === "active" ? "Active" : "Paused"}
              </StatusPill>
            )}
          </div>
          <LocationLabel city={locationCity} region={locationRegion} size="md" />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <RoiBadge value={roiAnnualPct} />
          {actionSlot}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {kpis.map((k) => (
          <KpiTile
            key={k.label}
            label={k.label}
            value={k.value}
            secondary={k.secondary}
            delta={k.delta}
          />
        ))}
      </div>
      {variant === "trading" && subKpis && subKpis.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {subKpis.map((k) => (
            <KpiTile key={k.label} label={k.label} value={k.value} size="sm" />
          ))}
        </div>
      )}
    </section>
  );
}
