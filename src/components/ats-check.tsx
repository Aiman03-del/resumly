"use client";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Loader2, RefreshCw, ScanEye, X } from "lucide-react";
import type { ResumeData } from "@/types/resume";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type Priority = "high" | "medium" | "low";
interface AtsResult {
  score: number;
  verdict: string;
  breakdown: { key: string; label: string; max: number; score: number; note: string }[];
  strengths: string[];
  suggestions: { title: string; detail: string; priority: Priority }[];
}
const priorityStyle: Record<Priority, string> = {
  high: "bg-red-500/10 text-red-600",
  medium: "bg-amber-500/10 text-amber-600",
  low: "bg-foreground/5 text-foreground/60",
};
function tone(percent: number) {
  if (percent >= 80) return { text: "text-green-600", bar: "bg-green-500", label: "Strong" };
  if (percent >= 60) return { text: "text-amber-500", bar: "bg-amber-500", label: "Good start" };
  return { text: "text-red-500", bar: "bg-red-500", label: "Needs work" };
}
const subscribeNoop = () => () => {};
function ScoreRing({ score }: { score: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className={`relative w-32 h-32 shrink-0 ${tone(score).text}`}>
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r={radius} fill="none" strokeWidth="10" className="stroke-foreground/10" />
        <motion.circle cx="60" cy="60" r={radius} fill="none" strokeWidth="10" strokeLinecap="round" stroke="currentColor" strokeDasharray={circumference} initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset: circumference * (1 - score / 100) }} transition={{ duration: 0.9, ease: "easeOut" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-3xl font-bold">{score}</span><span className="text-[10px] uppercase tracking-wider text-foreground/50">out of 100</span></div>
    </div>
  );
}
export function AtsCheck({ data }: { data: ResumeData }) {
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AtsResult | null>(null);
  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/ats", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resume: { personalInfo: data.personalInfo, summary: data.summary, experience: data.experience, education: data.education, skills: data.skills, projects: data.projects } }) });
      const payload = (await response.json()) as AtsResult & { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "ATS check failed");
      setResult(payload);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [data]);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  function openPanel() {
    setOpen(true);
    if (!result && !loading) void run();
  }
  const overall = result ? tone(result.score) : null;
  return (
    <>
      <Tooltip>
        <TooltipTrigger
          render={<button type="button" onClick={openPanel} aria-label="ATS check" className="p-2 sm:p-2.5 rounded-lg bg-accent/10 text-accent border border-accent/30 hover:bg-accent/20 transition-colors" />}
        >
          <ScanEye size={16} />
        </TooltipTrigger>
        <TooltipContent side="bottom">ATS check</TooltipContent>
      </Tooltip>
      {mounted && createPortal(
        <AnimatePresence>
          {open && (
            <motion.div key="ats-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} className="no-print fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8">
              <motion.div initial={{ opacity: 0, scale: 0.96, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 10 }} transition={{ duration: 0.2 }} onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label="ATS check" className="bg-background rounded-2xl max-w-xl w-full max-h-[85vh] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0"><span className="flex items-center gap-2 font-medium"><ScanEye size={16} className="text-accent" /> ATS check</span><button type="button" onClick={() => setOpen(false)} aria-label="Close" className="text-foreground/50 hover:text-foreground"><X size={18} /></button></div>
                <div className="overflow-y-auto p-5 space-y-6">
                  {loading && <div className="py-16 flex flex-col items-center justify-center gap-3 text-sm text-foreground/60"><Loader2 size={22} className="animate-spin text-accent" />Reading your resume…</div>}
                  {!loading && error && <div className="py-12 flex flex-col items-center text-center gap-3"><AlertCircle size={22} className="text-red-500" /><p className="text-sm text-foreground/70 max-w-sm">{error}</p><button type="button" onClick={() => void run()} className="px-4 py-1.5 rounded-full bg-primary text-primary-fg text-xs font-medium hover:opacity-90 transition-opacity">Try again</button></div>}
                  {!loading && !error && result && overall && (
                    <>
                      <div className="flex items-center gap-5"><ScoreRing score={result.score} /><div className="min-w-0"><p className={`text-sm font-semibold ${overall.text}`}>{overall.label}</p>{result.verdict && <p className="text-sm text-foreground/70 mt-1">{result.verdict}</p>}</div></div>
                      <div><h3 className="text-xs font-semibold uppercase tracking-wider text-foreground/50 mb-3">Score breakdown</h3><div className="space-y-3">{result.breakdown.map((item, index) => { const percent = (item.score / item.max) * 100; return <div key={item.key}><div className="flex items-center justify-between text-xs mb-1"><span className="font-medium">{item.label}</span><span className="text-foreground/50">{item.score}/{item.max}</span></div><div className="h-1.5 rounded-full bg-foreground/10 overflow-hidden"><motion.div className={`h-full rounded-full ${tone(percent).bar}`} initial={{ width: 0 }} animate={{ width: `${percent}%` }} transition={{ duration: 0.6, delay: 0.1 + index * 0.05 }} /></div>{item.note && <p className="text-[11px] text-foreground/50 mt-1">{item.note}</p>}</div>; })}</div></div>
                      {result.strengths.length > 0 && <div><h3 className="text-xs font-semibold uppercase tracking-wider text-foreground/50 mb-3">Strengths</h3><ul className="space-y-2">{result.strengths.map((strength) => <li key={strength} className="flex items-start gap-2 text-sm text-foreground/70"><CheckCircle2 size={15} className="text-green-600 shrink-0 mt-0.5" />{strength}</li>)}</ul></div>}
                      {result.suggestions.length > 0 && <div><h3 className="text-xs font-semibold uppercase tracking-wider text-foreground/50 mb-3">What to add or change</h3><ul className="space-y-2.5">{result.suggestions.map((suggestion) => <li key={suggestion.title} className="rounded-xl border border-border p-3"><div className="flex items-start justify-between gap-3"><p className="text-sm font-medium">{suggestion.title}</p><span className={`shrink-0 text-[10px] font-medium uppercase tracking-wide px-2 py-0.5 rounded-full ${priorityStyle[suggestion.priority]}`}>{suggestion.priority}</span></div><p className="text-xs text-foreground/60 mt-1">{suggestion.detail}</p></li>)}</ul></div>}
                    </>
                  )}
                </div>
                <div className="px-5 py-3 border-t border-border shrink-0 flex items-center justify-between gap-3"><p className="text-[11px] text-foreground/40">AI estimate based on your resume content, not a scan by a real ATS.</p>{result && <button type="button" onClick={() => void run()} disabled={loading} className="shrink-0 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-border hover:bg-muted transition-colors disabled:opacity-50"><RefreshCw size={12} /> Run again</button>}</div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
