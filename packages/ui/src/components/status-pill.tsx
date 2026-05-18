import type { ReactElement, ReactNode } from "react";
import { cn } from "../lib/cn";

export type StatusTone = "success" | "warning" | "error" | "neutral" | "gold";

export interface StatusPillProps {
  tone?: StatusTone;
  children: ReactNode;
  className?: string;
}

const toneStyles: Record<StatusTone, string> = {
  success: "bg-success/20 text-success",
  warning: "bg-amber-500/20 text-amber-300",
  error: "bg-error/20 text-error",
  neutral: "bg-white/10 text-white/70",
  gold: "bg-gold/15 text-gold",
};

export function StatusPill({
  tone = "neutral",
  children,
  className,
}: StatusPillProps): ReactElement {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        toneStyles[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
