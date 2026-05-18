import { MarketplaceAuthSlot } from "@/components/marketplace/MarketplaceAuthSlot";
import { TradingClient } from "@/components/trading/TradingClient";
import { getServerCaller } from "@/trpc/server";
import { AppShell, AssetHeader, Button } from "@surgexrp/ui";
import { notFound } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "Overview" },
  { href: "/", label: "Explore" },
  { href: "/marketplace", label: "Marketplace", active: true },
];

interface TradingPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

function fmtUsd(value: string | number): string {
  const n = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(n)) return "$0";
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export default async function MarketplaceDetailPage({ params }: TradingPageProps) {
  const { id } = await params;
  const trpc = await getServerCaller();
  const [property, market] = await Promise.all([
    trpc.properties.byId({ id }).catch(() => null),
    trpc.properties.market({ id }).catch(() => null),
  ]);
  if (!property) notFound();

  const lastPrice = market?.lastPrice ?? property.pricePerUnit;
  const volume = market?.volume24h ?? "0";
  const unitsSold = property.totalUnits - property.unitsAvailable;
  const valuationUsd =
    market?.valuation ?? (Number(property.pricePerUnit) * property.totalUnits).toFixed(0);

  const heroKpis = [
    {
      label: "Last traded price",
      value: fmtUsd(lastPrice),
      delta: market
        ? {
            value: `${Math.abs(Number(market.priceChangePct))}%`,
            direction: Number(market.priceChangePct) >= 0 ? ("up" as const) : ("down" as const),
            suffix: "Last week",
          }
        : undefined,
    },
    {
      label: "Total units sold",
      value: unitsSold.toLocaleString(),
      secondary: `${property.unitsAvailable.toLocaleString()} / ${property.totalUnits.toLocaleString()} units`,
    },
    {
      label: "Trade volume",
      value: fmtUsd(volume),
    },
  ];

  const subKpis = [
    { label: "Price per unit", value: `$${property.pricePerUnit}` },
    { label: "Available units", value: property.unitsAvailable.toLocaleString() },
    { label: "Property valuation", value: fmtUsd(valuationUsd) },
  ];

  const assetHeader = (
    <AssetHeader
      variant="trading"
      status="active"
      name={property.name}
      locationCity={property.locationCity}
      locationRegion={property.locationRegion}
      roiAnnualPct={property.roiAnnualPct}
      kpis={heroKpis}
      subKpis={subKpis}
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
        property={{
          id: property.id,
          name: property.name,
          locationCity: property.locationCity,
          locationRegion: property.locationRegion,
          heroImageUrl: property.heroImageUrl,
          roiAnnualPct: property.roiAnnualPct,
          pricePerUnit: property.pricePerUnit,
          unitsAvailable: property.unitsAvailable,
          totalUnits: property.totalUnits,
          tradeVolumeUsd: property.tradeVolumeUsd,
        }}
        marketPriceUsd={lastPrice}
        availableBalance="$12,400.00 RLUSD"
        assetHeader={assetHeader}
      />
    </AppShell>
  );
}
