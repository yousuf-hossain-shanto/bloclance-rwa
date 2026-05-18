import { Skeleton } from "@surgexrp/ui";
import type { ReactElement } from "react";

/**
 * Loading boundary for `/marketplace/[id]` — trading two-column layout:
 * chart + order book on the left, buy/sell ticket on the right.
 */
export default function TradingLoading(): ReactElement {
  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <Skeleton rounded="full" className="mb-4 h-8 w-24" />
      <div className="mb-6 space-y-3">
        <Skeleton className="h-7 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Skeleton rounded="lg" className="h-[360px] w-full" />
          <Skeleton rounded="lg" className="h-[280px] w-full" />
        </div>
        <Skeleton rounded="lg" className="h-[520px] w-full" />
      </div>
    </div>
  );
}
