import { Mail, Send } from "lucide-react";
import type { ReactElement } from "react";
import { cn } from "../lib/cn";

export interface FooterProps {
  /** Override the disclaimer text. */
  disclaimer?: string;
  className?: string;
}

const DEFAULT_DISCLAIMER =
  "SurgeXRP is a tokenized real-world asset platform. All offerings are subject to regulatory limits and minimum-investment requirements. Past performance does not guarantee future returns. Read the full legal disclaimer before investing.";

export function Footer({ disclaimer, className }: FooterProps): ReactElement {
  return (
    <footer className={cn("mt-24 border-t border-white/5 bg-bg-secondary/60", className)}>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:justify-between">
          <div className="max-w-3xl">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
              Disclaimer
            </h4>
            <p className="mt-2 text-sm text-text-muted">{disclaimer ?? DEFAULT_DISCLAIMER}</p>
            <a
              href="/legal/disclaimer"
              className="mt-3 inline-block text-sm font-medium text-gold hover:underline"
            >
              Read Full Legal Disclaimer →
            </a>
          </div>
          <div className="flex shrink-0 items-start gap-3">
            <a
              href="https://t.me"
              className="rounded-full border border-white/10 p-2 text-white hover:bg-white/5"
              aria-label="Telegram"
            >
              <Send className="size-4" />
            </a>
            <a
              href="mailto:hello@surgexrp.com"
              className="rounded-full border border-white/10 p-2 text-white hover:bg-white/5"
              aria-label="Email"
            >
              <Mail className="size-4" />
            </a>
          </div>
        </div>
        <p className="mt-8 text-xs text-text-subtle">
          © {new Date().getFullYear()} SurgeXRP. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
