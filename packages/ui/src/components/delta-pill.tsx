import type { ReactElement } from "react";
import { cn } from "../lib/cn";

export interface DeltaPillProps {
  value: string;
  direction: "up" | "down";
  suffix?: string;
  size?: "sm" | "md";
  className?: string;
}

export function DeltaPill({
  value,
  direction,
  suffix,
  size = "sm",
  className,
}: DeltaPillProps): ReactElement {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
        direction === "up" ? "bg-success/20 text-success" : "bg-error/20 text-error",
        className,
      )}
    >
      {direction === "up" ? "+" : "-"}
      {value}
      {suffix ? ` ${suffix}` : ""}
    </span>
  );
}
