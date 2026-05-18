import { MapPin } from "lucide-react";
import type { ReactElement } from "react";
import { cn } from "../lib/cn";
import { RoiBadge } from "./roi-badge";

export interface PropertyCardData {
  id: string;
  name: string;
  locationCity: string;
  locationRegion: string;
  heroImageUrl: string;
  roiAnnualPct: string;
  pricePerUnit: string;
  unitsAvailable: number;
  totalUnits: number;
  tradeVolumeUsd?: string;
  unitsOwned?: number;
  currentValueUsd?: string;
}

export type PropertyCardVariant = "explore" | "trading" | "holding";

export interface PropertyCardProps {
  variant: PropertyCardVariant;
  data: PropertyCardData;
  onClick?: () => void;
  className?: string;
}

function formatNumber(value: number | string): string {
  const n = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(n)) return String(value);
  return n.toLocaleString();
}

function formatMoney(value: string | undefined): string {
  if (!value) return "—";
  const n = Number(value);
  if (Number.isNaN(n)) return value;
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export function PropertyCard({
  variant,
  data,
  onClick,
  className,
}: PropertyCardProps): ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-bg-tertiary text-left shadow-lg transition hover:border-white/15 hover:shadow-xl",
        className,
      )}
    >
      <div
        className="relative aspect-[4/3] w-full bg-cover bg-center"
        style={{ backgroundImage: `url(${data.heroImageUrl})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-bg-secondary/90" />
        <div className="absolute right-3 top-3">
          <RoiBadge value={data.roiAnnualPct} />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="text-lg font-semibold text-white">{data.name}</h3>
          <p className="mt-1 inline-flex items-center gap-1 text-sm text-text-muted">
            <MapPin className="size-3.5" />
            {data.locationCity}, {data.locationRegion}
          </p>
        </div>
        <dl className="mt-auto grid grid-cols-2 gap-3 border-t border-white/5 pt-4 text-sm">
          {variant === "explore" && (
            <>
              <div>
                <dt className="text-xs uppercase text-text-subtle">Price/unit</dt>
                <dd className="mt-1 font-semibold text-white">{formatMoney(data.pricePerUnit)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-text-subtle">Units avail.</dt>
                <dd className="mt-1 font-semibold text-white">
                  {formatNumber(data.unitsAvailable)} / {formatNumber(data.totalUnits)}
                </dd>
              </div>
            </>
          )}
          {variant === "trading" && (
            <>
              <div>
                <dt className="text-xs uppercase text-text-subtle">Trade volume</dt>
                <dd className="mt-1 font-semibold text-white">
                  {formatMoney(data.tradeVolumeUsd)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-text-subtle">Price/unit</dt>
                <dd className="mt-1 font-semibold text-white">{formatMoney(data.pricePerUnit)}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-xs uppercase text-text-subtle">Total units</dt>
                <dd className="mt-1 font-semibold text-white">{formatNumber(data.totalUnits)}</dd>
              </div>
            </>
          )}
          {variant === "holding" && (
            <>
              <div>
                <dt className="text-xs uppercase text-text-subtle">Units owned</dt>
                <dd className="mt-1 font-semibold text-white">
                  {formatNumber(data.unitsOwned ?? 0)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-text-subtle">Current value</dt>
                <dd className="mt-1 font-semibold text-white">
                  {formatMoney(data.currentValueUsd)}
                </dd>
              </div>
            </>
          )}
        </dl>
      </div>
    </button>
  );
}
