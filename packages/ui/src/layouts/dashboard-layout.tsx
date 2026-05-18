import type { ReactElement, ReactNode } from "react";
import { cn } from "../lib/cn";

export interface DashboardLayoutProps {
  header: ReactNode;
  kpis: ReactNode;
  children: ReactNode;
  /** Override KPI grid (defaults to `grid-cols-1 lg:grid-cols-[2fr_1fr_1fr]`). */
  kpiGridClassName?: string;
  className?: string;
}

export function DashboardLayout({
  header,
  kpis,
  children,
  kpiGridClassName,
  className,
}: DashboardLayoutProps): ReactElement {
  return (
    <div className={cn("space-y-8", className)}>
      {header}
      <div className={cn("grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr_1fr]", kpiGridClassName)}>
        {kpis}
      </div>
      <div className="space-y-6">{children}</div>
    </div>
  );
}
