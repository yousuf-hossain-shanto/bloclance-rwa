"use client";

import { Loader2 } from "lucide-react";
import {
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type ReactElement,
  type ReactNode,
  forwardRef,
} from "react";
import { cn } from "../lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  className?: string;
  children?: ReactNode;
}

export type ButtonProps =
  | (CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { as?: "button" })
  | (CommonProps & AnchorHTMLAttributes<HTMLAnchorElement> & { as: "a"; href: string });

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "text-bg-primary font-semibold shadow-card bg-[linear-gradient(48deg,#AA8B3D_0%,#C8A749_100%)] hover:brightness-110 active:brightness-95",
  secondary: "border border-white/30 text-white hover:bg-white/5 active:bg-white/10",
  ghost: "text-white hover:bg-white/5",
  danger: "border border-error text-error hover:bg-error/10",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-5 text-sm",
  lg: "h-12 px-8 text-base",
};

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      fullWidth = false,
      loading = false,
      leftIcon,
      rightIcon,
      className,
      children,
      ...rest
    },
    ref,
  ): ReactElement {
    const classes = cn(
      "inline-flex items-center justify-center gap-2 rounded-full font-medium transition disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60",
      variantStyles[variant],
      sizeStyles[size],
      fullWidth && "w-full",
      className,
    );

    const inner = (
      <>
        {loading ? <Loader2 className="size-4 animate-spin" /> : leftIcon}
        {children}
        {!loading && rightIcon}
      </>
    );

    if ((rest as { as?: string }).as === "a") {
      const { as: _as, ...anchorProps } = rest as AnchorHTMLAttributes<HTMLAnchorElement> & {
        as: "a";
      };
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          className={classes}
          aria-disabled={loading || undefined}
          {...anchorProps}
        >
          {inner}
        </a>
      );
    }

    const { as: _as, ...buttonProps } = rest as ButtonHTMLAttributes<HTMLButtonElement> & {
      as?: "button";
    };
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={buttonProps.type ?? "button"}
        disabled={loading || buttonProps.disabled}
        className={classes}
        {...buttonProps}
      >
        {inner}
      </button>
    );
  },
);
