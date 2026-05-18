"use client";

import type { ReactElement, ReactNode } from "react";
import { cn } from "../lib/cn";

export type TabsVariant = "pill" | "underline" | "segmented";
export type TabsSize = "sm" | "md";

export interface TabsOption<T extends string> {
  label: string;
  value: T;
  count?: number;
  icon?: ReactNode;
}

export interface TabsProps<T extends string> {
  options: TabsOption<T>[];
  value: T;
  onChange: (value: T) => void;
  variant?: TabsVariant;
  size?: TabsSize;
  fullWidth?: boolean;
  className?: string;
}

export function Tabs<T extends string>({
  options,
  value,
  onChange,
  variant = "pill",
  size = "md",
  fullWidth = false,
  className,
}: TabsProps<T>): ReactElement {
  const sizing = size === "sm" ? "text-xs h-8 px-3" : "text-sm h-9 px-4";

  if (variant === "underline") {
    return (
      <div
        role="tablist"
        className={cn("flex items-center gap-6 border-b border-white/5", className)}
      >
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              key={opt.value}
              role="tab"
              type="button"
              aria-selected={active}
              onClick={() => onChange(opt.value)}
              className={cn(
                "relative -mb-px flex items-center gap-2 border-b-2 py-3 font-medium transition",
                size === "sm" ? "text-sm" : "text-base",
                active
                  ? "border-gold text-white"
                  : "border-transparent text-text-muted hover:text-white",
              )}
            >
              {opt.icon}
              {opt.label}
              {typeof opt.count === "number" && (
                <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-text-muted">
                  {opt.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // pill + segmented
  const containerBase = variant === "segmented" ? "bg-white/5 rounded-full p-1 gap-1" : "gap-2";
  return (
    <div
      role="tablist"
      className={cn("inline-flex items-center", containerBase, fullWidth && "w-full", className)}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-full font-medium transition",
              sizing,
              fullWidth && "flex-1",
              active
                ? "bg-gold text-bg-primary"
                : variant === "segmented"
                  ? "text-text-muted hover:text-white"
                  : "border border-white/10 text-text-muted hover:text-white",
            )}
          >
            {opt.icon}
            {opt.label}
            {typeof opt.count === "number" && (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs",
                  active ? "bg-bg-primary/10" : "bg-white/5",
                )}
              >
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
