import { MarketplaceAuthSlot } from "@/components/marketplace/MarketplaceAuthSlot";
import { MarketplaceListClient } from "@/components/marketplace/MarketplaceListClient";
import { mockProperties } from "@surgexrp/shared/mocks";
import { AppShell } from "@surgexrp/ui";

const NAV_LINKS = [
  { href: "/", label: "Overview" },
  { href: "/", label: "Explore" },
  { href: "/marketplace", label: "Marketplace", active: true },
];

export default function MarketplacePage() {
  // 35 Properties Available — verbatim per docs/screens/marketplace.md.
  return (
    <AppShell navLinks={NAV_LINKS} authSlot={<MarketplaceAuthSlot />}>
      <MarketplaceListClient
        properties={mockProperties}
        counterText="35 Properties Available"
        totalResults={24}
      />
    </AppShell>
  );
}
