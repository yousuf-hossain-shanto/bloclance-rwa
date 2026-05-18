"use client";

import { ModalShell } from "@surgexrp/ui";
import Script from "next/script";
import { type ReactElement, useCallback, useEffect, useRef, useState } from "react";

/**
 * Sumsub WebSDK loader expects:
 *   window.snsWebSdk
 *     .init(accessToken, () => fetchFreshToken())
 *     .withConf({ lang: "en" })
 *     .on("idCheck.onApplicantStatusChanged", (payload) => …)
 *     .onMessage((type) => …)
 *     .build()
 *     .launch("#sumsub-websdk-container")
 *
 * Docs: https://developers.sumsub.com/web-sdk
 */
interface SnsWebSdkBuilder {
  withConf(conf: { lang?: string; theme?: string }): SnsWebSdkBuilder;
  on(event: string, handler: (payload: unknown) => void): SnsWebSdkBuilder;
  onMessage(handler: (type: string, payload?: unknown) => void): SnsWebSdkBuilder;
  build(): { launch(selector: string): void };
}

interface SnsWebSdkGlobal {
  init(accessToken: string, getNewAccessToken: () => Promise<string>): SnsWebSdkBuilder;
}

declare global {
  interface Window {
    snsWebSdk?: SnsWebSdkGlobal;
  }
}

export interface KycSdkClientProps {
  open: boolean;
  accessToken: string;
  onClose: () => void;
  /** Called when Sumsub reports a terminal applicant status (GREEN/RED). */
  onComplete?: (status: "GREEN" | "RED" | "PENDING") => void;
  /**
   * Optional refetch hook the parent can pass — typically wires to
   * `trpc.auth.me` so the modal can poll for the post-webhook flip.
   */
  refreshFreshToken?: () => Promise<string>;
}

const SDK_SRC = "https://static.sumsub.com/idensic/static/sns-websdk-builder.js";
const CONTAINER_ID = "sumsub-websdk-container";

export function KycSdkClient({
  open,
  accessToken,
  onClose,
  onComplete,
  refreshFreshToken,
}: KycSdkClientProps): ReactElement {
  const [scriptReady, setScriptReady] = useState<boolean>(
    typeof window !== "undefined" && Boolean(window.snsWebSdk),
  );
  const launchedRef = useRef(false);

  const getFreshToken = useCallback(async () => {
    if (refreshFreshToken) return refreshFreshToken();
    // If the parent didn't pass a refresher, just return the existing token —
    // the WebSDK will surface an `expired` error and the user can retry.
    return accessToken;
  }, [accessToken, refreshFreshToken]);

  useEffect(() => {
    if (!open || !scriptReady || !accessToken) return;
    if (typeof window === "undefined" || !window.snsWebSdk) return;
    if (launchedRef.current) return;

    launchedRef.current = true;

    const sdk = window.snsWebSdk
      .init(accessToken, getFreshToken)
      .withConf({ lang: "en", theme: "dark" })
      .on("idCheck.onApplicantStatusChanged", (payload: unknown) => {
        const data = payload as {
          reviewResult?: { reviewAnswer?: "GREEN" | "RED" };
          reviewStatus?: string;
        };
        const answer = data.reviewResult?.reviewAnswer;
        if (answer === "GREEN" || answer === "RED") {
          onComplete?.(answer);
        } else if (data.reviewStatus === "pending") {
          onComplete?.("PENDING");
        }
      })
      .onMessage((type: string) => {
        if (type === "idCheck.onApplicantSubmitted") {
          onComplete?.("PENDING");
        }
      })
      .build();

    sdk.launch(`#${CONTAINER_ID}`);

    return () => {
      launchedRef.current = false;
    };
  }, [open, scriptReady, accessToken, onComplete, getFreshToken]);

  // Reset launch state when modal closes so it can re-mount on next open.
  useEffect(() => {
    if (!open) launchedRef.current = false;
  }, [open]);

  return (
    <>
      <Script
        src={SDK_SRC}
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
        onReady={() => setScriptReady(true)}
      />
      <ModalShell open={open} onClose={onClose} title="Verify your identity" size="lg">
        <div id={CONTAINER_ID} className="min-h-[520px] w-full rounded-2xl bg-white/5 p-2" />
        {!scriptReady && <p className="text-sm text-text-muted">Loading verification flow…</p>}
      </ModalShell>
    </>
  );
}
