import { MapPin } from "lucide-react";
import type { ReactElement } from "react";
import { cn } from "../lib/cn";

export interface LocationLabelProps {
  city: string;
  region: string;
  size?: "sm" | "md";
  className?: string;
}

export function LocationLabel({
  city,
  region,
  size = "sm",
  className,
}: LocationLabelProps): ReactElement {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-text-muted",
        size === "sm" ? "text-sm" : "text-base",
        className,
      )}
    >
      <MapPin className={size === "sm" ? "size-3.5" : "size-4"} aria-hidden />
      {city}, {region}
    </span>
  );
}
