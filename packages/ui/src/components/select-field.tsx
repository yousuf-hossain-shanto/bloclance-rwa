"use client";

import { ChevronDown } from "lucide-react";
import { type ReactElement, type ReactNode, forwardRef } from "react";
import { cn } from "../lib/cn";

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectFieldProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size" | "prefix"> {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  helperText?: string;
  errorText?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  size?: "sm" | "md";
  containerClassName?: string;
}

const sizeStyles = {
  sm: "h-9 text-sm px-3",
  md: "h-11 text-sm px-4",
};

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(function SelectField(
  {
    label,
    options,
    placeholder,
    helperText,
    errorText,
    prefix,
    suffix,
    size = "md",
    className,
    containerClassName,
    id,
    value,
    ...rest
  },
  ref,
): ReactElement {
  const selectId =
    id ?? `sf-${(label ?? rest.name ?? "field").toString().replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div className={cn("space-y-2", containerClassName)}>
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-text-muted">
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
        <select
          id={selectId}
          ref={ref}
          value={value ?? ""}
          className="flex-1 appearance-none bg-transparent text-white outline-none [&>option]:bg-bg-secondary [&>option]:text-white"
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {suffix ?? <ChevronDown className="size-4 text-text-muted" aria-hidden />}
      </div>
      {(helperText || errorText) && (
        <p className={cn("text-xs", errorText ? "text-error" : "text-text-subtle")}>
          {errorText ?? helperText}
        </p>
      )}
    </div>
  );
});
