import { AuthGateProvider } from "@/components/auth/AuthGateClient";
import { getServerCaller } from "@/trpc/server";
import {
  AppShell,
  AssetHeader,
  Button,
  DetailWithSidebarLayout,
  FormRow,
  WalletPill,
} from "@surgexrp/ui";
import { notFound } from "next/navigation";
import type { ReactElement } from "react";

const NAV_LINKS = [
  { href: "/overview", label: "Overview", active: true },
  { href: "/explore", label: "Explore" },
  { href: "/marketplace", label: "Marketplace" },
];

const MOCK_WALLET = "r62UiV223536746446892HfFA";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

/**
 * `/overview/assets/[id]` — holding-detail page. Reads the property record
 * via tRPC and looks up the viewer's holding for live ownership stats.
 */
export default async function OverviewAssetDetailPage({
  params,
}: PageProps): Promise<ReactElement> {
  const { id } = await params;
  // Strip the per-card suffix the listing emits to dedupe React keys.
  const realId = id.replace(/-\d+$/, "");
  const trpc = await getServerCaller();
  const property = await trpc.properties.byId({ id: realId }).catch(() => null);
  if (!property) notFound();

  // Look up the viewer's holding, if any.
  let unitsOwned = 0;
  try {
    const { items } = await trpc.portfolio.holdings({ page: 1, pageSize: 100 });
    const h = items.find((row) => row.propertyId === realId);
    if (h) unitsOwned = h.unitsOwned;
  } catch {
    // Unauthenticated — surface a derived placeholder so the demo still
    // renders a populated sidebar.
    unitsOwned = Math.max(1, Math.floor((property.totalUnits - property.unitsAvailable) / 2));
  }

  const pricePerUnitNum = Number(property.pricePerUnit);
  const currentValueUsd = Number.isFinite(pricePerUnitNum) ? pricePerUnitNum * unitsOwned : 0;

  return (
    <AuthGateProvider initialAuthenticated>
      <AppShell
        navLinks={NAV_LINKS}
        authSlot={
          <WalletPill
            address={MOCK_WALLET}
            xrpAddress={MOCK_WALLET}
            rlusdAddress={MOCK_WALLET}
            kycStatus="unverified"
          />
        }
      >
        <DetailWithSidebarLayout
          back={
            <Button as="a" href="/overview/assets" variant="ghost" size="sm">
              ← Go back
            </Button>
          }
          headline={
            <AssetHeader
              variant="detail"
              name={property.name}
              locationCity={property.locationCity}
              locationRegion={property.locationRegion}
              roiAnnualPct={property.roiAnnualPct}
              kpis={[
                { label: "Price per unit", value: `$${property.pricePerUnit}` },
                { label: "Units owned", value: unitsOwned.toLocaleString() },
                {
                  label: "Current value",
                  value: `$${currentValueUsd.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}`,
                },
                { label: "Annual ROI", value: `${property.roiAnnualPct}%` },
              ]}
            />
          }
          sidebar={
            <div className="space-y-5 rounded-2xl border border-white/5 bg-bg-tertiary/60 p-6 backdrop-blur-md">
              <div>
                <p className="text-xs uppercase tracking-wide text-text-subtle">Holdings</p>
                <p className="mt-1 text-3xl font-semibold text-white">
                  {unitsOwned.toLocaleString()} units
                </p>
              </div>
              <FormRow label="Annual ROI" value={`${property.roiAnnualPct}%`} />
              <FormRow
                label="Current value"
                value={`$${currentValueUsd.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}`}
                tone="emphasis"
              />
              <Button as="a" href={`/marketplace/${realId}`} variant="primary" size="lg" fullWidth>
                Trade this asset
              </Button>
            </div>
          }
        />
      </AppShell>
    </AuthGateProvider>
  );
}
