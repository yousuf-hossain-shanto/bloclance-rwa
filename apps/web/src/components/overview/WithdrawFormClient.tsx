"use client";

import { buildWithdrawalPaymentParams, submitWithdrawal } from "@/actions/withdrawals";
import { useActionToast } from "@/hooks/use-action-toast";
import { useXrpl } from "@/hooks/use-xrpl";
import { zodResolver } from "@hookform/resolvers/zod";
import { type SubmitWithdrawalInput, SubmitWithdrawalSchema } from "@surgexrp/shared";
import { Button, WithdrawModal } from "@surgexrp/ui";
import { useAction } from "next-safe-action/hooks";
import { type ReactElement, useMemo, useState } from "react";
import { type Resolver, useForm } from "react-hook-form";

export type WithdrawFormState =
  | "empty"
  | "valid-xrp"
  | "valid-rlusd"
  | "max-xrp"
  | "max-rlusd"
  | "over-balance-xrp"
  | "over-balance-rlusd";

export interface WithdrawFormClientProps {
  open: boolean;
  onClose: () => void;
  /** Optional initial state, useful for storybook-style demos. */
  initialState?: WithdrawFormState;
}

/** Mock balances per `docs/screens/withdraw.md` + `docs/screens/portfolio.md`. */
const XRP_BALANCE_AMOUNT = 38_202.4;
const XRP_BALANCE_USD = 55_000;
const RLUSD_BALANCE_AMOUNT = 103_368;
const XRP_USD_RATE = XRP_BALANCE_USD / XRP_BALANCE_AMOUNT; // ≈ 1.4396

function formatXrp(amount: number): string {
  return `${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} XRP`;
}

function formatUsd(amount: number): string {
  return `$${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

/**
 * Wires `<WithdrawModal>` (from packages/ui) to react-hook-form +
 * the next-safe-action `submitWithdrawal` server action. Owns the 7
 * demo states described in `docs/screens/withdraw.md`.
 */
export function WithdrawFormClient({
  open,
  onClose,
  initialState = "empty",
}: WithdrawFormClientProps): ReactElement {
  const [asset, setAsset] = useState<"XRP" | "RLUSD" | "">(
    initialState === "empty" ? "" : initialState.endsWith("xrp") ? "XRP" : "RLUSD",
  );
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [amount, setAmount] = useState<string>("");

  // react-hook-form mirrors the same fields so submit goes through zod.
  const form = useForm<SubmitWithdrawalInput>({
    resolver: zodResolver(SubmitWithdrawalSchema) as Resolver<SubmitWithdrawalInput>,
    defaultValues: {
      asset: "XRP",
      amount: "",
      destinationAddress: "",
    },
  });

  const xrpl = useXrpl();
  const { showError, showSuccess } = useActionToast();
  const { execute, status } = useAction(submitWithdrawal, {
    onSuccess: () => {
      // Optimistic close + confirmation toast.
      onClose();
      showSuccess("Withdrawal submitted");
    },
    onError: ({ error }) => {
      const message = error.serverError ?? "Couldn't submit your withdrawal. Please try again.";
      showError(message);
    },
  });

  const balanceAmount = useMemo(() => {
    if (asset === "XRP") return XRP_BALANCE_AMOUNT;
    if (asset === "RLUSD") return RLUSD_BALANCE_AMOUNT;
    return 0;
  }, [asset]);

  const amountNum = useMemo(() => {
    const n = Number(amount);
    return Number.isFinite(n) ? n : 0;
  }, [amount]);

  const overBalance = asset !== "" && amountNum > balanceAmount;

  const errorText = overBalance ? "Amount is insufficient. Enter amount in your wallet" : undefined;

  const availableBalance =
    asset === "XRP"
      ? `${formatXrp(XRP_BALANCE_AMOUNT)} (${formatUsd(XRP_BALANCE_USD)})`
      : asset === "RLUSD"
        ? formatUsd(RLUSD_BALANCE_AMOUNT)
        : "-";

  const usdEquivalent =
    asset === "XRP" && amountNum > 0 ? formatUsd(amountNum * XRP_USD_RATE) : undefined;

  const total =
    asset === "XRP"
      ? amountNum > 0
        ? formatXrp(amountNum)
        : ""
      : asset === "RLUSD"
        ? amountNum > 0
          ? formatUsd(amountNum)
          : ""
        : "";

  function handleAssetChange(next: "XRP" | "RLUSD"): void {
    setAsset(next);
    form.setValue("asset", next);
    // Clear amount so the new asset's balance is the only reference.
    setAmount("");
    form.setValue("amount", "");
  }

  function handleAmountChange(next: string): void {
    setAmount(next);
    form.setValue("amount", next);
  }

  function handleWalletAddressChange(next: string): void {
    setWalletAddress(next);
    form.setValue("destinationAddress", next);
  }

  function handleMaxClick(): void {
    if (asset === "") return;
    const next = String(balanceAmount);
    setAmount(next);
    form.setValue("amount", next);
  }

  function handleSubmit(): void {
    form.handleSubmit(async (values) => {
      let signedTxBlob: string | undefined;
      if (xrpl.available) {
        try {
          const params = await buildWithdrawalPaymentParams({
            account: "",
            asset: values.asset,
            amount: values.amount,
            destinationAddress: values.destinationAddress,
            destinationTag: values.destinationTag,
          });
          const signed = await xrpl.signPayment({
            account: params.account,
            destination: params.destination,
            amount: params.amount,
            destinationTag: params.destinationTag,
          });
          if (signed) signedTxBlob = signed.tx_blob;
        } catch (err) {
          console.warn("[withdraw] sign failed:", (err as Error)?.message);
        }
      }
      execute({ ...values, ...(signedTxBlob ? { signedTxBlob } : {}) });
    })();
  }

  function resetEmpty(): void {
    setAsset("");
    setAmount("");
    form.setValue("amount", "");
  }
  function preset(nextAsset: "XRP" | "RLUSD", nextAmount: string): void {
    setAsset(nextAsset);
    form.setValue("asset", nextAsset);
    setAmount(nextAmount);
    form.setValue("amount", nextAmount);
  }

  const demoStates: Array<{ label: string; run: () => void }> = [
    { label: "Empty", run: resetEmpty },
    { label: "Valid XRP", run: () => preset("XRP", "658.25") },
    { label: "Max XRP", run: () => preset("XRP", String(XRP_BALANCE_AMOUNT)) },
    { label: "Over XRP", run: () => preset("XRP", "50000") },
    { label: "Valid RLUSD", run: () => preset("RLUSD", "55123") },
    { label: "Max RLUSD", run: () => preset("RLUSD", String(RLUSD_BALANCE_AMOUNT)) },
    { label: "Over RLUSD", run: () => preset("RLUSD", "200000") },
  ];

  return (
    <>
      <WithdrawModal
        open={open}
        onClose={onClose}
        selectedAsset={asset}
        onAssetChange={handleAssetChange}
        availableBalance={availableBalance}
        walletAddress={walletAddress}
        onWalletAddressChange={handleWalletAddressChange}
        amount={amount}
        onAmountChange={handleAmountChange}
        onMaxClick={handleMaxClick}
        usdEquivalent={usdEquivalent}
        total={total}
        errorText={errorText}
        onSubmit={handleSubmit}
        loading={status === "executing"}
      />
      {/* Dev-only state toggle so the demo can cycle the 7 designed states. */}
      {open && (
        <div className="fixed bottom-4 left-4 z-[60] flex flex-wrap gap-1 rounded-2xl border border-white/10 bg-bg-secondary/80 p-1 text-xs backdrop-blur-md">
          {demoStates.map((s) => (
            <Button key={s.label} variant="ghost" size="sm" onClick={s.run}>
              {s.label}
            </Button>
          ))}
        </div>
      )}
    </>
  );
}
