"use client";

import { WithdrawFormClient } from "@/components/overview/WithdrawFormClient";
import { Button, SectionHeader } from "@surgexrp/ui";
import { type ReactElement, useState } from "react";

/**
 * Header for `/overview` — title + subtitle + Withdraw Earnings CTA.
 * Owns the open-state of the Withdraw modal so the populated dashboard
 * stays a server component.
 */
export function OverviewHeaderClient(): ReactElement {
  const [open, setOpen] = useState(false);
  return (
    <>
      <SectionHeader
        title="Overview"
        subtitle="See how your assets are performing"
        right={
          <Button variant="primary" size="md" onClick={() => setOpen(true)}>
            Withdraw Earnings
          </Button>
        }
      />
      <WithdrawFormClient open={open} onClose={() => setOpen(false)} />
    </>
  );
}
