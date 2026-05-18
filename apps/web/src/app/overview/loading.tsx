import { Skeleton } from "@surgexrp/ui";
import type { ReactElement } from "react";

/**
 * Loading boundary for `/overview` — header + 3 KPI tiles + 4 holding
 * cards matching `DashboardLayout`.
 */
export default function OverviewLoading(): ReactElement {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div className="space-y-3">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton rounded="full" className="h-10 w-48" />
      </div>
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Skeleton rounded="lg" className="h-32" />
        <Skeleton rounded="lg" className="h-32" />
        <Skeleton rounded="lg" className="h-32" />
      </div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} rounded="lg" className="h-[360px] w-full" />
        ))}
      </div>
    </div>
  );
}
