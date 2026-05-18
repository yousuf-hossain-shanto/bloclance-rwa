"use client";

import type { ReactElement } from "react";
import { cn } from "../lib/cn";

export interface PaginationBarProps {
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

function pageList(page: number, totalPages: number): (number | "ellipsis")[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const result: (number | "ellipsis")[] = [1];
  if (page > 3) result.push("ellipsis");
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);
  for (let i = start; i <= end; i++) result.push(i);
  if (page < totalPages - 2) result.push("ellipsis");
  result.push(totalPages);
  return result;
}

export function PaginationBar({
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [2, 10, 20, 50],
  className,
}: PaginationBarProps): ReactElement {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);
  const items = pageList(page, totalPages);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-between gap-4 py-6 text-sm text-text-muted sm:flex-row",
        className,
      )}
    >
      <p>
        Showing {start}-{end} of {total} results
      </p>
      <nav className="flex items-center gap-1" aria-label="Pagination">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-md px-2 py-1 disabled:opacity-40 hover:bg-white/5"
        >
          ‹
        </button>
        {items.map((it, idx) =>
          it === "ellipsis" ? (
            // biome-ignore lint/suspicious/noArrayIndexKey: stable in render
            <span key={`e-${idx}`} className="px-2">
              …
            </span>
          ) : (
            <button
              key={it}
              type="button"
              onClick={() => onPageChange(it)}
              className={cn(
                "min-w-8 rounded-md px-2 py-1 text-center",
                it === page ? "bg-gold text-bg-primary" : "hover:bg-white/5",
              )}
              aria-current={it === page ? "page" : undefined}
            >
              {it}
            </button>
          ),
        )}
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="rounded-md px-2 py-1 disabled:opacity-40 hover:bg-white/5"
        >
          ›
        </button>
      </nav>
      {onPageSizeChange && (
        <label className="flex items-center gap-2">
          Rows per page
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="rounded-md border border-white/10 bg-bg-tertiary px-2 py-1 text-white"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}
