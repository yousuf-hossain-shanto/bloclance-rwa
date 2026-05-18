import { AssetDetailSidebar } from "@/components/asset/AssetDetailSidebar";
import { AssetDetailTabs } from "@/components/asset/AssetDetailTabs";
import { AuthButtons, AuthGateProvider } from "@/components/auth/AuthGateClient";
import { getServerCaller } from "@/trpc/server";
import { AppShell, AssetHeader, Button, DetailWithSidebarLayout } from "@surgexrp/ui";
import { notFound } from "next/navigation";
import type { ReactElement } from "react";

const NAV_LINKS = [
  { href: "/overview", label: "Overview" },
  { href: "/explore", label: "Explore", active: true },
  { href: "/marketplace", label: "Marketplace" },
];

export const dynamic = "force-dynamic";

export default async function AssetDetailPage({
  params,
}: { params: Promise<{ id: string }> }): Promise<ReactElement> {
  const { id } = await params;
  const trpc = await getServerCaller();
  const property = await trpc.properties.byId({ id }).catch(() => null);
  if (!property) notFound();

  const propertyValueUsd = Number(property.propertyValue).toLocaleString(undefined, {
    maximumFractionDigits: 0,
  });

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
                { label: "Hold period", value: property.holdPeriod },
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
              minUnits={property.minInvestmentUnits}
            />
          }
          body={
            <AssetDetailTabs
              about={{
                bedroomCount: property.bedroomCount ?? 0,
                areaSqm: property.areaSqm ?? 0,
                description: property.description,
                developer: property.developer,
              }}
            />
          }
        />
      </AppShell>
    </AuthGateProvider>
  );
}
