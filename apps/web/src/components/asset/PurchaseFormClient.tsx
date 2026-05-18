"use client";

import { submitPurchase } from "@/actions/purchases";
import { zodResolver } from "@hookform/resolvers/zod";
import { type SubmitPurchaseInput, SubmitPurchaseSchema } from "@surgexrp/shared";
import { Button, PurchaseModal } from "@surgexrp/ui";
import { useAction } from "next-safe-action/hooks";
import { type ReactElement, useState } from "react";
import { useForm } from "react-hook-form";

export interface PurchaseFormClientProps {
  open: boolean;
  onClose: () => void;
  propertyId: string;
  propertyName: string;
  locationCity: string;
  locationRegion: string;
  roiAnnualPct: string;
  pricePerUnit: string;
  unitsAvailable: number;
  minUnits: number;
  /** Seeded from sidebar stepper. Spec sample default is `300` for Azure Penthouse. */
  initialUnits?: number;
}

const VALID_BALANCE_USD = 2_581_023;
const INSUFFICIENT_BALANCE_USD = 32_589;

function formatUsd(amount: number): string {
  return `$${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

/**
 * Wires <PurchaseModal> (from packages/ui) to react-hook-form + the
 * next-safe-action `submitPurchase` server action. Holds the mock balance
 * toggle (valid vs insufficient) used to demo the two visual states from
 * `docs/screens/purchase.md` (`339:6699` vs `339:6883`).
 */
export function PurchaseFormClient({
  open,
  onClose,
  propertyId,
  propertyName,
  locationCity,
  locationRegion,
  roiAnnualPct,
  pricePerUnit,
  unitsAvailable,
  minUnits,
  initialUnits = 300,
}: PurchaseFormClientProps): ReactElement {
  // Mock balance toggle — flips between the two designed states.
  const [balanceState, setBalanceState] = useState<"valid" | "insufficient">("valid");

  const form = useForm<SubmitPurchaseInput>({
    resolver: zodResolver(SubmitPurchaseSchema),
    defaultValues: {
      propertyId,
      units: initialUnits,
      asset: "XRP",
      agreementAccepted: true,
    },
  });

  const units = form.watch("units");
  const asset = form.watch("asset");

  const { execute, status } = useAction(submitPurchase, {
    onSuccess: () => {
      onClose();
    },
  });

  const pricePerUnitNum = Number(pricePerUnit);
  const totalUsdNum = Number.isFinite(pricePerUnitNum) ? pricePerUnitNum * units : 0;
  const availableUsdNum = balanceState === "valid" ? VALID_BALANCE_USD : INSUFFICIENT_BALANCE_USD;
  const insufficientFunds = totalUsdNum > availableUsdNum;

  function handleSubmit(): void {
    form.handleSubmit((values) => execute(values))();
  }

  return (
    <>
      <PurchaseModal
        open={open}
        onClose={onClose}
        property={{
          name: propertyName,
          locationCity,
          locationRegion,
          roiAnnualPct,
          pricePerUnit,
          unitsAvailable,
          minUnits,
        }}
        units={units}
        onUnitsChange={(n) => form.setValue("units", n)}
        selectedAsset={asset}
        onAssetChange={(a) => form.setValue("asset", a)}
        availableBalance={formatUsd(availableUsdNum)}
        total={formatUsd(totalUsdNum)}
        insufficientFunds={insufficientFunds}
        onFundWallet={() => {
          // Demo behavior — flip mock balance back to valid so the form clears.
          setBalanceState("valid");
        }}
        onSubmit={handleSubmit}
        loading={status === "executing"}
      />
      {/* Dev-only mock balance toggle — lets the demo show both states. */}
      {open && (
        <div className="fixed bottom-4 left-4 z-[60] flex gap-2 rounded-full border border-white/10 bg-bg-secondary/80 p-1 text-xs backdrop-blur-md">
          <Button
            variant={balanceState === "valid" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setBalanceState("valid")}
          >
            Valid balance
          </Button>
          <Button
            variant={balanceState === "insufficient" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setBalanceState("insufficient")}
          >
            Insufficient
          </Button>
        </div>
      )}
    </>
  );
}
