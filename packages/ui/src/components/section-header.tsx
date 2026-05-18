import type { ReactElement, ReactNode } from "react";
import { cn } from "../lib/cn";

export type SectionHeaderSize = "sm" | "md" | "lg";
export type SectionHeaderAlign = "left" | "center";

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  size?: SectionHeaderSize;
  align?: SectionHeaderAlign;
  className?: string;
}

const titleStyles: Record<SectionHeaderSize, string> = {
  sm: "text-lg font-semibold",
  md: "text-xl font-semibold sm:text-2xl",
  lg: "text-3xl font-semibold sm:text-4xl",
};

const subtitleStyles: Record<SectionHeaderSize, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

export function SectionHeader({
  title,
  subtitle,
  right,
  size = "lg",
  align = "left",
  className,
}: SectionHeaderProps): ReactElement {
  const center = align === "center";
  return (
    <header
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
        size === "lg" ? "mb-6" : "mb-4",
        center && "items-center text-center sm:flex-col sm:items-center",
        className,
      )}
    >
      <div className={cn(center && "text-center")}>
        <h2 className={cn("tracking-tight text-white", titleStyles[size])}>{title}</h2>
        {subtitle && <p className={cn("mt-2 text-text-muted", subtitleStyles[size])}>{subtitle}</p>}
      </div>
      {right && !center && <div className="shrink-0">{right}</div>}
    </header>
  );
}
