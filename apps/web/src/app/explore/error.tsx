"use client";

import { Button, EmptyState } from "@surgexrp/ui";
import { type ReactElement, useEffect } from "react";

export default function ExploreError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): ReactElement {
  useEffect(() => {
    console.error("[explore] segment error:", error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl items-center px-6 py-16">
      <EmptyState
        className="w-full"
        title="Couldn't load this page"
        description={error.message ?? "Failed to load the property list. Please try again."}
        action={
          <Button variant="primary" size="md" onClick={() => reset()}>
            Try again
          </Button>
        }
      />
    </main>
  );
}
