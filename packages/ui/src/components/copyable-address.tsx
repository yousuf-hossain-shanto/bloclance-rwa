"use client";

import { Check, Copy } from "lucide-react";
import { type ReactElement, useState } from "react";
import { cn } from "../lib/cn";

export interface CopyableAddressProps {
  address: string;
  truncate?: boolean;
  label?: string;
  size?: "sm" | "md";
  className?: string;
}

function truncateAddress(addr: string): string {
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function CopyableAddress({
  address,
  truncate = true,
  label,
  size = "md",
  className,
}: CopyableAddressProps): ReactElement {
  const [copied, setCopied] = useState(false);

  async function handleCopy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // noop — clipboard might be blocked
    }
  }

  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <div className="min-w-0">
        {label && <p className="text-xs uppercase tracking-wide text-text-subtle">{label}</p>}
        <p
          className={cn(
            "font-mono text-white",
            size === "sm" ? "text-sm" : "text-base",
            label && "mt-0.5",
          )}
        >
          {truncate ? truncateAddress(address) : address}
        </p>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/5"
      >
        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
