"use client";

import { X } from "lucide-react";
import { type ReactElement, type ReactNode, useEffect } from "react";
import { cn } from "../lib/cn";

export type ModalShellSize = "sm" | "md" | "lg";
export type ModalShellVariant = "centered" | "drawer";

export interface ModalShellProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  size?: ModalShellSize;
  variant?: ModalShellVariant;
  children: ReactNode;
  footer?: ReactNode;
  hideClose?: boolean;
  className?: string;
}

const sizeStyles: Record<ModalShellSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-xl",
};

export function ModalShell({
  open,
  onClose,
  title,
  subtitle,
  size = "md",
  variant = "centered",
  children,
  footer,
  hideClose = false,
  className,
}: ModalShellProps): ReactElement | null {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent): void {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const drawer = variant === "drawer";

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex backdrop-blur-md",
        "bg-[rgba(11,26,46,0.6)]",
        drawer ? "justify-end" : "items-center justify-center p-4",
      )}
      role="dialog"
      aria-modal="true"
    >
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: backdrop close */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden />
      <div
        className={cn(
          "relative w-full border border-white/10 bg-bg-secondary/95 backdrop-blur-2xl shadow-elevated",
          drawer
            ? "h-full max-w-md overflow-y-auto rounded-l-[40px] p-8"
            : cn("rounded-[40px] p-8 sm:p-10", sizeStyles[size]),
          className,
        )}
      >
        {!hideClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-5 top-5 inline-flex size-9 items-center justify-center rounded-full border border-white/10 text-white hover:bg-white/5"
          >
            <X className="size-4" />
          </button>
        )}
        {(title || subtitle) && (
          <header className="mb-6">
            {title && <h2 className="text-2xl font-semibold text-white">{title}</h2>}
            {subtitle && <p className="mt-2 text-sm text-text-muted">{subtitle}</p>}
          </header>
        )}
        <div className="space-y-4">{children}</div>
        {footer && <footer className="mt-6 space-y-3">{footer}</footer>}
      </div>
    </div>
  );
}
