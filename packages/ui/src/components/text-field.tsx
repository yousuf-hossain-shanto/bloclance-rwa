"use client";

import { type ReactElement, type ReactNode, forwardRef } from "react";
import { cn } from "../lib/cn";

export type TextFieldSize = "sm" | "md" | "lg";

export interface TextFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "prefix"> {
  label?: string;
  helperText?: string;
  errorText?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  size?: TextFieldSize;
  containerClassName?: string;
}

const sizeStyles: Record<TextFieldSize, string> = {
  sm: "h-9 text-sm px-3",
  md: "h-11 text-sm px-4",
  lg: "h-12 text-base px-4",
};

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  {
    label,
    helperText,
    errorText,
    prefix,
    suffix,
    size = "md",
    className,
    containerClassName,
    id,
    ...inputProps
  },
  ref,
): ReactElement {
  const inputId =
    id ??
    `tf-${(label ?? inputProps.name ?? "field").toString().replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div className={cn("space-y-2", containerClassName)}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-text-muted">
          {label}
        </label>
      )}
      <div
        className={cn(
          "flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 transition focus-within:border-gold",
          errorText && "border-error",
          sizeStyles[size],
          className,
        )}
      >
        {prefix && <span className="text-text-muted">{prefix}</span>}
        <input
          id={inputId}
          ref={ref}
          className="flex-1 bg-transparent text-white placeholder:text-text-subtle outline-none"
          {...inputProps}
        />
        {suffix && <span className="text-text-muted">{suffix}</span>}
      </div>
      {(helperText || errorText) && (
        <p className={cn("text-xs", errorText ? "text-error" : "text-text-subtle")}>
          {errorText ?? helperText}
        </p>
      )}
    </div>
  );
});
