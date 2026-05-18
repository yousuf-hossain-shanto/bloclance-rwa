"use client";

import { TRPCProvider } from "@/trpc/react";
import type { ReactNode } from "react";
import { KycModalProvider } from "./kyc-modal-provider";
import { PrivyProvider } from "./privy-provider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <PrivyProvider>
      <TRPCProvider>
        <KycModalProvider>{children}</KycModalProvider>
      </TRPCProvider>
    </PrivyProvider>
  );
}
