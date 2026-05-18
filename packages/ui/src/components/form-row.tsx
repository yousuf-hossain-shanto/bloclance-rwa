import type { ReactElement, ReactNode } from "react";
import { cn } from "../lib/cn";

export type FormRowTone = "default" | "muted" | "emphasis";

export interface FormRowProps {
  label: ReactNode;
  value: ReactNode;
  tone?: FormRowTone;
  className?: string;
}

export function FormRow({ label, value, tone = "default", className }: FormRowProps): ReactElement {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4",
        tone === "emphasis" && "border-t border-white/10 pt-4",
        className,
      )}
    >
      <span
        className={cn(
          "text-text-muted",
          tone === "emphasis" ? "text-sm font-medium" : "text-sm",
          tone === "muted" && "text-text-subtle",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "text-white",
          tone === "emphasis" ? "text-lg font-semibold text-gold" : "text-sm font-semibold",
        )}
      >
        {value}
      </span>
    </div>
  );
}
