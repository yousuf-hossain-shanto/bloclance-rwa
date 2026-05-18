"use client";

import { type ReactElement, forwardRef } from "react";
import { cn } from "../lib/cn";

export interface AssetAmountInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  /** Asset code shown as suffix (XRP, RLUSD). */
  asset?: string;
  /** Show MAX shortcut button. */
  onMaxClick?: () => void;
  helperText?: string;
  errorText?: string;
}

export const AssetAmountInput = forwardRef<HTMLInputElement, AssetAmountInputProps>(
  function AssetAmountInput(
    { label, asset, onMaxClick, helperText, errorText, className, id, ...inputProps },
    ref,
  ): ReactElement {
    const inputId = id ?? `aai-${label.replace(/\s+/g, "-").toLowerCase()}`;
    return (
      <div className={cn("space-y-2", className)}>
        <label htmlFor={inputId} className="text-sm font-medium text-text-muted">
          {label}
        </label>
        <div
          className={cn(
            "flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition",
            "focus-within:border-gold",
            errorText && "border-error",
          )}
        >
          <input
            id={inputId}
            ref={ref}
            type="text"
            inputMode="decimal"
            className="flex-1 bg-transparent text-base text-white placeholder:text-text-subtle outline-none"
            {...inputProps}
          />
          {onMaxClick && (
            <button
              type="button"
              onClick={onMaxClick}
              className="rounded-md border border-gold/40 px-2 py-0.5 text-xs font-semibold text-gold hover:bg-gold/10"
            >
              Max
            </button>
          )}
          {asset && (
            <span className="rounded-md bg-white/5 px-2 py-1 text-xs font-semibold text-white">
              {asset}
            </span>
          )}
        </div>
        {(helperText || errorText) && (
          <p className={cn("text-xs", errorText ? "text-error" : "text-text-subtle")}>
            {errorText ?? helperText}
          </p>
        )}
      </div>
    );
  },
);
