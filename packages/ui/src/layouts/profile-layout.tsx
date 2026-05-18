import type { ReactElement, ReactNode } from "react";
import { cn } from "../lib/cn";

export interface ProfileLayoutProps {
  header: ReactNode;
  avatar?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function ProfileLayout({
  header,
  avatar,
  children,
  className,
}: ProfileLayoutProps): ReactElement {
  return (
    <div className={cn("mx-auto max-w-3xl space-y-6", className)}>
      {header}
      {avatar && <div className="flex items-center gap-5">{avatar}</div>}
      <div className="space-y-6">{children}</div>
    </div>
  );
}
