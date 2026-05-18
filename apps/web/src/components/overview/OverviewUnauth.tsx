import { Button, EmptyState } from "@surgexrp/ui";
import type { ReactElement } from "react";

/**
 * Marketing card shown on `/overview` for unauthenticated users
 * (`docs/screens/portfolio.md` `432:2688`). Top-nav still exposes
 * Log in / Sign Up — this card mirrors that intent inline.
 */
export function OverviewUnauth(): ReactElement {
  return (
    <EmptyState
      title="Supercharge Your Earnings With RWA"
      description="Earn passive incomes from RWA all over the globe and grow your portfolio"
      action={
        <Button as="a" href="/explore" variant="primary" size="md">
          Start exploring
        </Button>
      }
    />
  );
}
