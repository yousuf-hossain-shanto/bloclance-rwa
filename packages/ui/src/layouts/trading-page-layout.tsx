import type { ReactElement, ReactNode } from "react";
import { cn } from "../lib/cn";

export interface TradingPageLayoutProps {
  back?: ReactNode;
  assetHeader: ReactNode;
  chart: ReactNode;
  orderBook: ReactNode;
  ticket: ReactNode;
  className?: string;
}

export function TradingPageLayout({
  back,
  assetHeader,
  chart,
  orderBook,
  ticket,
  className,
}: TradingPageLayoutProps): ReactElement {
  return (
    <div className={cn("space-y-6", className)}>
      {back}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {assetHeader}
          {chart}
          {orderBook}
        </div>
        <div className="lg:sticky lg:top-24 lg:self-start">{ticket}</div>
      </div>
    </div>
  );
}
