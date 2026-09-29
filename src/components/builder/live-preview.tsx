"use client";
import { useDeferredValue, useState, useSyncExternalStore } from "react";
import { Eye, X } from "lucide-react";
import { ResumeRenderer } from "@/components/templates";
import { ScaledPreview } from "@/components/scaled-preview";
import type { ResumeData } from "@/types/resume";

const DESKTOP_QUERY = "(min-width: 1024px)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(DESKTOP_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function useIsDesktop() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => false,
  );
}

type PreviewProps = {
  data: ResumeData;
  templateId: string;
};

function PreviewPage({ data, templateId }: PreviewProps) {
  const deferredData = useDeferredValue(data);

  return (
    <div className="bg-white shadow-sm">
      <ScaledPreview>
        <ResumeRenderer templateId={templateId} data={deferredData} />
      </ScaledPreview>
    </div>
  );
}

/** Sticky side panel, visible on large screens only. */
export function DesktopPreview({ data, templateId }: PreviewProps) {
  const isDesktop = useIsDesktop();
  if (!isDesktop) return null;

  return (
    <aside
      aria-label="Live resume preview"
      className="sticky top-20 rounded-xl border border-border bg-neutral-100 p-3 shadow-sm"
    >
      <p className="mb-2 px-1 text-xs font-medium text-foreground/50">Live preview</p>
      <div className="max-h-[calc(100vh-9rem)] overflow-y-auto">
        <PreviewPage data={data} templateId={templateId} />
      </div>
    </aside>
  );
}

/** Floating button + full-screen sheet, visible on small screens only. */
export function MobilePreview({ data, templateId }: PreviewProps) {
  const isDesktop = useIsDesktop();
  const [open, setOpen] = useState(false);
  if (isDesktop) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-30 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-fg shadow-lg"
        aria-label="Show resume preview"
      >
        <Eye size={16} /> Preview
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Resume preview"
          className="fixed inset-0 z-50 flex flex-col bg-background"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="text-sm font-medium">Live preview</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full p-1.5 hover:bg-muted"
              aria-label="Close preview"
            >
              <X size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto bg-neutral-100 p-3">
            <PreviewPage data={data} templateId={templateId} />
          </div>
        </div>
      )}
    </>
  );
}