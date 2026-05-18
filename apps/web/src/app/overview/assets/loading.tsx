import { Skeleton } from "@surgexrp/ui";
import type { ReactElement } from "react";

/**
 * Loading boundary for `/overview/assets` (the "View All" holdings grid).
 */
export default function OverviewAssetsLoading(): ReactElement {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8 space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} rounded="lg" className="h-[360px] w-full" />
        ))}
      </div>
    </div>
  );
}
