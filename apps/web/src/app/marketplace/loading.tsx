import { Skeleton } from "@surgexrp/ui";
import type { ReactElement } from "react";

/**
 * Loading boundary for `/marketplace` — toolbar skeleton + 4x2 trading
 * card grid (matches Marketplace listing).
 */
export default function MarketplaceLoading(): ReactElement {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8 space-y-3">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <Skeleton rounded="full" className="h-10 w-64" />
        <Skeleton rounded="full" className="h-10 w-40" />
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} rounded="lg" className="h-[360px] w-full" />
        ))}
      </div>
    </div>
  );
}
