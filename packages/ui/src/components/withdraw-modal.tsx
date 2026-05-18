"use client";

import type { ReactElement } from "react";
import { ModalShell } from "../layouts/modal-shell";
import { AssetAmountInput } from "./asset-amount-input";
import { Button } from "./button";
import { FormRow } from "./form-row";
import { SelectField } from "./select-field";
import { TextField } from "./text-field";

export interface WithdrawModalProps {
  open: boolean;
  onClose: () => void;
  selectedAsset: "XRP" | "RLUSD" | "";
  onAssetChange: (a: "XRP" | "RLUSD") => void;
  availableBalance: string;
  walletAddress: string;
  onWalletAddressChange: (a: string) => void;
  amount: string;
  onAmountChange: (a: string) => void;
  onMaxClick?: () => void;
  /** XRP-only: USD conversion preview. */
  usdEquivalent?: string;
  total: string;
  errorText?: string;
  onSubmit: () => void;
  loading?: boolean;
}

const ASSET_OPTIONS = [
  { label: "XRP", value: "XRP" },
  { label: "RLUSD", value: "RLUSD" },
];

export function WithdrawModal({
  open,
  onClose,
  selectedAsset,
  onAssetChange,
  availableBalance,
  walletAddress,
  onWalletAddressChange,
  amount,
  onAmountChange,
  onMaxClick,
  usdEquivalent,
  total,
  errorText,
  onSubmit,
  loading = false,
}: WithdrawModalProps): ReactElement {
  const hasAsset = selectedAsset !== "";
  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Withdraw Earnings"
      subtitle="Enter your withdrawal details below"
      size="md"
    >
      <SelectField
        label="Select Asset"
        placeholder="Choose asset"
        options={ASSET_OPTIONS}
        value={selectedAsset}
        onChange={(e) => onAssetChange(e.target.value as "XRP" | "RLUSD")}
      />
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <p className="text-xs uppercase tracking-wide text-text-subtle">Available balance</p>
        <p className="mt-1 text-base font-semibold text-white">
          {hasAsset ? availableBalance : "-"}
        </p>
      </div>
      <TextField
        label="Wallet Address"
        type="text"
        value={walletAddress}
        onChange={(e) => onWalletAddressChange(e.target.value)}
        placeholder="r..."
        autoComplete="off"
      />
      <AssetAmountInput
        label="Enter Amount"
        asset={hasAsset ? (selectedAsset as string) : undefined}
        value={amount}
        onChange={(e) => onAmountChange(e.target.value)}
        onMaxClick={onMaxClick}
        errorText={errorText}
        helperText={
          selectedAsset === "XRP" && usdEquivalent ? `USD Equivalent ${usdEquivalent}` : undefined
        }
      />
      <FormRow label="Total withdrawal" value={total || "—"} tone="emphasis" />

      <footer className="pt-2">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={onSubmit}
          loading={loading}
          disabled={!hasAsset || !!errorText || !amount}
        >
          Withdraw Earning
        </Button>
      </footer>
    </ModalShell>
  );
}
