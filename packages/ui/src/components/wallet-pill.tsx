"use client";

import { ChevronDown } from "lucide-react";
import { type ReactElement, useEffect, useRef, useState } from "react";
import { cn } from "../lib/cn";
import { CopyableAddress } from "./copyable-address";
import { KycPill, type KycStatus } from "./kyc-pill";

export interface WalletPillProps {
  address: string;
  xrpAddress: string;
  rlusdAddress: string;
  kycStatus?: KycStatus;
  onProfileClick?: () => void;
  onSignOut?: () => void;
  onVerifyClick?: () => void;
  LinkComponent?: React.ElementType;
  profileHref?: string;
  className?: string;
}

function truncate(addr: string): string {
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function WalletPill({
  address,
  xrpAddress,
  rlusdAddress,
  kycStatus = "unverified",
  onProfileClick,
  onSignOut,
  onVerifyClick,
  LinkComponent = "a",
  profileHref = "/profile",
  className,
}: WalletPillProps): ReactElement {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent): void {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10"
      >
        <span className="size-2 rounded-full bg-success" />
        <span className="font-mono">{truncate(address)}</span>
        <ChevronDown className="size-4" />
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-72 rounded-2xl border border-white/10 bg-bg-secondary/95 p-3 shadow-elevated backdrop-blur-xl">
          <div className="space-y-2">
            <div className="rounded-xl bg-white/5 px-3 py-2">
              <CopyableAddress label="XRP Wallet" address={xrpAddress} truncate size="sm" />
            </div>
            <div className="rounded-xl bg-white/5 px-3 py-2">
              <CopyableAddress label="RLUSD Wallet" address={rlusdAddress} truncate size="sm" />
            </div>
          </div>
          <hr className="my-3 border-white/10" />
          <p className="px-1 text-xs uppercase tracking-wider text-text-subtle">Wallet</p>
          <LinkComponent
            href={profileHref}
            onClick={onProfileClick}
            className="mt-2 block rounded-lg px-3 py-2 text-sm text-white hover:bg-white/5"
          >
            My Profile
          </LinkComponent>
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-xs text-text-muted">KYC</span>
            <KycPill status={kycStatus} onVerifyClick={onVerifyClick} />
          </div>
          <button
            type="button"
            onClick={onSignOut}
            className="block w-full rounded-lg px-3 py-2 text-left text-sm text-error hover:bg-error/10"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
