"use client";

import type { ReactElement } from "react";
import { cn } from "../lib/cn";
import { EmptyState } from "./empty-state";
import { OrderBookRow, type OrderBookRowData } from "./order-book-row";
import { Skeleton } from "./skeleton";
import { Tabs, type TabsOption } from "./tabs";

export type OrderBookTab = "open" | "filled" | "history";
export type OrderBookSide = "buy" | "sell";

export interface OrderBookTableProps {
  tabs?: TabsOption<OrderBookTab>[];
  activeTab: OrderBookTab;
  onTabChange: (t: OrderBookTab) => void;
  side: OrderBookSide;
  onSideChange: (s: OrderBookSide) => void;
  rows: OrderBookRowData[];
  loading?: boolean;
  emptyText?: string;
  className?: string;
}

const DEFAULT_TABS: TabsOption<OrderBookTab>[] = [
  { label: "Open Orders", value: "open" },
  { label: "Filled Orders", value: "filled" },
  { label: "Trade History", value: "history" },
];

const SIDE_TABS: TabsOption<OrderBookSide>[] = [
  { label: "Buy", value: "buy" },
  { label: "Sell", value: "sell" },
];

export function OrderBookTable({
  tabs = DEFAULT_TABS,
  activeTab,
  onTabChange,
  side,
  onSideChange,
  rows,
  loading = false,
  emptyText = "No orders yet",
  className,
}: OrderBookTableProps): ReactElement {
  return (
    <section
      className={cn(
        "rounded-2xl border border-white/5 bg-bg-tertiary/40 p-5 backdrop-blur-md",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
        <Tabs variant="underline" options={tabs} value={activeTab} onChange={onTabChange} />
        <Tabs
          variant="segmented"
          size="sm"
          options={SIDE_TABS}
          value={side}
          onChange={onSideChange}
        />
      </div>
      <div className="grid grid-cols-4 gap-2 px-3 pb-2 text-xs uppercase tracking-wider text-text-subtle">
        <span>Units (Bid)</span>
        <span>Price</span>
        <span className="text-right">Price</span>
        <span className="text-right">Units (Ask)</span>
      </div>
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
            <Skeleton key={i} className="h-7" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState title={emptyText} className="border-0 bg-transparent" />
      ) : (
        <div className="space-y-0.5">
          {rows.map((row, i) => (
            <OrderBookRow
              // biome-ignore lint/suspicious/noArrayIndexKey: rows are positional
              key={i}
              bidUnits={row.bidUnits}
              bidPrice={row.bidPrice}
              askUnits={row.askUnits}
              askPrice={row.askPrice}
            />
          ))}
        </div>
      )}
    </section>
  );
}
