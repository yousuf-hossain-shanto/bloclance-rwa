import type { ReactElement, ReactNode } from "react";
import { cn } from "../lib/cn";

export interface KpiTileProps {
  label: string;
  value: ReactNode;
  delta?: { value: string; direction: "up" | "down"; suffix?: string };
  className?: string;
}

export function KpiTile({ label, value, delta, className }: KpiTileProps): ReactElement {
  return (
    <div
      className={cn(
        "rounded-2xl bg-bg-tertiary/60 border border-white/5 p-5 backdrop-blur-md",
        className,
      )}
    >
      <p className="text-xs uppercase tracking-wide text-text-subtle">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      {delta && (
        <p
          className={cn(
            "mt-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
            delta.direction === "up" ? "bg-success/20 text-success" : "bg-error/20 text-error",
          )}
        >
          {delta.direction === "up" ? "+" : "-"}
          {delta.value}
          {delta.suffix ? ` ${delta.suffix}` : ""}
        </p>
      )}
    </div>
  );
}
