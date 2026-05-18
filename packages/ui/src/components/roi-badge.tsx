import type { ReactElement } from "react";
import { cn } from "../lib/cn";

export interface RoiBadgeProps {
  /** Percent number, e.g. "11.2" — no `%` suffix. */
  value: string | number;
  className?: string;
  variant?: "solid" | "outline";
}

export function RoiBadge({ value, className, variant = "solid" }: RoiBadgeProps): ReactElement {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        variant === "solid" && "bg-gold text-bg-primary",
        variant === "outline" && "border border-gold text-gold",
        className,
      )}
    >
      {value}% ROI
    </span>
  );
}
