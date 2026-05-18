import { Skeleton } from "@surgexrp/ui";
import type { ReactElement } from "react";

/**
 * Loading boundary for `/profile` — header + avatar block + 3 stacked
 * section cards (Wallets, Verification, Details).
 */
export default function ProfileLoading(): ReactElement {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8 space-y-3">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="mb-8 flex items-center gap-4">
        <Skeleton rounded="full" className="size-20" />
        <Skeleton className="h-4 w-44" />
      </div>
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} rounded="lg" className="h-44 w-full" />
        ))}
      </div>
    </div>
  );
}
