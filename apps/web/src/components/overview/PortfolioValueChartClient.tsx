"use client";

import { ChartPanel } from "@surgexrp/ui";
import { type ReactElement, useState } from "react";

const TIMEFRAMES = [
  { label: "All", value: "all" },
  { label: "3M", value: "3m" },
  { label: "6M", value: "6m" },
  { label: "1Y", value: "1y" },
];

const LEGEND = [
  { label: "Increased Value", tone: "up" as const },
  { label: "Decreased Value", tone: "down" as const },
];

const MOCK_DATA = [
  { x: "Jan", y: 8_128_688 },
  { x: "Feb", y: 9_200_000 },
  { x: "Mar", y: 10_400_000 },
  { x: "Apr", y: 12_100_000 },
  { x: "May", y: 14_300_000 },
  { x: "Jun", y: 16_587_811 },
];

/**
 * The Portfolio Value chart card on the Overview dashboard. The chart itself
 * is a presentational stub (per `chart-panel.tsx`); this client wrapper just
 * owns the timeframe pill state.
 */
export function PortfolioValueChartClient(): ReactElement {
  const [timeframe, setTimeframe] = useState<string>("all");
  return (
    <ChartPanel
      title="PORTFOLIO VALUE"
      value="$16,587,811"
      timeframes={TIMEFRAMES}
      activeTimeframe={timeframe}
      onTimeframeChange={setTimeframe}
      legend={LEGEND}
      data={MOCK_DATA}
      variant="portfolio"
    />
  );
}
