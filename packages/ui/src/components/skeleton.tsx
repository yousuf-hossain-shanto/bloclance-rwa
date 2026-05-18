import type { ReactElement } from "react";
import { cn } from "../lib/cn";

export interface SkeletonProps {
  className?: string;
  rounded?: "sm" | "md" | "lg" | "full";
}

const roundedStyles = {
  sm: "rounded-md",
  md: "rounded-xl",
  lg: "rounded-2xl",
  full: "rounded-full",
};

export function Skeleton({ className, rounded = "md" }: SkeletonProps): ReactElement {
  return <div className={cn("animate-pulse bg-white/5", roundedStyles[rounded], className)} />;
}
