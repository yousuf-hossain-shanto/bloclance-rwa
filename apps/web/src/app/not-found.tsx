import { Button, EmptyState } from "@surgexrp/ui";
import type { ReactElement } from "react";

/**
 * Global 404 page. Composes `<EmptyState>` from the UI library so the look
 * stays consistent with empty-list and error variants.
 */
export default function NotFound(): ReactElement {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl items-center px-6 py-16">
      <EmptyState
        className="w-full"
        title="Page not found"
        description="The page you were looking for doesn't exist or has moved."
        action={
          <Button as="a" href="/" variant="primary" size="md">
            Back to home
          </Button>
        }
      />
    </main>
  );
}
