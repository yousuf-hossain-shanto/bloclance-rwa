"use client";

/**
 * useXrpl — client signing surface for SurgeXRP.
 *
 * Privy XRPL signing status (2026-05-18):
 *   `@privy-io/react-auth@^2.25` does not yet expose a typed XRPL signer
 *   (`useSignTransaction` is EVM-only, Solana has its own hook, XRPL doesn't
 *   have a public chain-specific signer in this version). Until Privy ships
 *   one we wire this hook as a no-op that returns `null` for the blob — the
 *   server actions detect this and persist the order/withdrawal as `Pending`
 *   without submitting.
 *
 * When Privy ships XRPL signing, replace the bodies of `signOfferCreate` /
 * `signPayment` / `signOfferCancel` with the real call (likely
 * `useSignTransaction({ chainType: "xrpl", transaction })`).
 *
 * Fallback option: server-side custodial signing using a per-user wallet seed
 * generated on first sign-in and encrypted with `WALLET_ENC_KEY`. The action
 * layer is already structured to accept that — see `submitPurchase`'s
 * `signWithSeed` path. Not enabled by default for security review reasons.
 */

import type { OfferCancelParams, OfferCreateParams, PaymentParams } from "@surgexrp/xrpl";

export interface SignedTx {
  /** Hex-encoded signed tx blob ready for `submitTx` / `submitAndWait`. */
  tx_blob: string;
  hash: string;
}

export interface UseXrplResult {
  /** True if a real signer is available. False = degraded/dev mode. */
  available: boolean;
  signOfferCreate: (params: OfferCreateParams) => Promise<SignedTx | null>;
  signPayment: (params: PaymentParams) => Promise<SignedTx | null>;
  signOfferCancel: (params: OfferCancelParams) => Promise<SignedTx | null>;
}

const STUB_NOTICE_LOGGED = { value: false };
function noteUnavailable(): void {
  if (STUB_NOTICE_LOGGED.value) return;
  STUB_NOTICE_LOGGED.value = true;
  if (typeof console !== "undefined") {
    console.warn("[useXrpl] Privy XRPL signer not available — actions will persist as Pending.");
  }
}

export function useXrpl(): UseXrplResult {
  // Privy XRPL hook is not exposed in @privy-io/react-auth@^2.25. When it
  // ships, swap these stubs for the actual `useSignTransaction({chainType:'xrpl'})`
  // call and return `{ tx_blob, hash }`.
  return {
    available: false,
    signOfferCreate: async () => {
      noteUnavailable();
      return null;
    },
    signPayment: async () => {
      noteUnavailable();
      return null;
    },
    signOfferCancel: async () => {
      noteUnavailable();
      return null;
    },
  };
}
