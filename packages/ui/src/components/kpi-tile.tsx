import type { ReactElement, ReactNode } from "react";
import { cn } from "../lib/cn";
import { DeltaPill } from "./delta-pill";

export type KpiTileSize = "sm" | "md" | "lg";
export type KpiTileTone = "default" | "highlight";

export interface KpiTileProps {
  label: string;
  value: ReactNode;
  delta?: { value: string; direction: "up" | "down"; suffix?: string };
  /** Optional second line of small text below the value, e.g. `71,413 / 500,000 units`. */
  secondary?: ReactNode;
  size?: KpiTileSize;
  tone?: KpiTileTone;
  className?: string;
}

const sizeStyles: Record<KpiTileSize, { padding: string; value: string; label: string }> = {
  sm: { padding: "p-4", value: "text-lg", label: "text-[10px]" },
  md: { padding: "p-5", value: "text-2xl", label: "text-xs" },
  lg: { padding: "p-6", value: "text-3xl", label: "text-xs" },
};

const toneStyles: Record<KpiTileTone, string> = {
  default: "bg-bg-tertiary/60 border-white/5",
  highlight: "bg-gold/10 border-gold/30",
};

export function KpiTile({
  label,
  value,
  delta,
  secondary,
  size = "md",
  tone = "default",
  className,
}: KpiTileProps): ReactElement {
  const sz = sizeStyles[size];
  return (
    <div
      className={cn("rounded-2xl border backdrop-blur-md", sz.padding, toneStyles[tone], className)}
    >
      <p className={cn("uppercase tracking-wide text-text-subtle", sz.label)}>{label}</p>
      <p className={cn("mt-2 font-semibold text-white", sz.value)}>{value}</p>
      {secondary && <p className="mt-1 text-xs text-text-muted">{secondary}</p>}
      {delta && (
        <DeltaPill
          value={delta.value}
          direction={delta.direction}
          suffix={delta.suffix}
          className="mt-2"
        />
      )}
    </div>
  );
}
