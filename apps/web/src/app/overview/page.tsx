import { AuthGateProvider } from "@/components/auth/AuthGateClient";
import { HoldingsGridClient } from "@/components/overview/HoldingsGridClient";
import { OverviewHeaderClient } from "@/components/overview/OverviewHeaderClient";
import { PortfolioValueChartClient } from "@/components/overview/PortfolioValueChartClient";
import { WalletValueTile } from "@/components/overview/WalletValueTile";
import { getServerCaller } from "@/trpc/server";
import type { PropertyCard } from "@surgexrp/shared";
import {
  AppShell,
  Button,
  DashboardLayout,
  KpiTile,
  SectionHeader,
  WalletPill,
} from "@surgexrp/ui";
import type { ReactElement } from "react";

const NAV_LINKS = [
  { href: "/overview", label: "Overview", active: true },
  { href: "/explore", label: "Explore" },
  { href: "/marketplace", label: "Marketplace" },
];

const MOCK_WALLET = "r62UiV223536746446892HfFA";

export const dynamic = "force-dynamic";

export default async function OverviewPage(): Promise<ReactElement> {
  // Fetch the first 4 holdings + corresponding property records via tRPC.
  // We catch auth errors so the page still renders during the M0→M1 window
  // before R1-C lands the Privy session bridge.
  const trpc = await getServerCaller();
  let previewProperties: PropertyCard[] = [];
  let assetsOwned = 0;

  try {
    const holdings = await trpc.portfolio.holdings({ page: 1, pageSize: 4 });
    assetsOwned = holdings.total;
    const propIds = holdings.items.map((h) => h.propertyId);
    const fetched = await Promise.all(
      propIds.map((id) => trpc.properties.byId({ id }).catch(() => null)),
    );
    previewProperties = fetched.filter((p): p is NonNullable<typeof p> => Boolean(p));
  } catch {
    // Unauthenticated: fall through with the empty preview. The
    // `AuthGateProvider` below still renders the populated layout for the
    // demo so reviewers see the intended shell.
    const fallback = await trpc.properties.list({ page: 1, pageSize: 4 });
    previewProperties = fallback.items;
    assetsOwned = fallback.total;
  }

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
        <DashboardLayout
          header={<OverviewHeaderClient />}
          kpis={
            <>
              <PortfolioValueChartClient />
              <WalletValueTile />
              <KpiTile label="RWA Assets Owned" value={String(assetsOwned)} size="lg" />
            </>
          }
        >
          <SectionHeader
            title="All Assets"
            subtitle="See all your owned assets below"
            size="md"
            right={
              <Button as="a" href="/overview/assets" variant="ghost" size="sm">
                View All
              </Button>
            }
          />
          <HoldingsGridClient properties={previewProperties} />
        </DashboardLayout>
      </AppShell>
    </AuthGateProvider>
  );
}
