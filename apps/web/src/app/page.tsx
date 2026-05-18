import { ClientToolbar } from "@/components/client-toolbar";
import { mockProperties } from "@surgexrp/shared/mocks";
import { AppShell, PropertyCard, SectionHeader } from "@surgexrp/ui";

const NAV_LINKS = [
  { href: "/", label: "Explore", active: true },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/portfolio", label: "Portfolio" },
];

export default function HomePage() {
  return (
    <AppShell
      navLinks={NAV_LINKS}
      authSlot={
        <a href="/auth/login" className="btn-gold rounded-full px-5 py-2 text-sm">
          Log in / Sign up
        </a>
      }
    >
      <SectionHeader
        title="Explore Available Properties"
        subtitle="Browse curated properties and invest in seconds. Every asset on SurgeXRP is selected for stable rental yield and consistent income."
      />

      <ClientToolbar />

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {mockProperties.slice(0, 8).map((p) => (
          <PropertyCard key={p.id} variant="explore" data={p} />
        ))}
      </div>
    </AppShell>
  );
}
