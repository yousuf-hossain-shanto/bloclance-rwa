import { Skeleton } from "@surgexrp/ui";
import type { ReactElement } from "react";

/**
 * Loading boundary for `/explore/[id]` — hero + headline + body + sidebar
 * skeleton matching `DetailWithSidebarLayout`.
 */
export default function AssetDetailLoading(): ReactElement {
  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <Skeleton rounded="full" className="mb-4 h-8 w-24" />
      <Skeleton rounded="lg" className="mb-8 aspect-[16/7] w-full" />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="space-y-3">
            <Skeleton className="h-7 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} rounded="lg" className="h-20" />
            ))}
          </div>
          <Skeleton rounded="lg" className="h-72 w-full" />
        </div>
        <Skeleton rounded="lg" className="h-[480px] w-full" />
      </div>
    </div>
  );
}
