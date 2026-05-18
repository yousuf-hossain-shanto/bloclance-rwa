"use client";

import { ListToolbar, PaginationBar, PropertyCard, type PropertyCardData } from "@surgexrp/ui";
import { useRouter } from "next/navigation";
import { type ReactElement, useMemo, useState } from "react";

export type ExploreSort = "highest-roi" | "newest";

export interface ExploreListingProps {
  properties: PropertyCardData[];
  /** Total result count displayed in pagination. Spec shows `24`. */
  totalResults?: number;
  /** Initial page (1-indexed). */
  initialPage?: number;
  /** Items per page in the grid (4×2 = 8). */
  pageSize?: number;
}

const SORT_OPTIONS = [
  { label: "Highest ROI", value: "highest-roi" as const },
  { label: "Newest", value: "newest" as const },
];

/**
 * Interactive pieces of the Explore listing: sort toolbar, property grid,
 * and pagination. Page-level chrome (`AppShell`, hero header) lives in the
 * server route; this client component only owns the sort/page state plus
 * card navigation.
 */
export function ExploreListing({
  properties,
  totalResults = 24,
  initialPage = 1,
  pageSize = 8,
}: ExploreListingProps): ReactElement {
  const router = useRouter();
  const [sort, setSort] = useState<ExploreSort>("highest-roi");
  const [page, setPage] = useState<number>(initialPage);

  const sorted = useMemo(() => {
    const copy = [...properties];
    if (sort === "highest-roi") {
      copy.sort((a, b) => Number(b.roiAnnualPct) - Number(a.roiAnnualPct));
    }
    // "newest" — keep mock order (no `createdAt` field on mock data).
    return copy;
  }, [properties, sort]);

  const visible = sorted.slice(0, pageSize);

  return (
    <div className="space-y-6">
      <ListToolbar<ExploreSort>
        sortLabel="SORT BY:"
        options={SORT_OPTIONS}
        value={sort}
        onChange={setSort}
      />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {visible.map((p) => (
          <PropertyCard
            key={p.id}
            variant="explore"
            data={p}
            onClick={() => router.push(`/explore/${p.id}`)}
          />
        ))}
      </div>
      <PaginationBar total={totalResults} page={page} pageSize={pageSize} onPageChange={setPage} />
    </div>
  );
}
