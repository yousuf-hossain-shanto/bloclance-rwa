import { Button, EmptyState } from "@surgexrp/ui";
import type { ReactElement } from "react";

/**
 * Empty-state for `/overview` when the user has no holdings yet.
 * Renders inside the same DashboardLayout — see
 * `docs/screens/portfolio.md` (`366:15918`).
 */
export function OverviewEmpty(): ReactElement {
  return (
    <EmptyState
      title="No assets in your portfolio"
      description="Explore curated properties to start earning passive income."
      action={
        <Button as="a" href="/explore" variant="primary" size="md">
          Explore properties
        </Button>
      }
    />
  );
}
