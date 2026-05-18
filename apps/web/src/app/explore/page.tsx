import { AuthButtons, AuthGateProvider } from "@/components/auth/AuthGateClient";
import { ExploreListing } from "@/components/explore/ExplorePageClient";
import { getServerCaller } from "@/trpc/server";
import { AppShell, CenteredListPage, SectionHeader } from "@surgexrp/ui";
import type { ReactElement } from "react";

const NAV_LINKS = [
  { href: "/overview", label: "Overview" },
  { href: "/explore", label: "Explore", active: true },
  { href: "/marketplace", label: "Marketplace" },
];

export const dynamic = "force-dynamic";

export default async function ExplorePage(): Promise<ReactElement> {
  const trpc = await getServerCaller();
  const { items, total } = await trpc.properties.list({ page: 1, pageSize: 8 });

  return (
    <AuthGateProvider>
      <AppShell navLinks={NAV_LINKS} authSlot={<AuthButtons />}>
        <CenteredListPage
          header={
            <SectionHeader
              title="Explore Available Properties"
              subtitle="Browse curated properties and invest in seconds. Every asset on SurgeXRP is selected for stable rental yield and consistent income."
            />
          }
          // The interactive listing renders toolbar + grid + pagination as a
          // single block, so we pass an empty grid wrapper and put everything
          // through `children`.
          gridClassName="contents"
        >
          <ExploreListing properties={items} totalResults={total} pageSize={8} />
        </CenteredListPage>
      </AppShell>
    </AuthGateProvider>
  );
}
