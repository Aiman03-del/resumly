import type { CSSProperties } from "react";

export type PageTarget = "auto" | "1" | "2";

export const PAGE_TARGETS: { value: PageTarget; label: string }[] = [
  { value: "auto", label: "Auto" },
  { value: "1", label: "1 page" },
  { value: "2", label: "2 pages" },
];

export function normalizePageTarget(value: unknown): PageTarget {
  return value === "1" || value === "2" ? value : "auto";
}

export const FONT_SCALE = { min: 0.8, max: 1.2, step: 0.05, default: 1 } as const;

export function normalizeFontScale(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n <= 0) return FONT_SCALE.default;
  const clamped = Math.min(FONT_SCALE.max, Math.max(FONT_SCALE.min, n));
  return Math.round(clamped * 20) / 20;
}

const TEXT_SIZES_REM: Record<string, number> = {
  xs: 0.75,
  sm: 0.875,
  base: 1,
  lg: 1.125,
  xl: 1.25,
  "2xl": 1.5,
  "3xl": 1.875,
  "4xl": 2.25,
};

export function fontScaleStyle(scale?: number): CSSProperties {
  const normalized = normalizeFontScale(scale ?? FONT_SCALE.default);
  if (normalized === FONT_SCALE.default) return {};
  const style: Record<string, string> = {};
  for (const [name, rem] of Object.entries(TEXT_SIZES_REM)) {
    style[`--text-${name}`] = `${(rem * normalized).toFixed(4)}rem`;
  }
  return style as CSSProperties;
}

export const FULL_BLEED_TEMPLATES = ["bold", "creative", "sidebar-pro"];

const RENDER_WIDTH_PX = 800;
const A4_HEIGHT_PX = (RENDER_WIDTH_PX * 297) / 210;
const PRINT_MARGIN_PX = (RENDER_WIDTH_PX * 24) / 210;

/** Usable height of one printed page, in the 800px-wide layout. */
export function pageHeightPx(templateId: string): number {
  return FULL_BLEED_TEMPLATES.includes(templateId) ? A4_HEIGHT_PX : A4_HEIGHT_PX - PRINT_MARGIN_PX;
}

export function estimatePages(contentHeight: number, templateId: string): number {
  if (contentHeight <= 0) return 1;
  return Math.max(1, Math.ceil((contentHeight - 4) / pageHeightPx(templateId)));
}

const MULTI_COLUMN_TEMPLATES = ["creative", "sidebar-pro", "compact"];

export type AtsStatus = "ok" | "warn" | "risk";
export type AtsLevel = "good" | "warn" | "risk";

export interface AtsItem {
  status: AtsStatus;
  label: string;
}

export function atsFriendlyCheck(input: {
  templateId: string;
  fontScale: number;
  hasPhoto: boolean;
  hasContact: boolean;
  pages: number;
}): { level: AtsLevel; title: string; items: AtsItem[] } {
  const items: AtsItem[] = [];

  items.push(
    MULTI_COLUMN_TEMPLATES.includes(input.templateId)
      ? { status: "risk", label: "Multi-column layout — some ATS read columns in the wrong order" }
      : { status: "ok", label: "Single-column layout" },
  );
  items.push(
    input.hasPhoto
      ? { status: "warn", label: "Photo included — most ATS ignore it, and some employers prefer none" }
      : { status: "ok", label: "No photo" },
  );
  items.push(
    input.fontScale < 0.9
      ? { status: "warn", label: "Text is small — it may be hard to read" }
      : { status: "ok", label: "Readable text size" },
  );
  items.push(
    input.pages > 2
      ? { status: "warn", label: `${input.pages} pages — keep it to 1–2 pages` }
      : { status: "ok", label: "1–2 pages" },
  );
  items.push(
    input.hasContact
      ? { status: "ok", label: "Email and phone present" }
      : { status: "warn", label: "Add an email and phone number" },
  );

  const level: AtsLevel = items.some((item) => item.status === "risk")
    ? "risk"
    : items.some((item) => item.status === "warn")
      ? "warn"
      : "good";
  const title = level === "good" ? "ATS-friendly" : level === "warn" ? "Mostly ATS-friendly" : "May not parse well";
  return { level, title, items };
}