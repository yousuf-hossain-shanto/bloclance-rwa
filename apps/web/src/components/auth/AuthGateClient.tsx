"use client";

import { AuthModal, Button } from "@surgexrp/ui";
import {
  type ReactElement,
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

interface AuthGateContextValue {
  isAuthenticated: boolean;
  openAuthModal: () => void;
}

const AuthGateContext = createContext<AuthGateContextValue | null>(null);

export function useAuthGate(): AuthGateContextValue {
  const ctx = useContext(AuthGateContext);
  if (!ctx) throw new Error("useAuthGate must be used inside <AuthGateProvider>");
  return ctx;
}

export interface AuthGateProviderProps {
  children: ReactNode;
  initialAuthenticated?: boolean;
}

/**
 * Holds the open state for the AuthModal and exposes `openAuthModal()` to children
 * via context. Renders the modal at the root of the page so it portals over any UI.
 */
export function AuthGateProvider({
  children,
  initialAuthenticated = false,
}: AuthGateProviderProps): ReactElement {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | undefined>();
  const [isAuthenticated, setIsAuthenticated] = useState(initialAuthenticated);

  const openAuthModal = useCallback(() => {
    setErrorText(undefined);
    setOpen(true);
  }, []);

  const value = useMemo(
    () => ({ isAuthenticated, openAuthModal }),
    [isAuthenticated, openAuthModal],
  );

  const handleSubmit = useCallback(async (email: string) => {
    setLoading(true);
    setErrorText(undefined);
    try {
      // TODO: hand off to Privy SDK in M1. For now treat any valid-looking email as a success.
      if (!email.includes("@")) {
        setErrorText("Enter a valid email address");
        return;
      }
      // Simulate a network round-trip so the spinner is visible during dev.
      await new Promise((resolve) => setTimeout(resolve, 250));
      setIsAuthenticated(true);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <AuthGateContext.Provider value={value}>
      {children}
      <AuthModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
        loading={loading}
        errorText={errorText}
      />
    </AuthGateContext.Provider>
  );
}

export interface AuthButtonsProps {
  className?: string;
}

/** TopNav `authSlot` for unauthenticated state — Log in (ghost) + Sign Up (primary). */
export function AuthButtons({ className }: AuthButtonsProps): ReactElement {
  const { openAuthModal } = useAuthGate();
  return (
    <div className={className}>
      <Button variant="ghost" size="sm" onClick={openAuthModal}>
        Log in
      </Button>
      <Button variant="primary" size="sm" onClick={openAuthModal} className="ml-2">
        Sign Up
      </Button>
    </div>
  );
}

/**
 * Render-prop helper for gated CTAs. Exposes `(open) => ReactNode` where
 * `open()` either runs `onAuthorized` (already signed in) or opens the
 * AuthModal (unauthenticated).
 */
export interface AuthGateProps {
  onAuthorized?: () => void;
  children: (open: () => void, isAuthenticated: boolean) => ReactNode;
}

export function AuthGate({ onAuthorized, children }: AuthGateProps): ReactElement {
  const { isAuthenticated, openAuthModal } = useAuthGate();
  const handler = (): void => {
    if (isAuthenticated) {
      onAuthorized?.();
    } else {
      openAuthModal();
    }
  };
  return <>{children(handler, isAuthenticated)}</>;
}
