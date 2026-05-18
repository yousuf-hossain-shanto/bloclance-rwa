import type { ReactElement, ReactNode } from "react";
import { cn } from "../lib/cn";

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  right,
  className,
}: SectionHeaderProps): ReactElement {
  return (
    <header
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-6",
        className,
      )}
    >
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 text-base text-text-muted">{subtitle}</p>}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </header>
  );
}
