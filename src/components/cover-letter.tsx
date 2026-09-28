"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ArrowLeft, Check, Copy, FileText, Loader2, RefreshCw, Sparkles, X } from "lucide-react";
import type { ResumeData } from "@/types/resume";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const TONES = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "confident", label: "Confident" },
] as const;
type Tone = (typeof TONES)[number]["value"];
const MAX_JOB_LENGTH = 6000;
const MIN_JOB_LENGTH = 40;
const subscribeNoop = () => () => {};

function ErrorNote({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 text-sm text-red-600 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
      <AlertCircle size={15} className="shrink-0 mt-0.5" />
      <p>{message}</p>
    </div>
  );
}

export function CoverLetter({ data }: { data: ResumeData }) {
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"form" | "letter">("form");
  const [jobDescription, setJobDescription] = useState("");
  const [tone, setTone] = useState<Tone>("professional");
  const [letter, setLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const canGenerate = jobDescription.trim().length >= MIN_JOB_LENGTH && !loading;
  const wordCount = letter.trim() ? letter.trim().split(/\s+/).length : 0;

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume: {
            personalInfo: data.personalInfo,
            summary: data.summary,
            experience: data.experience,
            education: data.education,
            skills: data.skills,
            projects: data.projects,
          },
          jobDescription,
          tone,
        }),
      });
      const payload = (await response.json()) as { letter?: string; error?: string };
      if (!response.ok || !payload.letter) throw new Error(payload.error ?? "Could not write the cover letter");
      setLetter(payload.letter);
      setStep("letter");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function copyLetter() {
    try {
      await navigator.clipboard.writeText(letter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy automatically. Select the text and copy it manually.");
    }
  }

  return (
    <>
      <Tooltip>
        <TooltipTrigger
          render={<button type="button" onClick={() => setOpen(true)} aria-label="Cover letter" className="p-2 sm:p-2.5 rounded-lg bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition-colors" />}
        >
          <FileText size={16} />
        </TooltipTrigger>
        <TooltipContent side="bottom">Cover letter</TooltipContent>
      </Tooltip>

      {mounted && createPortal(
        <AnimatePresence>
          {open && (
            <motion.div key="cover-letter-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} className="no-print fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8">
              <motion.div initial={{ opacity: 0, scale: 0.96, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 10 }} transition={{ duration: 0.2 }} onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label="Cover letter" className="bg-background rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
                  <span className="flex items-center gap-2 font-medium"><FileText size={16} className="text-primary" /> Cover letter</span>
                  <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="text-foreground/50 hover:text-foreground"><X size={18} /></button>
                </div>

                <div className="overflow-y-auto p-5">
                  {step === "form" ? (
                    <div className="space-y-5">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label htmlFor="job-description" className="text-sm font-medium">Job description</label>
                          <span className="text-[11px] text-foreground/40">{jobDescription.length}/{MAX_JOB_LENGTH}</span>
                        </div>
                        <textarea id="job-description" autoFocus value={jobDescription} onChange={(event) => setJobDescription(event.target.value)} maxLength={MAX_JOB_LENGTH} rows={9} placeholder="Paste the full job posting here: the role, responsibilities and requirements." className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
                        <p className="text-[11px] text-foreground/40 mt-1">The letter is written from your resume. Only facts already in it are used.</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1.5">Tone</p>
                        <div className="flex flex-wrap gap-2">
                          {TONES.map((item) => (
                            <button key={item.value} type="button" onClick={() => setTone(item.value)} aria-pressed={tone === item.value} className={`px-3.5 py-1.5 rounded-full border text-xs font-medium transition-colors ${tone === item.value ? "bg-primary text-primary-fg border-primary" : "border-border hover:bg-muted"}`}>
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      {error && <ErrorNote message={error} />}
                      <button type="button" onClick={() => void generate()} disabled={!canGenerate} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-primary text-primary-fg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
                        {loading ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                        {loading ? "Writing your letter…" : "Write my cover letter"}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="relative">
                        <textarea value={letter} onChange={(event) => setLetter(event.target.value)} readOnly={loading} rows={16} className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm leading-relaxed" />
                        {loading && <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-lg bg-background/80 backdrop-blur-[1px] text-sm text-foreground/70"><Loader2 size={16} className="animate-spin" />Writing your letter…</div>}
                      </div>
                      <p className="text-[11px] text-foreground/40">{wordCount} words. You can edit the text before copying. It is not saved, so copy it before you close this page.</p>
                      {error && <ErrorNote message={error} />}
                    </div>
                  )}
                </div>

                {step === "letter" && (
                  <div className="px-5 py-3 border-t border-border shrink-0 flex items-center justify-between gap-3">
                    <button type="button" onClick={() => { setError(null); setStep("form"); }} className="flex items-center gap-1.5 text-xs font-medium text-foreground/60 hover:text-foreground transition-colors"><ArrowLeft size={13} /> Change job or tone</button>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => void generate()} disabled={loading} className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-border hover:bg-muted transition-colors disabled:opacity-50"><RefreshCw size={12} /> Regenerate</button>
                      <button type="button" onClick={() => void copyLetter()} disabled={loading || !letter.trim()} className="flex items-center gap-1.5 text-xs font-medium px-3.5 py-1.5 rounded-full bg-primary text-primary-fg hover:opacity-90 transition-opacity disabled:opacity-50">{copied ? <Check size={12} /> : <Copy size={12} />}{copied ? "Copied" : "Copy"}</button>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
