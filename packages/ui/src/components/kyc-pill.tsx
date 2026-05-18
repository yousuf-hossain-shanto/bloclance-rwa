"use client";

import { ShieldCheck, ShieldX } from "lucide-react";
import type { ReactElement } from "react";
import { Button } from "./button";
import { StatusPill } from "./status-pill";

export type KycStatus = "verified" | "unverified";

export interface KycPillProps {
  status: KycStatus;
  onVerifyClick?: () => void;
  className?: string;
}

export function KycPill({ status, onVerifyClick, className }: KycPillProps): ReactElement {
  if (status === "verified") {
    return (
      <StatusPill tone="success" className={className}>
        <ShieldCheck className="size-3.5" />
        Verified
      </StatusPill>
    );
  }
  return (
    <div className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <StatusPill tone="error">
        <ShieldX className="size-3.5" />
        Not Verified
      </StatusPill>
      {onVerifyClick && (
        <Button variant="primary" size="sm" onClick={onVerifyClick}>
          Verify
        </Button>
      )}
    </div>
  );
}
