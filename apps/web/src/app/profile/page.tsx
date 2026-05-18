import { AuthGateProvider } from "@/components/auth/AuthGateClient";
import { ProfileAvatarClient } from "@/components/profile/ProfileAvatarClient";
import { ProfileDetailsClient } from "@/components/profile/ProfileDetailsClient";
import {
  AppShell,
  Button,
  KycPill,
  NoticeBanner,
  ProfileLayout,
  ProfileSectionCard,
  SectionHeader,
  WalletAddressRow,
  WalletPill,
} from "@surgexrp/ui";
import type { ReactElement } from "react";

const NAV_LINKS = [
  { href: "/overview", label: "Overview" },
  { href: "/explore", label: "Explore" },
  { href: "/marketplace", label: "Marketplace" },
];

const MOCK_WALLET = "r62UiV223536746446892HfFA";
const MOCK_EMAIL = "jonathan.segwell@email";
const MOCK_NAME = "Jonathan Segwell";

export default function ProfilePage(): ReactElement {
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
        <ProfileLayout
          header={
            <SectionHeader title="Profile" subtitle="Manage your profile and view your portfolio" />
          }
          avatar={<ProfileAvatarClient name={MOCK_NAME} />}
        >
          <ProfileSectionCard
            title="Your Surge Wallets"
            subtitle="To fund wallet, copy the correct address and send token"
          >
            <WalletAddressRow label="XRP Wallet" address={MOCK_WALLET} />
            <WalletAddressRow label="RLUSD Wallet" address={MOCK_WALLET} />
            <NoticeBanner>Fund wallet with local currency is coming soon</NoticeBanner>
          </ProfileSectionCard>

          <ProfileSectionCard
            title="Human Verification"
            subtitle="Verify your identity to unlock all features"
          >
            <div className="flex items-center justify-between gap-4">
              <KycPill status="unverified" />
              <Button variant="primary" size="md">
                Verify
              </Button>
            </div>
          </ProfileSectionCard>

          <ProfileSectionCard title="Your Details">
            <ProfileDetailsClient email={MOCK_EMAIL} />
          </ProfileSectionCard>
        </ProfileLayout>
      </AppShell>
    </AuthGateProvider>
  );
}
