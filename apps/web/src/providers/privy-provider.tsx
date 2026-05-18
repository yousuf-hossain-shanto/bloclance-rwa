"use client";

import { PrivyProvider as RawPrivyProvider } from "@privy-io/react-auth";
import type { ReactNode } from "react";

// TODO: verify XRPL adapter; fallback to Web3Auth XRPL if missing
export function PrivyProvider({ children }: { children: ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  if (!appId) {
    // During scaffold / dev we may not have an appId yet — render children
    // unwrapped so the rest of the app still mounts.
    return <>{children}</>;
  }

  return (
    <RawPrivyProvider
      appId={appId}
      config={{
        appearance: {
          theme: "dark",
          accentColor: "#c8a749",
        },
        loginMethods: ["email"],
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
      }}
    >
      {children}
    </RawPrivyProvider>
  );
}
