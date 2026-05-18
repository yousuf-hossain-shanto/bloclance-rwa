import { AuthGateProvider } from "@/components/auth/AuthGateClient";
import { HoldingsGridClient } from "@/components/overview/HoldingsGridClient";
import { mockProperties } from "@surgexrp/shared/mocks";
import {
  AppShell,
  Button,
  CenteredListPage,
  ListToolbar,
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

/**
 * Overview → View All. Full grid of `<PropertyCard variant="holding">`.
 * Eight cards visible: Azure, Vela, Coastal, Metropolitan, Shanti Palazo,
 * Condo Al Cartie + two repeats so the 4×2 grid is full.
 */
export default function OverviewAssetsPage(): ReactElement {
  const ordered = [
    mockProperties[0], // Azure Penthouse
    mockProperties[1], // Vela Commercial Tower
    mockProperties[2], // Coastal Retreat Villa
    mockProperties[3], // Metropolitan Lofts
    mockProperties[8], // Shanti Palazo
    mockProperties[9], // Condo Al Cartie
    mockProperties[0], // repeat to fill row
    mockProperties[2], // repeat to fill row
  ].filter((p): p is NonNullable<typeof p> => Boolean(p));
  // Stable React keys when the same id repeats:
  const properties = ordered.map((p, i) => ({ ...p, id: `${p.id}-${i}` }));

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
        <CenteredListPage
          header={
            <div className="space-y-4">
              <Button as="a" href="/overview" variant="ghost" size="sm">
                ← Go back
              </Button>
              <SectionHeader title="All Assets" subtitle="See all your owned assets below" />
            </div>
          }
          toolbar={<ListToolbar hideSort showFilter />}
          gridClassName="contents"
        >
          <HoldingsGridClient properties={properties} />
        </CenteredListPage>
      </AppShell>
    </AuthGateProvider>
  );
}
