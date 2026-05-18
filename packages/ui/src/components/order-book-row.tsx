import type { ReactElement } from "react";
import { cn } from "../lib/cn";

export interface OrderBookRowData {
  bidUnits?: number;
  bidPrice?: string;
  askUnits?: number;
  askPrice?: string;
}

export interface OrderBookRowProps extends OrderBookRowData {
  state?: "default" | "highlighted";
  className?: string;
}

function fmtNumber(n: number | undefined): string {
  return n === undefined ? "—" : n.toLocaleString();
}

function fmtPrice(p: string | undefined): string {
  return p ? `$${p}` : "—";
}

export function OrderBookRow({
  bidUnits,
  bidPrice,
  askUnits,
  askPrice,
  state = "default",
  className,
}: OrderBookRowProps): ReactElement {
  return (
    <div
      className={cn(
        "grid grid-cols-4 gap-2 py-1.5 px-3 text-sm font-mono rounded-md",
        state === "highlighted" && "bg-gold/10",
        className,
      )}
    >
      <span className="text-error">{fmtNumber(bidUnits)}</span>
      <span className="text-error">{fmtPrice(bidPrice)}</span>
      <span className="text-success text-right">{fmtPrice(askPrice)}</span>
      <span className="text-success text-right">{fmtNumber(askUnits)}</span>
    </div>
  );
}
