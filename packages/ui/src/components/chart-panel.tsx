"use client";

import type { ReactElement, ReactNode } from "react";
import { cn } from "../lib/cn";
import { Skeleton } from "./skeleton";
import { Tabs, type TabsOption } from "./tabs";

export interface ChartDatum {
  x: string;
  y: number;
}

export type ChartPanelVariant = "portfolio" | "trading";

export interface ChartPanelProps {
  title?: string;
  value?: ReactNode;
  /** Inner Price/Yield-style tabs. */
  tabs?: TabsOption<string>[];
  activeTab?: string;
  onTabChange?: (v: string) => void;
  /** Timeframe selector (All/3M/6M/1Y). */
  timeframes?: TabsOption<string>[];
  activeTimeframe?: string;
  onTimeframeChange?: (v: string) => void;
  legend?: { label: string; tone: "up" | "down" }[];
  data?: ChartDatum[];
  loading?: boolean;
  variant?: ChartPanelVariant;
  className?: string;
}

const DEFAULT_TIMEFRAMES: TabsOption<string>[] = [
  { label: "All", value: "all" },
  { label: "3M", value: "3m" },
  { label: "6M", value: "6m" },
  { label: "1Y", value: "1y" },
];

/**
 * MVP visual: gradient block with axis labels. Screen agents pass `data` through
 * but rendering uses a stub until v2 wires a chart lib.
 */
export function ChartPanel({
  title,
  value,
  tabs,
  activeTab,
  onTabChange,
  timeframes = DEFAULT_TIMEFRAMES,
  activeTimeframe = "all",
  onTimeframeChange,
  legend,
  data,
  loading = false,
  variant = "portfolio",
  className,
}: ChartPanelProps): ReactElement {
  return (
    <section
      className={cn(
        "rounded-2xl border border-white/5 bg-bg-tertiary/40 p-6 backdrop-blur-md",
        className,
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-3 pb-4">
        <div>
          {title && <p className="text-xs uppercase tracking-wider text-text-subtle">{title}</p>}
          {value && <p className="mt-1 text-2xl font-semibold text-white sm:text-3xl">{value}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {tabs && activeTab && onTabChange && (
            <Tabs
              variant="segmented"
              size="sm"
              options={tabs}
              value={activeTab}
              onChange={onTabChange}
            />
          )}
          {timeframes && onTimeframeChange && (
            <Tabs
              variant="segmented"
              size="sm"
              options={timeframes}
              value={activeTimeframe}
              onChange={onTimeframeChange}
            />
          )}
        </div>
      </header>
      {loading ? (
        <Skeleton className={cn("w-full", variant === "trading" ? "h-72" : "h-64")} />
      ) : (
        <div
          className={cn(
            "relative w-full rounded-xl",
            variant === "trading" ? "h-72" : "h-64",
            "bg-[linear-gradient(180deg,rgba(200,167,73,0.25)_0%,rgba(200,167,73,0)_100%)]",
          )}
          aria-label="Chart placeholder"
        >
          {/* Y-axis labels (right side) */}
          <div className="pointer-events-none absolute inset-y-0 right-2 flex flex-col justify-between py-2 text-xs text-text-subtle">
            {(data ?? []).slice(0, 5).map((d, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: stub axis labels
              <span key={i}>{d.y}</span>
            ))}
          </div>
          {/* X-axis labels (bottom) */}
          <div className="pointer-events-none absolute inset-x-3 bottom-2 flex justify-between text-xs text-text-subtle">
            {(data ?? []).slice(0, 6).map((d) => (
              <span key={d.x}>{d.x}</span>
            ))}
          </div>
        </div>
      )}
      {legend && legend.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-4">
          {legend.map((l) => (
            <span key={l.label} className="inline-flex items-center gap-2 text-xs text-text-muted">
              <span
                className={cn("size-2 rounded-full", l.tone === "up" ? "bg-success" : "bg-error")}
              />
              {l.label}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
