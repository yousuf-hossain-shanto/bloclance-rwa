import type { ReactElement, ReactNode } from "react";
import { cn } from "../lib/cn";

export interface CenteredListPageProps {
  header: ReactNode;
  toolbar?: ReactNode;
  children: ReactNode;
  pagination?: ReactNode;
  /** Grid layout for the children area. Defaults to 4-col on lg. */
  gridClassName?: string;
  className?: string;
}

export function CenteredListPage({
  header,
  toolbar,
  children,
  pagination,
  gridClassName,
  className,
}: CenteredListPageProps): ReactElement {
  return (
    <div className={cn("space-y-6", className)}>
      {header}
      {toolbar}
      <div className={cn("grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4", gridClassName)}>
        {children}
      </div>
      {pagination}
    </div>
  );
}
