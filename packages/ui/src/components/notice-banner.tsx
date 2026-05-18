import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import type { ReactElement, ReactNode } from "react";
import { cn } from "../lib/cn";

export type NoticeTone = "info" | "warning" | "success" | "error";

export interface NoticeBannerProps {
  tone?: NoticeTone;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

const toneStyles: Record<NoticeTone, string> = {
  info: "border-white/10 bg-white/5 text-text-muted",
  warning: "border-amber-400/30 bg-amber-500/10 text-amber-200",
  success: "border-success/30 bg-success/10 text-success",
  error: "border-error/30 bg-error/10 text-error",
};

const defaultIcons: Record<NoticeTone, ReactNode> = {
  info: <Info className="size-4 shrink-0" />,
  warning: <AlertTriangle className="size-4 shrink-0" />,
  success: <CheckCircle2 className="size-4 shrink-0" />,
  error: <XCircle className="size-4 shrink-0" />,
};

export function NoticeBanner({
  tone = "info",
  icon,
  children,
  className,
}: NoticeBannerProps): ReactElement {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border px-4 py-3 text-sm",
        toneStyles[tone],
        className,
      )}
    >
      {icon ?? defaultIcons[tone]}
      <div className="flex-1">{children}</div>
    </div>
  );
}
