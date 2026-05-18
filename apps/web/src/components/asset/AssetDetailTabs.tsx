"use client";

import { EmptyState, KpiTile, Tabs } from "@surgexrp/ui";
import { type ReactElement, useState } from "react";

export interface AssetAboutData {
  bedroomCount: number;
  areaSqm: number;
  description: string;
  developer: string;
}

export interface AssetDetailTabsProps {
  about: AssetAboutData;
}

type TabValue = "about" | "financials" | "documents" | "order-book";

const TAB_OPTIONS: { label: string; value: TabValue }[] = [
  { label: "About Property", value: "about" },
  { label: "Financials", value: "financials" },
  { label: "Documents", value: "documents" },
  { label: "Order Book", value: "order-book" },
];

export function AssetDetailTabs({ about }: AssetDetailTabsProps): ReactElement {
  const [tab, setTab] = useState<TabValue>("about");
  return (
    <div className="space-y-6">
      <Tabs<TabValue> options={TAB_OPTIONS} value={tab} onChange={setTab} variant="underline" />
      <div>
        {tab === "about" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <KpiTile label="Bedroom" value={about.bedroomCount} />
              <KpiTile label="Area Space" value={`${about.areaSqm.toLocaleString()} sqm`} />
            </div>
            <div className="rounded-2xl border border-white/5 bg-bg-tertiary/60 p-6 backdrop-blur-md">
              <h3 className="text-lg font-semibold text-white">Property Description</h3>
              <p className="mt-3 text-sm leading-relaxed text-text-muted">{about.description}</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-bg-tertiary/60 p-6 backdrop-blur-md">
              <p className="text-xs uppercase tracking-wide text-text-subtle">Developer</p>
              <p className="mt-2 text-base font-semibold text-white">{about.developer}</p>
            </div>
          </div>
        )}
        {tab === "financials" && (
          <EmptyState
            title="Financials coming soon"
            description="ROI breakdown, yield distribution schedule, and fees will appear here."
          />
        )}
        {tab === "documents" && (
          <EmptyState
            title="No documents yet"
            description="Legal documents, prospectus, and title deeds will appear here."
          />
        )}
        {tab === "order-book" && (
          <EmptyState
            title="No primary-issuance orders"
            description="The live secondary marketplace order book is on the Trading screen."
          />
        )}
      </div>
    </div>
  );
}
