import type { ReactElement, ReactNode } from "react";
import { cn } from "../lib/cn";

export interface DetailWithSidebarLayoutProps {
  back?: ReactNode;
  hero?: ReactNode;
  headline: ReactNode;
  sidebar: ReactNode;
  tabs?: ReactNode;
  body?: ReactNode;
  className?: string;
}

export function DetailWithSidebarLayout({
  back,
  hero,
  headline,
  sidebar,
  tabs,
  body,
  className,
}: DetailWithSidebarLayoutProps): ReactElement {
  return (
    <div className={cn("space-y-8", className)}>
      {back}
      {hero}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">{headline}</div>
        <aside className="lg:sticky lg:top-24 lg:self-start">{sidebar}</aside>
      </div>
      {tabs}
      {body}
    </div>
  );
}
