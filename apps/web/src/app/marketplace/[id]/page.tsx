import { MarketplaceAuthSlot } from "@/components/marketplace/MarketplaceAuthSlot";
import { TradingClient } from "@/components/trading/TradingClient";
import { mockProperties } from "@surgexrp/shared/mocks";
import { AppShell, AssetHeader, Button } from "@surgexrp/ui";
import { notFound } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "Overview" },
  { href: "/", label: "Explore" },
  { href: "/marketplace", label: "Marketplace", active: true },
];

// Trading view hero KPIs per docs/screens/trading.md (verbatim values for the
// Azure Penthouse design reference). The same shape is rendered for any
// property — values are mocked.
const HERO_KPIS = [
  {
    label: "Last traded price",
    value: "$600",
    delta: { value: "1.2%", direction: "up" as const, suffix: "Last week" },
  },
  {
    label: "Total units sold",
    value: "428,587",
    secondary: "71,413 / 500,000 units",
  },
  {
    label: "Trade volume",
    value: "$12,587,971",
    delta: { value: "3%", direction: "up" as const, suffix: "Last 4 weeks" },
  },
];

const SUB_KPIS = [
  { label: "Price per unit", value: "$430" },
  { label: "Available units", value: "71,413" },
  { label: "Property valuation", value: "$12,587,971" },
];

interface TradingPageProps {
  params: Promise<{ id: string }>;
}

export default async function MarketplaceDetailPage({ params }: TradingPageProps) {
  const { id } = await params;
  const property = mockProperties.find((p) => p.id === id);
  if (!property) notFound();

  const assetHeader = (
    <AssetHeader
      variant="trading"
      status="active"
      name={property.name}
      locationCity={property.locationCity}
      locationRegion={property.locationRegion}
      roiAnnualPct={property.roiAnnualPct}
      kpis={HERO_KPIS}
      subKpis={SUB_KPIS}
      actionSlot={
        <Button as="a" href={`/explore/${property.id}`} variant="ghost" size="sm">
          View Property Details
        </Button>
      }
    />
  );

  return (
    <AppShell navLinks={NAV_LINKS} authSlot={<MarketplaceAuthSlot />}>
      <TradingClient
        property={property}
        marketPriceUsd="600"
        availableBalance="$12,400.00 RLUSD"
        assetHeader={assetHeader}
      />
    </AppShell>
  );
}
