"use client";
import { useEffect, useState, type RefObject } from "react";
import { AlertCircle, CheckCircle2, Loader2, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import type { ResumeData } from "@/types/resume";
import {
  FONT_SCALE,
  PAGE_TARGETS,
  atsFriendlyCheck,
  estimatePages,
  normalizeFontScale,
  normalizePageTarget,
  pageHeightPx,
  type AtsLevel,
  type PageTarget,
} from "@/lib/page-settings";

const levelStyle: Record<AtsLevel, string> = {
  good: "bg-green-500/10 text-green-600",
  warn: "bg-amber-500/10 text-amber-600",
  risk: "bg-red-500/10 text-red-600",
};

/** Height of the (unscaled, 800px-wide) resume element. `ready` = the element is mounted. */
export function useContentHeight(ref: RefObject<HTMLElement | null>, ready: boolean) {
  const [height, setHeight] = useState(0);
  useEffect(() => {
    const element = ref.current;
    if (!ready || !element) return;
    const observer = new ResizeObserver(() => setHeight(element.offsetHeight));
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, ready]);
  return height;
}

/** Dashed lines showing where each new page starts. Place inside a `relative` wrapper. */
export function PageGuides({ height, templateId }: { height: number; templateId: string }) {
  const pageHeight = pageHeightPx(templateId);
  const breaks = Math.max(0, estimatePages(height, templateId) - 1);
  return (
    <>
      {Array.from({ length: breaks }, (_, index) => (
        <div
          key={index}
          aria-hidden
          className="no-print pointer-events-none absolute inset-x-0 z-10 border-t-2 border-dashed border-red-400/80"
          style={{ top: (index + 1) * pageHeight }}
        >
          <span className="absolute right-2 -top-6 rounded bg-red-500 px-2 py-0.5 text-[11px] font-medium text-white">
            Page {index + 2} starts here
          </span>
        </div>
      ))}
    </>
  );
}

function AtsBadge({ level, title }: { level: AtsLevel; title: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${levelStyle[level]}`}>
      {level === "good" ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
      {title}
    </span>
  );
}

const nextFrames = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

interface PageQualityCardProps {
  templateId: string;
  target: PageTarget;
  onTargetChange: (target: PageTarget) => void;
  scale: number;
  onScaleChange: (scale: number) => void;
  contentHeight: number;
  /** Current height of the resume element (read fresh while auto-fitting). */
  getHeight: () => number;
  hasPhoto: boolean;
  hasContact: boolean;
}

/** Page target + font size controls with overflow warning and the ATS-friendly indicator. */
export function PageQualityCard({
  templateId,
  target,
  onTargetChange,
  scale,
  onScaleChange,
  contentHeight,
  getHeight,
  hasPhoto,
  hasContact,
}: PageQualityCardProps) {
  const [fitting, setFitting] = useState(false);
  const pages = estimatePages(contentHeight, templateId);
  const limit = target === "auto" ? 0 : Number(target);
  const overflow = limit > 0 && pages > limit;
  const ats = atsFriendlyCheck({ templateId, fontScale: scale, hasPhoto, hasContact, pages });

  async function autoFit() {
    if (!limit) return;
    setFitting(true);
    let next = scale;
    let fits = false;
    while (next > FONT_SCALE.min) {
      next = normalizeFontScale(next - FONT_SCALE.step);
      onScaleChange(next);
      await nextFrames();
      if (estimatePages(getHeight(), templateId) <= limit) {
        fits = true;
        break;
      }
    }
    setFitting(false);
    if (fits) {
      toast.success(`Fits ${limit} page${limit > 1 ? "s" : ""} at ${Math.round(next * 100)}% font size`);
    } else {
      toast.warning("Font size alone can't make this fit", {
        description: "Shorten some descriptions or hide a section, then try again.",
      });
    }
  }

  return (
    <div className="rounded-xl border border-border bg-background p-4 space-y-4">
      <div>
        <p className="text-sm font-medium mb-2">Page length</p>
        <div className="grid grid-cols-3 gap-1 rounded-lg bg-muted p-1">
          {PAGE_TARGETS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onTargetChange(normalizePageTarget(option.value))}
              aria-pressed={target === option.value}
              className={`rounded-md py-1.5 text-xs font-medium transition-colors ${
                target === option.value ? "bg-background shadow-sm" : "text-foreground/60 hover:text-foreground"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label htmlFor="resume-font-size" className="text-sm font-medium">
            Font size
          </label>
          <span className="text-xs text-foreground/60">{Math.round(scale * 100)}%</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onScaleChange(normalizeFontScale(scale - FONT_SCALE.step))}
            disabled={scale <= FONT_SCALE.min || fitting}
            aria-label="Decrease font size"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border hover:bg-muted disabled:opacity-30"
          >
            <Minus size={14} />
          </button>
          <input
            id="resume-font-size"
            type="range"
            min={FONT_SCALE.min * 100}
            max={FONT_SCALE.max * 100}
            step={FONT_SCALE.step * 100}
            value={Math.round(scale * 100)}
            disabled={fitting}
            onChange={(event) => onScaleChange(normalizeFontScale(Number(event.target.value) / 100))}
            className="w-full accent-(--color-primary)"
          />
          <button
            type="button"
            onClick={() => onScaleChange(normalizeFontScale(scale + FONT_SCALE.step))}
            disabled={scale >= FONT_SCALE.max || fitting}
            aria-label="Increase font size"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border hover:bg-muted disabled:opacity-30"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      <div
        role="status"
        className={`rounded-lg px-3 py-2 text-xs ${
          overflow ? "bg-red-500/10 text-red-600" : pages > 2 ? "bg-amber-500/10 text-amber-600" : "bg-green-500/10 text-green-600"
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium">
            {overflow
              ? `Too long: about ${pages} pages (target ${limit})`
              : pages > 2
                ? `About ${pages} pages — a bit long`
                : `About ${pages} page${pages > 1 ? "s" : ""}${limit ? " — fits" : ""}`}
          </span>
          {overflow && (
            <button
              type="button"
              onClick={() => void autoFit()}
              disabled={fitting}
              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-red-600 px-3 py-1 text-[11px] font-medium text-white hover:opacity-90 disabled:opacity-60"
            >
              {fitting && <Loader2 size={11} className="animate-spin" />}
              Auto-fit
            </button>
          )}
        </div>
        {overflow && (
          <p className="mt-1 text-[11px] opacity-80">
            Auto-fit lowers the font size (down to {Math.round(FONT_SCALE.min * 100)}%) until it fits.
          </p>
        )}
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium">ATS check</p>
          <AtsBadge level={ats.level} title={ats.title} />
        </div>
        <ul className="space-y-1">
          {ats.items.map((item) => (
            <li key={item.label} className="flex items-start gap-1.5 text-xs text-foreground/70">
              {item.status === "ok" ? (
                <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-green-600" />
              ) : (
                <AlertCircle
                  size={13}
                  className={`mt-0.5 shrink-0 ${item.status === "risk" ? "text-red-500" : "text-amber-500"}`}
                />
              )}
              {item.label}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[11px] text-foreground/40">Layout check only. For a content score, use ATS check on the preview page.</p>
      </div>
    </div>
  );
}

/** Small read-only summary shown above the resume on the preview page. */
export function PageStatusPill({
  data,
  templateId,
  height,
}: {
  data: ResumeData;
  templateId: string;
  height: number;
}) {
  const target = normalizePageTarget(data.personalInfo.pageTarget);
  const limit = target === "auto" ? 0 : Number(target);
  const pages = estimatePages(height, templateId);
  const overflow = limit > 0 && pages > limit;
  const ats = atsFriendlyCheck({
    templateId,
    fontScale: normalizeFontScale(data.fontScale),
    hasPhoto: Boolean(data.personalInfo.photoUrl),
    hasContact: Boolean(data.personalInfo.email && data.personalInfo.phone),
    pages,
  });

  return (
    <div className="no-print mb-3 flex flex-wrap items-center gap-2">
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
          overflow ? "bg-red-500/10 text-red-600" : "bg-muted text-foreground/70"
        }`}
      >
        {overflow ? <AlertCircle size={13} /> : <CheckCircle2 size={13} />}
        About {pages} page{pages > 1 ? "s" : ""}
        {overflow ? ` (target ${limit})` : ""}
      </span>
      <span title={ats.items.map((item) => item.label).join("\n")}>
        <AtsBadge level={ats.level} title={ats.title} />
      </span>
    </div>
  );
}