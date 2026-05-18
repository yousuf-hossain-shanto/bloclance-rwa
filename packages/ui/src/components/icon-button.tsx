"use client";

import { type ReactElement, type ReactNode, forwardRef } from "react";
import { cn } from "../lib/cn";

export type IconButtonTone = "neutral" | "gold" | "danger";

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  label: string;
  tone?: IconButtonTone;
  size?: "sm" | "md";
}

const toneStyles: Record<IconButtonTone, string> = {
  neutral: "border-white/10 text-white hover:bg-white/5",
  gold: "border-gold/40 text-gold hover:bg-gold/10",
  danger: "border-error/40 text-error hover:bg-error/10",
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, label, tone = "neutral", size = "md", className, ...rest },
  ref,
): ReactElement {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      className={cn(
        "inline-flex items-center justify-center rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60",
        size === "sm" ? "size-8" : "size-10",
        toneStyles[tone],
        className,
      )}
      {...rest}
    >
      {icon}
    </button>
  );
});
