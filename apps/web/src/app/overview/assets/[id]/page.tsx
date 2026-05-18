import { AuthGateProvider } from "@/components/auth/AuthGateClient";
import { mockProperties } from "@surgexrp/shared/mocks";
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

/**
 * `/overview/assets/[id]` — minimal holding-detail page. The Overview View
 * Asset path in `docs/screens/portfolio.md` notes "click card → Trading view
 * (faster path to sell)"; this stub provides the headline + sidebar CTA that
 * routes to `/marketplace/[id]` (Agent B owns the marketplace detail).
 */
export default async function OverviewAssetDetailPage({
  params,
}: PageProps): Promise<ReactElement> {
  const { id } = await params;
  // Strip trailing index suffixes used to dedupe repeated cards on the
  // listing page (`<uuid>-3`).
  const realId = id.replace(/-\d+$/, "");
  const property = mockProperties.find((p) => p.id === realId);
  if (!property) notFound();

  const pricePerUnitNum = Number(property.pricePerUnit);
  const unitsOwned = Math.max(1, Math.floor((property.totalUnits - property.unitsAvailable) / 2));
  const currentValueUsd = Number.isFinite(pricePerUnitNum)
    ? pricePerUnitNum * unitsOwned
    : Number(property.tradeVolumeUsd ?? 0);

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
