import { Skeleton } from "@surgexrp/ui";
import type { ReactElement } from "react";

/**
 * Root-level loading boundary. Renders a top-nav skeleton and a 6-card
 * placeholder grid while a route segment is suspended.
 */
export default function RootLoading(): ReactElement {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-bg-secondary/70 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <Skeleton className="h-5 w-28" />
            <div className="hidden items-center gap-6 sm:flex">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton rounded="full" className="h-10 w-32" />
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 space-y-3">
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} rounded="lg" className="h-[360px] w-full" />
          ))}
        </div>
      </main>
    </div>
  );
}
