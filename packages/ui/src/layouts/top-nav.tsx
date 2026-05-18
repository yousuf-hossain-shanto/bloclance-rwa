import type { ReactElement, ReactNode } from "react";
import { cn } from "../lib/cn";

export interface TopNavLink {
  href: string;
  label: string;
  active?: boolean;
}

export interface TopNavProps {
  links: TopNavLink[];
  /** Right-side slot: render auth pill or login buttons. */
  authSlot?: ReactNode;
  brand?: ReactNode;
  className?: string;
  LinkComponent?: React.ElementType;
}

function DefaultBrand(): ReactElement {
  return (
    <span className="text-lg font-bold tracking-tight text-white">
      Surge<span className="text-gold">XRP</span>
    </span>
  );
}

export function TopNav({
  links,
  authSlot,
  brand,
  className,
  LinkComponent = "a",
}: TopNavProps): ReactElement {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-white/5 bg-bg-secondary/70 backdrop-blur-md",
        className,
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          {brand ?? <DefaultBrand />}
          <nav className="hidden items-center gap-6 sm:flex">
            {links.map((link) => (
              <LinkComponent
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition",
                  link.active ? "text-white" : "text-text-muted hover:text-white",
                )}
              >
                {link.label}
              </LinkComponent>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">{authSlot}</div>
      </div>
    </header>
  );
}
