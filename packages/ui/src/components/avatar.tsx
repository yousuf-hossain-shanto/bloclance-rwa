import type { ReactElement } from "react";
import { cn } from "../lib/cn";

export type AvatarSize = "sm" | "md" | "lg" | "xl";

export interface AvatarProps {
  src?: string;
  name: string;
  size?: AvatarSize;
  className?: string;
}

const sizeStyles: Record<AvatarSize, string> = {
  sm: "size-8 text-xs",
  md: "size-12 text-sm",
  lg: "size-16 text-base",
  xl: "size-24 text-xl",
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Avatar({ src, name, size = "md", className }: AvatarProps): ReactElement {
  return (
    <div
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-bg-tertiary text-white font-semibold border border-white/10",
        sizeStyles[size],
        className,
      )}
      aria-label={name}
    >
      {src ? (
        <img src={src} alt={name} className="size-full object-cover" />
      ) : (
        <span>{initials(name)}</span>
      )}
    </div>
  );
}
