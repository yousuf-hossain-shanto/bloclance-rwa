"use client";

import { Button, EmptyState } from "@surgexrp/ui";
import { type ReactElement, useEffect } from "react";

/**
 * Global error boundary for the App Router. Renders a centered EmptyState
 * with the error message and a retry CTA wired to Next.js' `reset`.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): ReactElement {
  useEffect(() => {
    // Surface to console for debugging — Sentry / Logflare hook lands later.
    console.error("[app] global error boundary:", error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl items-center px-6 py-16">
      <EmptyState
        className="w-full"
        title="Something went wrong"
        description={error.message || "An unexpected error occurred. Please try again."}
        action={
          <Button variant="primary" size="md" onClick={() => reset()}>
            Try again
          </Button>
        }
      />
    </main>
  );
}
