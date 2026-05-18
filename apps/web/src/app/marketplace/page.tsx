import { MarketplaceAuthSlot } from "@/components/marketplace/MarketplaceAuthSlot";
import { MarketplaceListClient } from "@/components/marketplace/MarketplaceListClient";
import { getServerCaller } from "@/trpc/server";
import { AppShell } from "@surgexrp/ui";

const NAV_LINKS = [
  { href: "/", label: "Overview" },
  { href: "/", label: "Explore" },
  { href: "/marketplace", label: "Marketplace", active: true },
];

export const dynamic = "force-dynamic";

export default async function MarketplacePage() {
  const trpc = await getServerCaller();
  const { items, total } = await trpc.properties.list({ page: 1, pageSize: 24 });

  return (
    <AppShell navLinks={NAV_LINKS} authSlot={<MarketplaceAuthSlot />}>
      <MarketplaceListClient
        properties={items}
        counterText={`${total} Properties Available`}
        totalResults={total}
      />
    </AppShell>
  );
}
