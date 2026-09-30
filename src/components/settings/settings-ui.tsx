"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";

export const inputClass =
  "w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-sm disabled:opacity-60";

export function SettingsCard({
  title,
  description,
  children,
  danger = false,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  danger?: boolean;
}) {
  return (
    <section className={`rounded-2xl border p-5 sm:p-6 ${danger ? "border-red-300/70" : "border-border"}`}>
      <h2 className={`font-semibold ${danger ? "text-red-600" : ""}`}>{title}</h2>
      {description && <p className="text-sm text-foreground/60 mt-1 mb-4">{description}</p>}
      {!description && <div className="mb-4" />}
      {children}
    </section>
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="text-sm font-medium">{label}</label>
      {children}
      {hint && <p className="text-xs text-foreground/50 mt-1">{hint}</p>}
    </div>
  );
}

export function SaveButton({
  loading,
  children,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean; variant?: "primary" | "outline" | "danger" }) {
  const styles = {
    primary: "bg-primary text-primary-fg hover:opacity-90",
    outline: "border border-border hover:bg-muted",
    danger: "bg-red-600 text-white hover:bg-red-700",
  }[variant];
  return (
    <button
      type="button"
      {...props}
      disabled={loading || props.disabled}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-60 ${styles} ${props.className ?? ""}`}
    >
      {loading && <Loader2 size={15} className="animate-spin" />}
      {children}
    </button>
  );
}

export function Switch({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative shrink-0 w-11 h-6 rounded-full transition-colors disabled:opacity-60 ${checked ? "bg-primary" : "bg-foreground/20"}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : ""}`} />
    </button>
  );
}