import type { ReactElement } from "react";
import { cn } from "../lib/cn";
import { CopyableAddress } from "./copyable-address";

export interface WalletAddressRowProps {
  label: string;
  address: string;
  helperText?: string;
  className?: string;
}

export function WalletAddressRow({
  label,
  address,
  helperText,
  className,
}: WalletAddressRowProps): ReactElement {
  return (
    <div className={cn("rounded-xl border border-white/10 bg-white/5 px-4 py-3", className)}>
      <CopyableAddress address={address} label={label} truncate />
      {helperText && <p className="mt-2 text-xs text-text-subtle">{helperText}</p>}
    </div>
  );
}
