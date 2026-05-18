"use client";

import { usePrivy } from "@privy-io/react-auth";
import type { User as PrivyUser } from "@privy-io/react-auth";

/**
 * Single-source-of-truth client hook for Privy auth state.
 *
 * Wraps `usePrivy()` and exposes the shape AppShell consumers (e.g.
 * `MarketplaceAuthSlot`) actually care about: ready/authenticated flags,
 * the Privy user, and the login/logout/openLoginModal actions.
 *
 * When the `PrivyProvider` is not configured (no `NEXT_PUBLIC_PRIVY_APP_ID`),
 * the underlying provider renders children unwrapped and `usePrivy()` will
 * throw — so we trap that case and return a "not ready, not authenticated"
 * shape so screens still render in dev.
 */
export interface UseUserResult {
  /** True once Privy SDK has hydrated. */
  ready: boolean;
  /** True when the user has a verified Privy session. */
  authenticated: boolean;
  /** The raw Privy user object (`null` when unauthenticated). */
  user: PrivyUser | null;
  /** Open the Privy login modal. */
  login: () => void;
  /** Alias of `login` — preserves the name used by some shell components. */
  openLoginModal: () => void;
  /** Sign the user out and clear local Privy state. */
  logout: () => Promise<void>;
}

const NOOP = () => {
  /* no-op when Privy is not configured */
};

const NOOP_ASYNC = async () => {
  /* no-op when Privy is not configured */
};

export function useUser(): UseUserResult {
  try {
    const privy = usePrivy();
    const open = () => privy.login();
    return {
      ready: privy.ready,
      authenticated: privy.authenticated,
      user: privy.user,
      login: open,
      openLoginModal: open,
      logout: () => privy.logout(),
    };
  } catch {
    // Provider not mounted (env not configured in dev) — degrade gracefully.
    return {
      ready: false,
      authenticated: false,
      user: null,
      login: NOOP,
      openLoginModal: NOOP,
      logout: NOOP_ASYNC,
    };
  }
}
