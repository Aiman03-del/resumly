"use client";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ArrowLeft, Check, Target, X } from "lucide-react";
import type { ResumeData } from "@/types/resume";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SplashLoader } from "@/components/splash-screen";
import { ScoreRing, tone } from "@/components/ats-check";

const MIN_LENGTH = 80;
const MAX_LENGTH = 8000;

type Importance = "required" | "preferred";
type Priority = "high" | "medium" | "low";

interface Keyword {
  keyword: string;
  importance: Importance;
}

interface JobMatchResult {
  matchScore: number;
  jobTitle: string;
  verdict: string;
  relevance: string;
  matched: Keyword[];
  missing: Keyword[];
  suggestions: { title: string; detail: string; priority: Priority }[];
}

const priorityStyle: Record<Priority, string> = {
  high: "bg-red-500/10 text-red-600",
  medium: "bg-amber-500/10 text-amber-600",
  low: "bg-foreground/5 text-foreground/60",
};

const subscribeNoop = () => () => {};

function KeywordChips({ items, variant }: { items: Keyword[]; variant: "matched" | "missing" }) {
  if (items.length === 0) return <p className="text-xs text-foreground/50">None</p>;

  const style =
    variant === "matched"
      ? "bg-green-500/10 text-green-700 border-green-500/30"
      : "bg-red-500/10 text-red-600 border-red-500/30";

  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <li key={item.keyword} className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs ${style}`}>
          {item.keyword}
          {item.importance === "required" && (
            <span className="text-[9px] font-semibold uppercase tracking-wide opacity-70">req</span>
          )}
        </li>
      ))}
    </ul>
  );
}

export function JobMatch({ data }: { data: ResumeData }) {
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const [open, setOpen] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<JobMatchResult | null>(null);

  const trimmedLength = jobDescription.trim().length;
  const canRun = trimmedLength >= MIN_LENGTH && trimmedLength <= MAX_LENGTH && !loading;

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/job-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription,
          resume: {
            personalInfo: data.personalInfo,
            summary: data.summary,
            experience: data.experience,
            education: data.education,
            skills: data.skills,
            projects: data.projects,
            certifications: data.certifications,
            languages: data.languages,
            achievements: data.achievements,
            awards: data.awards,
            publications: data.publications,
            courses: data.courses,
          },
        }),
      });
      const payload = (await response.json()) as JobMatchResult & { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Job match failed");
      setResult(payload);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [data, jobDescription]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const level = result ? tone(result.matchScore) : null;
  const showForm = !loading && !result;

  return (
    <>
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Match to a job"
              className="p-2 sm:p-2.5 rounded-lg bg-accent/10 text-accent border border-accent/30 hover:bg-accent/20 transition-colors"
            />
          }
        >
          <Target size={16} />
        </TooltipTrigger>
        <TooltipContent side="bottom">Match to a job</TooltipContent>
      </Tooltip>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                key="job-match-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setOpen(false)}
                className="no-print fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 10 }}
                  transition={{ duration: 0.2 }}
                  onClick={(event) => event.stopPropagation()}
                  role="dialog"
                  aria-modal="true"
                  aria-label="Job match"
                  className="bg-background rounded-2xl max-w-xl w-full max-h-[85vh] overflow-hidden flex flex-col"
                >
                  <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
                    <span className="flex items-center gap-2 font-medium">
                      <Target size={16} className="text-accent" /> Job match
                    </span>
                    <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="text-foreground/50 hover:text-foreground">
                      <X size={18} />
                    </button>
                  </div>

                  <div className="overflow-y-auto p-5 space-y-6">
                    {loading && <SplashLoader size="panel" label="Comparing with the job…" />}

                    {showForm && (
                      <div className="space-y-3">
                        <label htmlFor="job-description" className="text-sm font-medium">
                          Paste the job description
                        </label>
                        <textarea
                          id="job-description"
                          value={jobDescription}
                          onChange={(event) => setJobDescription(event.target.value)}
                          rows={10}
                          maxLength={MAX_LENGTH + 500}
                          placeholder="Paste the full job posting here: responsibilities, requirements, and skills."
                          className="w-full rounded-xl border border-border bg-transparent p-3 text-sm outline-none focus:border-primary resize-y"
                        />
                        <div className="flex items-center justify-between gap-3">
                          <span className={`text-xs ${trimmedLength > MAX_LENGTH ? "text-red-500" : "text-foreground/50"}`}>
                            {trimmedLength}/{MAX_LENGTH}
                          </span>
                          <button
                            type="button"
                            onClick={() => void run()}
                            disabled={!canRun}
                            className="px-4 py-1.5 rounded-full bg-primary text-primary-fg text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            Analyze match
                          </button>
                        </div>
                        {error && (
                          <p className="flex items-start gap-2 text-sm text-red-500">
                            <AlertCircle size={16} className="shrink-0 mt-0.5" /> {error}
                          </p>
                        )}
                      </div>
                    )}

                    {!loading && result && level && (
                      <>
                        <div className="flex items-center gap-5">
                          <ScoreRing score={result.matchScore} />
                          <div className="min-w-0">
                            <p className={`text-sm font-semibold ${level.text}`}>
                              {result.matchScore >= 80 ? "Strong match" : result.matchScore >= 60 ? "Partial match" : "Weak match"}
                            </p>
                            {result.jobTitle && <p className="text-xs text-foreground/50 mt-0.5">{result.jobTitle}</p>}
                            {result.verdict && <p className="text-sm text-foreground/70 mt-1">{result.verdict}</p>}
                          </div>
                        </div>

                        {result.relevance && (
                          <div>
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground/50 mb-2">Relevance</h3>
                            <p className="text-sm text-foreground/70">{result.relevance}</p>
                          </div>
                        )}

                        <div>
                          <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-foreground/50 mb-3">
                            <Check size={13} className="text-green-600" /> Matching keywords ({result.matched.length})
                          </h3>
                          <KeywordChips items={result.matched} variant="matched" />
                        </div>

                        <div>
                          <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-foreground/50 mb-3">
                            <X size={13} className="text-red-500" /> Missing keywords ({result.missing.length})
                          </h3>
                          <KeywordChips items={result.missing} variant="missing" />
                        </div>

                        {result.suggestions.length > 0 && (
                          <div>
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground/50 mb-3">How to tailor your resume</h3>
                            <ul className="space-y-2.5">
                              {result.suggestions.map((suggestion) => (
                                <li key={suggestion.title} className="rounded-xl border border-border p-3">
                                  <div className="flex items-start justify-between gap-3">
                                    <p className="text-sm font-medium">{suggestion.title}</p>
                                    <span className={`shrink-0 text-[10px] font-medium uppercase tracking-wide px-2 py-0.5 rounded-full ${priorityStyle[suggestion.priority]}`}>
                                      {suggestion.priority}
                                    </span>
                                  </div>
                                  <p className="text-xs text-foreground/60 mt-1">{suggestion.detail}</p>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <div className="px-5 py-3 border-t border-border shrink-0 flex items-center justify-between gap-3">
                    <p className="text-[11px] text-foreground/40">
                      Keywords are matched against your resume text. Only add skills you really have.
                    </p>
                    {result && !loading && (
                      <button
                        type="button"
                        onClick={() => {
                          setResult(null);
                          setError(null);
                        }}
                        className="shrink-0 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-border hover:bg-muted transition-colors"
                      >
                        <ArrowLeft size={12} /> New job
                      </button>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}