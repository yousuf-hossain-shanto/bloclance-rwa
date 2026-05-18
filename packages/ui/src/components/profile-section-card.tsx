import type { ReactElement, ReactNode } from "react";
import { cn } from "../lib/cn";
import { SectionHeader } from "./section-header";

export interface ProfileSectionCardProps {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function ProfileSectionCard({
  title,
  subtitle,
  right,
  children,
  className,
}: ProfileSectionCardProps): ReactElement {
  return (
    <section
      className={cn(
        "rounded-2xl border border-white/5 bg-bg-tertiary/40 p-6 backdrop-blur-md",
        className,
      )}
    >
      <SectionHeader title={title} subtitle={subtitle} right={right} size="md" />
      <div className="space-y-4">{children}</div>
    </section>
  );
}
