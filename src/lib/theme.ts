import type { CSSProperties } from "react";

export const themePresets: { name: string; color: string }[] = [
  { name: "Red", color: "#ef4444" },
  { name: "Orange", color: "#f97316" },
  { name: "Amber", color: "#d97706" },
  { name: "Green", color: "#16a34a" },
  { name: "Teal", color: "#0d9488" },
  { name: "Blue", color: "#2563eb" },
  { name: "Indigo", color: "#4f46e5" },
  { name: "Purple", color: "#8b5cf6" },
  { name: "Pink", color: "#db2777" },
  { name: "Slate", color: "#334155" },
];

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

export function isHexColor(value: unknown): value is string {
  return typeof value === "string" && HEX_COLOR.test(value);
}

function readableForeground(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.65 ? "#171717" : "#ffffff";
}

export function themeStyle(color?: string | null): CSSProperties {
  if (!isHexColor(color)) return {};
  return {
    "--primary": color,
    "--accent": color,
    "--color-primary": color,
    "--color-accent": color,
    "--color-primary-fg": readableForeground(color),
    "--primary-foreground": readableForeground(color),
  } as CSSProperties;
}
