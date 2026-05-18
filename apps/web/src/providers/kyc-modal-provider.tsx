"use client";

import { startKyc } from "@/actions/kyc";
import { KycSdkClient } from "@/components/kyc/KycSdkClient";
import { trpc } from "@/trpc/react";
import { ModalShell } from "@surgexrp/ui";
import { useAction } from "next-safe-action/hooks";
import {
  type ReactElement,
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/**
 * Provides imperative access to the Sumsub KYC modal from anywhere in the
 * client tree.
 *
 *   const { openKycModal } = useKycModal();
 *   if (e.serverError === "KYC_REQUIRED") openKycModal();
 *
 * Internally:
 *   1. Open modal -> call `startKyc` action -> get short-lived access token.
 *   2. Mount `<KycSdkClient />` with the token.
 *   3. Poll `auth.me` every 2s while the modal is open so the UI flips
 *      automatically once the Sumsub webhook lands on the server.
 *   4. When `kycStatus === "Verified"`, auto-close + fire `onVerified?.()`.
 */
interface KycModalContextValue {
  openKycModal: (opts?: { onVerified?: () => void }) => void;
  closeKycModal: () => void;
  isOpen: boolean;
}

const KycModalContext = createContext<KycModalContextValue | null>(null);

export function useKycModal(): KycModalContextValue {
  const ctx = useContext(KycModalContext);
  if (!ctx) throw new Error("useKycModal must be used inside <KycModalProvider>");
  return ctx;
}

export function KycModalProvider({ children }: { children: ReactNode }): ReactElement {
  const [open, setOpen] = useState(false);
  const [verifiedHandler, setVerifiedHandler] = useState<(() => void) | null>(null);

  // Poll auth.me only while modal is open so we cheaply react to the webhook.
  const meQuery = trpc.auth.me.useQuery(undefined, {
    refetchInterval: open ? 2000 : false,
    enabled: open,
  });

  const { execute, result, isExecuting, reset } = useAction(startKyc);

  const accessToken = result.data?.accessToken ?? null;
  const startError = result.serverError ?? null;

  const closeKycModal = useCallback(() => {
    setOpen(false);
    setVerifiedHandler(null);
    reset();
  }, [reset]);

  const openKycModal = useCallback(
    (opts?: { onVerified?: () => void }) => {
      setVerifiedHandler(() => opts?.onVerified ?? null);
      setOpen(true);
      execute();
    },
    [execute],
  );

  // Auto-close once the webhook has flipped the user to Verified.
  useEffect(() => {
    if (!open) return;
    const status = meQuery.data?.kycStatus;
    if (status === "Verified") {
      verifiedHandler?.();
      closeKycModal();
    }
  }, [open, meQuery.data?.kycStatus, verifiedHandler, closeKycModal]);

  const value = useMemo(
    () => ({ openKycModal, closeKycModal, isOpen: open }),
    [openKycModal, closeKycModal, open],
  );

  return (
    <KycModalContext.Provider value={value}>
      {children}
      {open && !accessToken && (
        <ModalShell open onClose={closeKycModal} title="Starting verification" size="sm">
          {isExecuting && <p className="text-sm text-text-muted">Preparing your KYC session…</p>}
          {startError && (
            <p className="text-sm text-red-400">
              {startError === "Sumsub not configured"
                ? "KYC isn't available in this environment yet."
                : startError}
            </p>
          )}
        </ModalShell>
      )}
      {open && accessToken && (
        <KycSdkClient open accessToken={accessToken} onClose={closeKycModal} />
      )}
    </KycModalContext.Provider>
  );
}
