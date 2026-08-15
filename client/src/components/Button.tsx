"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "primary", loading, className = "", children, disabled, ...rest },
  ref
) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";
  const variants: Record<string, string> = {
    primary: "bg-accent text-white hover:bg-accent-hover",
    secondary: "border border-border bg-surface text-text hover:bg-border/40",
    ghost: "text-text hover:bg-surface",
    danger: "text-red-500 hover:bg-red-500/10",
  };

  return (
    <button ref={ref} className={`${base} ${variants[variant]} ${className}`} disabled={disabled || loading} {...rest}>
      {loading && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
});
