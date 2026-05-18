import { AuthGateProvider } from "@/components/auth/AuthGateClient";
import { HoldingsGridClient } from "@/components/overview/HoldingsGridClient";
import { OverviewHeaderClient } from "@/components/overview/OverviewHeaderClient";
import { PortfolioValueChartClient } from "@/components/overview/PortfolioValueChartClient";
import { WalletValueTile } from "@/components/overview/WalletValueTile";
import { mockProperties } from "@surgexrp/shared/mocks";
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

export default function OverviewPage(): ReactElement {
  // Populated state is the default per task spec. `OverviewEmpty` and
  // `OverviewUnauth` are sibling components for `/overview` variants.
  const previewProperties = mockProperties.slice(0, 4);

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
              <KpiTile label="RWA Assets Owned" value="12" size="lg" />
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
