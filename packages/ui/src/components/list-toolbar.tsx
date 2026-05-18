"use client";

import { Filter } from "lucide-react";
import type { ReactElement } from "react";
import { cn } from "../lib/cn";

export interface ToolbarOption<T extends string> {
  label: string;
  value: T;
}

export interface ListToolbarProps<T extends string> {
  /** Label shown before the toggle group. */
  sortLabel?: string;
  options: ToolbarOption<T>[];
  value: T;
  onChange: (value: T) => void;
  showFilter?: boolean;
  onFilterClick?: () => void;
  className?: string;
}

export function ListToolbar<T extends string>({
  sortLabel = "Sort by:",
  options,
  value,
  onChange,
  showFilter,
  onFilterClick,
  className,
}: ListToolbarProps<T>): ReactElement {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/5 bg-bg-tertiary/40 px-4 py-3",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <span className="text-xs uppercase tracking-wider text-text-subtle">{sortLabel}</span>
        <div className="flex gap-1 rounded-full bg-white/5 p-1">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition",
                value === opt.value
                  ? "bg-gold text-bg-primary"
                  : "text-text-muted hover:text-white",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      {showFilter && (
        <button
          type="button"
          onClick={onFilterClick}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-1.5 text-sm text-white hover:bg-white/5"
        >
          <Filter className="size-4" />
          Filter
        </button>
      )}
    </div>
  );
}
