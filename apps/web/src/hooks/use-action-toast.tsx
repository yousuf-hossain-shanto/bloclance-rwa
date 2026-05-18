"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import {
  type ReactElement,
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type ToastTone = "success" | "error";

export interface Toast {
  id: number;
  tone: ToastTone;
  message: string;
}

interface ActionToastContextValue {
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
}

const ActionToastContext = createContext<ActionToastContextValue | null>(null);

const AUTO_DISMISS_MS = 4_000;

/**
 * Mounts a fixed top-right toast container and provides imperative
 * `showError` / `showSuccess` helpers for use after `executeAsync` /
 * `useAction` callbacks. Toasts auto-dismiss after 4s.
 */
export function ActionToastProvider({ children }: { children: ReactNode }): ReactElement {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((tone: ToastTone, message: string) => {
    idRef.current += 1;
    const id = idRef.current;
    setToasts((current) => [...current, { id, tone, message }]);
    // Auto-dismiss
    setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== id));
    }, AUTO_DISMISS_MS);
  }, []);

  const value = useMemo<ActionToastContextValue>(
    () => ({
      showError: (message: string) => push("error", message),
      showSuccess: (message: string) => push("success", message),
    }),
    [push],
  );

  return (
    <ActionToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ActionToastContext.Provider>
  );
}

interface ToastViewportProps {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}

function ToastViewport({ toasts, onDismiss }: ToastViewportProps): ReactElement {
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed right-4 top-4 z-[100] flex w-full max-w-sm flex-col gap-2"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: { toast: Toast; onDismiss: (id: number) => void }): ReactElement {
  // Enter animation: simple fade/slide via mount-only opacity transition.
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  const isError = toast.tone === "error";
  return (
    <button
      type="button"
      onClick={() => onDismiss(toast.id)}
      className={[
        "pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3 text-left text-sm shadow-card backdrop-blur-md transition-all duration-150",
        visible ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0",
        isError
          ? "border-error/30 bg-error/10 text-error"
          : "border-success/30 bg-success/10 text-success",
      ].join(" ")}
    >
      {isError ? (
        <XCircle className="mt-0.5 size-4 shrink-0" />
      ) : (
        <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
      )}
      <span className="flex-1 text-white">{toast.message}</span>
    </button>
  );
}

/**
 * Imperative toast helpers — call from `useAction` `onError` / `onSuccess`
 * or after `executeAsync`. Throws if used outside `<ActionToastProvider>`.
 */
export function useActionToast(): ActionToastContextValue {
  const ctx = useContext(ActionToastContext);
  if (!ctx) {
    throw new Error("useActionToast must be used inside <ActionToastProvider>");
  }
  return ctx;
}
