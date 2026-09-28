"use client";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Check, Copy, ExternalLink, Loader2, Share2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const subscribeNoop = () => () => {};

function newShareId() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function ShareLink({ resumeId }: { resumeId: string }) {
  const supabase = useMemo(() => createClient(), []);
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [shareId, setShareId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const url = mounted && shareId ? `${window.location.origin}/r/${shareId}` : "";

  async function openPanel() {
    setOpen(true);
    setError(null);
    if (loaded) return;

    const { data, error: loadError } = await supabase
      .from("resumes")
      .select("share_id, is_public")
      .eq("id", resumeId)
      .single();

    if (loadError) {
      setError(`Could not load sharing settings: ${loadError.message}`);
      return;
    }
    setIsPublic(Boolean(data.is_public) && Boolean(data.share_id));
    setShareId(data.share_id ?? null);
    setLoaded(true);
  }

  async function toggleSharing() {
    const enable = !isPublic;
    setSaving(true);
    setError(null);
    const nextShareId = enable ? newShareId() : null;
    const { error: updateError } = await supabase
      .from("resumes")
      .update({ is_public: enable, share_id: nextShareId })
      .eq("id", resumeId);

    setSaving(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setIsPublic(enable);
    setShareId(nextShareId);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy automatically. Select the link and copy it manually.");
    }
  }

  return (
    <>
      <button type="button" onClick={() => void openPanel()} aria-label="Share" className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm font-medium">
        <Share2 size={16} />
        <span className="hidden sm:inline">Share</span>
      </button>

      {mounted && createPortal(
        <AnimatePresence>
          {open && (
            <motion.div key="share-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} className="no-print fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8">
              <motion.div initial={{ opacity: 0, scale: 0.96, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 10 }} transition={{ duration: 0.2 }} onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label="Share resume" className="bg-background rounded-2xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
                  <span className="flex items-center gap-2 font-medium"><Share2 size={16} className="text-primary" /> Share your resume</span>
                  <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="text-foreground/50 hover:text-foreground"><X size={18} /></button>
                </div>
                <div className="overflow-y-auto p-5 space-y-5">
                  {!loaded && !error && <div className="py-10 flex items-center justify-center gap-2 text-sm text-foreground/60"><Loader2 size={16} className="animate-spin" />Loading…</div>}
                  {error && <div className="flex items-start gap-2 text-sm text-red-600 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2"><AlertCircle size={15} className="shrink-0 mt-0.5" /><p>{error}</p></div>}
                  {loaded && (
                    <>
                      <div className="flex items-start justify-between gap-4">
                        <div><p className="text-sm font-medium">Public link</p><p className="text-xs text-foreground/60 mt-0.5">{isPublic ? "Anyone with the link can view this resume." : "Only you can see this resume."}</p></div>
                        <button type="button" role="switch" aria-checked={isPublic} aria-label="Public link" onClick={() => void toggleSharing()} disabled={saving} className={`relative shrink-0 w-11 h-6 rounded-full transition-colors disabled:opacity-60 ${isPublic ? "bg-primary" : "bg-foreground/20"}`}><span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${isPublic ? "translate-x-5" : ""}`} /></button>
                      </div>
                      {isPublic && url && (
                        <div className="flex gap-2">
                          <input readOnly value={url} onFocus={(event) => event.currentTarget.select()} aria-label="Public resume link" className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-border bg-muted/30 text-xs" />
                          <button type="button" onClick={() => void copyLink()} className="shrink-0 flex items-center gap-1.5 text-xs font-medium px-3.5 py-2 rounded-lg bg-primary text-primary-fg hover:opacity-90 transition-opacity">{copied ? <Check size={13} /> : <Copy size={13} />}{copied ? "Copied" : "Copy"}</button>
                          <a href={url} target="_blank" rel="noopener noreferrer" aria-label="Open the public page in a new tab" className="shrink-0 flex items-center px-3 rounded-lg border border-border hover:bg-muted transition-colors"><ExternalLink size={14} /></a>
                        </div>
                      )}
                      <p className="text-[11px] text-foreground/40">The public page shows everything on your resume, including your email and phone number. Search engines are asked not to list it. Turning sharing off stops the link immediately, and turning it back on creates a new link.</p>
                    </>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
