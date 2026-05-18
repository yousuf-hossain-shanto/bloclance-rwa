"use client";

import { TRPCProvider } from "@/trpc/react";
import type { ReactNode } from "react";
import { PrivyProvider } from "./privy-provider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <PrivyProvider>
      <TRPCProvider>{children}</TRPCProvider>
    </PrivyProvider>
  );
}
