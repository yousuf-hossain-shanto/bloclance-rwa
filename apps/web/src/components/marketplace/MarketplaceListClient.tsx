"use client";

import {
  CenteredListPage,
  FilterPanel,
  ListToolbar,
  PaginationBar,
  PropertyCard,
  type PropertyCardData,
  SectionHeader,
} from "@surgexrp/ui";
import { useRouter } from "next/navigation";
import { type ReactElement, useMemo, useState } from "react";

export interface MarketplaceListClientProps {
  properties: PropertyCardData[];
  /** Counter text shown in the toolbar (verbatim per docs/screens/marketplace.md). */
  counterText: string;
  totalResults: number;
}

const PAGE_SIZE = 8;

/**
 * Client island for the Marketplace listing page. Owns toolbar filter state,
 * pagination, and the FilterPanel drawer. Receives mock property data via props.
 */
export function MarketplaceListClient({
  properties,
  counterText,
  totalResults,
}: MarketplaceListClientProps): ReactElement {
  const router = useRouter();
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);

  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [yieldMin, setYieldMin] = useState("");
  const [yieldMax, setYieldMax] = useState("");

  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return properties.slice(start, start + PAGE_SIZE);
  }, [page, properties]);

  const handleReset = (): void => {
    setPriceMin("");
    setPriceMax("");
    setYieldMin("");
    setYieldMax("");
  };

  const handleApply = (): void => {
    setFilterOpen(false);
    setPage(1);
  };

  return (
    <>
      <CenteredListPage
        header={
          <SectionHeader title="Marketplace" subtitle="Trade fractional real estate shares." />
        }
        toolbar={
          <ListToolbar
            counterText={counterText}
            hideSort
            showFilter
            onFilterClick={() => setFilterOpen(true)}
          />
        }
        pagination={
          <PaginationBar
            total={totalResults}
            page={page}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        }
      >
        {pageItems.map((p) => (
          <PropertyCard
            key={p.id}
            variant="trading"
            data={p}
            onClick={() => router.push(`/marketplace/${p.id}`)}
          />
        ))}
      </CenteredListPage>

      <FilterPanel
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        priceMin={priceMin}
        priceMax={priceMax}
        yieldMin={yieldMin}
        yieldMax={yieldMax}
        onPriceMinChange={setPriceMin}
        onPriceMaxChange={setPriceMax}
        onYieldMinChange={setYieldMin}
        onYieldMaxChange={setYieldMax}
        onApply={handleApply}
        onReset={handleReset}
      />
    </>
  );
}
