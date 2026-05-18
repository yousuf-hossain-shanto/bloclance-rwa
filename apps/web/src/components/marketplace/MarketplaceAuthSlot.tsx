"use client";

import { WalletPill } from "@surgexrp/ui";
import type { ReactElement } from "react";

/**
 * Authenticated right-side slot for the Top Nav on Marketplace + Trading pages.
 * Mock wallet addresses live here; real auth wiring lands in M1.
 */
export function MarketplaceAuthSlot(): ReactElement {
  return (
    <WalletPill
      address="r62UiVABCDEFGHIJKLMNOPQRSTUVWxyzHfFA"
      xrpAddress="r62UiVABCDEFGHIJKLMNOPQRSTUVWxyzHfFA"
      rlusdAddress="r62UiVABCDEFGHIJKLMNOPQRSTUVWxyzHfFA"
      kycStatus="unverified"
    />
  );
}
