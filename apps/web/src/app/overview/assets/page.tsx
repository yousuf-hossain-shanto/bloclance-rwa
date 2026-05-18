import { AuthGateProvider } from "@/components/auth/AuthGateClient";
import { HoldingsGridClient } from "@/components/overview/HoldingsGridClient";
import { getServerCaller } from "@/trpc/server";
import type { PropertyCard } from "@surgexrp/shared";
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

export const dynamic = "force-dynamic";

/**
 * Overview → View All. Full grid of `<PropertyCard variant="holding">` driven
 * by the user's seeded holdings. Falls back to the public property catalogue
 * if the viewer is unauthenticated (so the demo deep-link still shows shapes).
 */
export default async function OverviewAssetsPage(): Promise<ReactElement> {
  const trpc = await getServerCaller();
  let properties: PropertyCard[] = [];
  try {
    const holdings = await trpc.portfolio.holdings({ page: 1, pageSize: 24 });
    const fetched = await Promise.all(
      holdings.items.map((h) => trpc.properties.byId({ id: h.propertyId }).catch(() => null)),
    );
    properties = fetched.filter((p): p is NonNullable<typeof p> => Boolean(p));
  } catch {
    const fallback = await trpc.properties.list({ page: 1, pageSize: 8 });
    properties = fallback.items;
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
