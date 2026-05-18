import type { ReactElement, ReactNode } from "react";
import { cn } from "../lib/cn";
import { Footer } from "./footer";
import { TopNav, type TopNavLink } from "./top-nav";

export interface AppShellProps {
  children: ReactNode;
  navLinks: TopNavLink[];
  authSlot?: ReactNode;
  brand?: ReactNode;
  /** Use false for narrow modal-style pages. */
  contained?: boolean;
  LinkComponent?: React.ElementType;
  className?: string;
}

export function AppShell({
  children,
  navLinks,
  authSlot,
  brand,
  contained = true,
  LinkComponent,
  className,
}: AppShellProps): ReactElement {
  return (
    <div className={cn("flex min-h-screen flex-col bg-bg-primary text-white", className)}>
      <TopNav links={navLinks} authSlot={authSlot} brand={brand} LinkComponent={LinkComponent} />
      <main className={cn("flex-1", contained && "mx-auto w-full max-w-7xl px-6 py-10")}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
