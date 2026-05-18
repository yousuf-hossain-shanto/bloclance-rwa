import { AssetDetailSidebar } from "@/components/asset/AssetDetailSidebar";
import { AssetDetailTabs } from "@/components/asset/AssetDetailTabs";
import { AuthButtons, AuthGateProvider } from "@/components/auth/AuthGateClient";
import { mockProperties } from "@surgexrp/shared/mocks";
import { AppShell, AssetHeader, Button, DetailWithSidebarLayout } from "@surgexrp/ui";
import { notFound } from "next/navigation";
import type { ReactElement } from "react";

const NAV_LINKS = [
  { href: "/overview", label: "Overview" },
  { href: "/explore", label: "Explore", active: true },
  { href: "/marketplace", label: "Marketplace" },
];

/**
 * Verbatim About-tab data for The Azure Penthouse (docs/screens/explore.md).
 * Other mock properties reuse this copy in the M0 prototype — wired to real
 * data in M1.
 */
const AZURE_ABOUT = {
  bedroomCount: 4,
  areaSqm: 727,
  description:
    "Perched atop the city's skyline, The Azure Penthouse is a masterclass in coastal modernism and elevated living. Designed for those who demand both high-octane energy and serene privacy, this residence offers an unparalleled vantage point over the shimmering Biscayne Bay and the Atlantic horizon.",
  developer: "The Azure Homes and Suites",
} as const;

export default async function AssetDetailPage({
  params,
}: { params: Promise<{ id: string }> }): Promise<ReactElement> {
  const { id } = await params;
  const property = mockProperties.find((p) => p.id === id);
  if (!property) notFound();

  // Spec values for Azure Penthouse: property value $2,581,023 / 3-5 Years /
  // 11.2% ROI / $430 per unit / 400 of 1,200 available.
  const propertyValueUsd = "2,581,023";
  const holdPeriod = "3-5 Years";

  return (
    <AuthGateProvider>
      <AppShell navLinks={NAV_LINKS} authSlot={<AuthButtons />}>
        <DetailWithSidebarLayout
          back={
            <Button as="a" href="/explore" variant="ghost" size="sm">
              Go back
            </Button>
          }
          hero={
            <div
              className="aspect-[16/7] w-full rounded-[40px] bg-cover bg-center"
              style={{ backgroundImage: `url(${property.heroImageUrl})` }}
              aria-label={`${property.name} hero image`}
            />
          }
          headline={
            <AssetHeader
              variant="detail"
              name={property.name}
              locationCity={property.locationCity}
              locationRegion={property.locationRegion}
              roiAnnualPct={property.roiAnnualPct}
              kpis={[
                { label: "Property Value", value: `$${propertyValueUsd}` },
                { label: "Hold period", value: holdPeriod },
                { label: "Price per unit", value: `$${property.pricePerUnit}` },
                {
                  label: "Units available",
                  value: `${property.unitsAvailable.toLocaleString()} / ${property.totalUnits.toLocaleString()}`,
                },
              ]}
            />
          }
          sidebar={
            <AssetDetailSidebar
              propertyId={property.id}
              propertyName={property.name}
              locationCity={property.locationCity}
              locationRegion={property.locationRegion}
              roiAnnualPct={property.roiAnnualPct}
              pricePerUnit={property.pricePerUnit}
              unitsAvailable={property.unitsAvailable}
              minUnits={5}
            />
          }
          body={<AssetDetailTabs about={AZURE_ABOUT} />}
        />
      </AppShell>
    </AuthGateProvider>
  );
}
