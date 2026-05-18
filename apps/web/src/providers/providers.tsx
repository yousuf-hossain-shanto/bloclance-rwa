"use client";

import { ActionToastProvider } from "@/hooks/use-action-toast";
import { TRPCProvider } from "@/trpc/react";
import type { ReactNode } from "react";
import { KycModalProvider } from "./kyc-modal-provider";
import { PrivyProvider } from "./privy-provider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <PrivyProvider>
      <TRPCProvider>
        <ActionToastProvider>
          <KycModalProvider>{children}</KycModalProvider>
        </ActionToastProvider>
      </TRPCProvider>
    </PrivyProvider>
  );
}
