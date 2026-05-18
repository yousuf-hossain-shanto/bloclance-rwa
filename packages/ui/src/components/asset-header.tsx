import { MapPin } from "lucide-react";
import type { ReactElement, ReactNode } from "react";
import { cn } from "../lib/cn";
import { KpiTile } from "./kpi-tile";
import { RoiBadge } from "./roi-badge";

export interface AssetHeaderKpi {
  label: string;
  value: ReactNode;
}

export interface AssetHeaderProps {
  name: string;
  locationCity: string;
  locationRegion: string;
  roiAnnualPct: string;
  kpis: AssetHeaderKpi[];
  className?: string;
}

export function AssetHeader({
  name,
  locationCity,
  locationRegion,
  roiAnnualPct,
  kpis,
  className,
}: AssetHeaderProps): ReactElement {
  return (
    <section className={cn("space-y-6", className)}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">{name}</h1>
          <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-text-muted">
            <MapPin className="size-4" />
            {locationCity}, {locationRegion}
          </p>
        </div>
        <RoiBadge value={roiAnnualPct} />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {kpis.map((k) => (
          <KpiTile key={k.label} label={k.label} value={k.value} />
        ))}
      </div>
    </section>
  );
}
