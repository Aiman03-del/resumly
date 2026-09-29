"use client";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { PersonalInfoStep } from "@/components/form-steps/personal-info-step";
import { ExperienceStep } from "@/components/form-steps/experience-step";
import { EducationStep } from "@/components/form-steps/education-step";
import { SkillsStep } from "@/components/form-steps/skills-step";
import { ProjectsStep } from "@/components/form-steps/projects-step";
import { CertificationsStep } from "@/components/form-steps/certifications-step";
import { LanguagesStep } from "@/components/form-steps/languages-step";
import { AdditionalSectionStep } from "@/components/form-steps/additional-sections-step";
import { SummaryStep } from "@/components/form-steps/summary-step";
import { Loader2, Check, ChevronLeft, ChevronRight, Redo2, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { SplashLoader } from "@/components/splash-screen";
import type { ResumeData } from "@/types/resume";
import { DesktopPreview, MobilePreview } from "@/components/builder/live-preview";
import { normalizeOrder, type SectionKey } from "@/lib/section-order";
import { isHexColor } from "@/lib/theme";
import { DEFAULT_RESUME_FONT } from "@/lib/font";
import { normalizeFontScale } from "@/lib/page-settings";
import {
  FIELD_COLUMNS,
  clearDraft,
  draftChangesAgainst,
  dropConfirmedUpdates,
  emptyColumnValue,
  fieldForColumn,
  loadDraft,
  saveDraft,
  type DraftUpdates,
  type FieldKey,
} from "@/lib/draft-storage";

type ResumeFormData = Partial<Omit<ResumeData, "personalInfo">> & {
  personalInfo?: Partial<ResumeData["personalInfo"]>;
};

const steps = [
  "personal",
  "experience",
  "education",
  "skills",
  "projects",
  "certifications",
  "languages",
  "achievements",
  "awards",
  "publications",
  "courses",
  "summary",
] as const;
const stepLabels: Record<(typeof steps)[number], string> = {
  personal: "Personal Info",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  projects: "Projects",
  certifications: "Certifications",
  languages: "Languages",
  achievements: "Achievements",
  awards: "Awards & Honors",
  publications: "Publications",
  courses: "Courses / Training",
  summary: "Summary",
};
  const skippableSteps: (typeof steps)[number][] = [
    "experience",
    "education",
    "certifications",
    "languages",
    "achievements",
    "awards",
    "publications",
    "courses",
  ];

export function ResumeBuilderForm({ initialResumeId }: { initialResumeId?: string }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const resumeIdRef = useRef<string | null>(initialResumeId ?? null);

  const [stepIndex, setStepIndex] = useState(0);
  const [resumeData, setResumeData] = useState<ResumeFormData>({});
  const [loading, setLoading] = useState(!!initialResumeId);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [personalInfoValid, setPersonalInfoValid] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const [appearance, setAppearance] = useState<{
    templateId: string;
    themeColor?: string;
    fontFamily: string;
    sectionOrder: SectionKey[];
  }>({
    templateId: "modern",
    fontFamily: DEFAULT_RESUME_FONT,
    sectionOrder: normalizeOrder(),
  });
  const skillsValid = (resumeData.skills?.length ?? 0) > 0;
  const projectsValid = (resumeData.projects?.length ?? 0) > 0;
  const summaryValid = (resumeData.summary?.trim?.().length ?? 0) > 0;

  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedStatusTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingUpdates = useRef<Record<string, unknown>>({});
  // Changes the server has not confirmed yet (includes requests still in flight).
  const unsavedRef = useRef<Record<string, unknown>>({});
  const flushRef = useRef<() => Promise<boolean>>(async () => true);

  // Undo / redo
  const resumeDataRef = useRef<ResumeFormData>({});
  const history = useRef<{
    past: ResumeFormData[];
    future: ResumeFormData[];
    lastKey: string | null;
    lastAt: number;
  }>({ past: [], future: [], lastKey: null, lastAt: 0 });
  const [historyFlags, setHistoryFlags] = useState({ canUndo: false, canRedo: false });
  const [formVersion, setFormVersion] = useState(0);
  const shortcutsRef = useRef<{ undo: () => void; redo: () => void }>({ undo: () => {}, redo: () => {} });

  // Draft recovery
  const [pendingDraft, setPendingDraft] = useState<{ savedAt: number; updates: DraftUpdates } | null>(null);

  const currentStep = steps[stepIndex];

  const previewData = useMemo<ResumeData>(
    () => ({
      personalInfo: {
        ...resumeData.personalInfo,
        fullName: resumeData.personalInfo?.fullName || "Your Name",
        email: resumeData.personalInfo?.email ?? "",
        phone: resumeData.personalInfo?.phone ?? "",
      },
      summary: typeof resumeData.summary === "string" ? resumeData.summary : "",
      experience: resumeData.experience ?? [],
      education: resumeData.education ?? [],
      skills: resumeData.skills ?? [],
      projects: resumeData.projects ?? [],
      certifications: resumeData.certifications ?? [],
      languages: resumeData.languages ?? [],
      achievements: resumeData.achievements ?? [],
      awards: resumeData.awards ?? [],
      publications: resumeData.publications ?? [],
      courses: resumeData.courses ?? [],
      sectionOrder: appearance.sectionOrder,
      themeColor: appearance.themeColor,
      fontFamily: appearance.fontFamily,
      fontScale: normalizeFontScale(resumeData.personalInfo?.fontScale),
    }),
    [resumeData, appearance],
  );

  useEffect(() => {
    if (!initialResumeId) return;

    async function load() {
      const { data, error } = await supabase
        .from("resumes")
        .select("*")
        .eq("id", initialResumeId)
        .single();
      if (!error && data) {
        const loaded: ResumeFormData = {
          personalInfo: data.personal_info ?? {},
          experience: data.experience ?? [],
          education: data.education ?? [],
          skills: data.skills ?? [],
          projects: data.projects ?? [],
          summary:
            typeof data.summary === "string"
              ? data.summary
              : typeof data.summary?.text === "string"
                ? data.summary.text
                : "",
          certifications: data.certifications ?? [],
          languages: data.languages ?? [],
          achievements: data.achievements ?? [],
          awards: data.awards ?? [],
          publications: data.publications ?? [],
          courses: data.courses ?? [],
        };
        resumeDataRef.current = loaded;
        setResumeData(loaded);

        // Offer to restore changes that never reached the server.
        const draft = loadDraft(initialResumeId);
        if (draft) {
          const differing = draftChangesAgainst(draft.updates, data);
          if (Object.keys(differing).length > 0) setPendingDraft({ savedAt: draft.savedAt, updates: differing });
          else clearDraft(initialResumeId);
        }
        setAppearance({
          templateId: data.template_id ?? "modern",
          themeColor: isHexColor(data.theme_color)
            ? data.theme_color
            : isHexColor(data.accent_color)
              ? data.accent_color
              : undefined,
          fontFamily: data.personal_info?.fontFamily ?? DEFAULT_RESUME_FONT,
          sectionOrder: normalizeOrder(data.section_order),
        });
      }
      setLoading(false);
    }
    load();
  }, [initialResumeId, supabase]);

  // A resume that was never saved yet (no id) can still have a local draft.
  useEffect(() => {
    if (initialResumeId) return;
    const timer = setTimeout(() => {
      const draft = loadDraft(null);
      if (draft) setPendingDraft(draft);
    }, 0);
    return () => clearTimeout(timer);
  }, [initialResumeId]);

  const ensureResumeExists = useCallback(async (): Promise<string | null> => {
    if (resumeIdRef.current) return resumeIdRef.current;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("You need to be logged in to save a resume.");
      router.replace("/login");
      return null;
    }

    const { data, error } = await supabase
      .from("resumes")
      .insert({ user_id: user.id, title: "Untitled Resume" })
      .select()
      .single();

    if (error) {
      toast.error("Failed to create resume", { description: error.message });
      return null;
    }

    resumeIdRef.current = data.id;
    window.history.replaceState(null, "", `/builder/${data.id}`);
    return data.id;
  }, [router, supabase]);

  const flushSave = useCallback(async () => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    if (Object.keys(pendingUpdates.current).length === 0) return true;

    setSaveState("saving");
    if (savedStatusTimeout.current) clearTimeout(savedStatusTimeout.current);
    const updates = pendingUpdates.current;
    pendingUpdates.current = {};

    const wasNew = !resumeIdRef.current;
    const id = resumeIdRef.current ?? (await ensureResumeExists());
    if (!id) {
      pendingUpdates.current = { ...updates, ...pendingUpdates.current };
      setSaveState("error");
      return false;
    }
    if (wasNew) clearDraft(null);

    const { error } = await supabase.from("resumes").update(updates).eq("id", id);
    if (error) {
      pendingUpdates.current = { ...updates, ...pendingUpdates.current };
      saveDraft(id, unsavedRef.current);
      setSaveState("error");
      toast.error("Failed to save changes", { description: error.message });
      return false;
    }

    // Confirmed by the server: drop these changes from the local draft
    // (unless the value changed again while the request was in flight).
    unsavedRef.current = dropConfirmedUpdates(unsavedRef.current, updates);
    saveDraft(id, unsavedRef.current);

    setSaveState("saved");
    savedStatusTimeout.current = setTimeout(() => {
      setSaveState("idle");
      savedStatusTimeout.current = null;
    }, 3000);
    return true;
  }, [ensureResumeExists, supabase]);

  const scheduleSave = useCallback(
    (updates: Record<string, unknown>) => {
      pendingUpdates.current = { ...pendingUpdates.current, ...updates };
      unsavedRef.current = { ...unsavedRef.current, ...updates };
      saveDraft(resumeIdRef.current, unsavedRef.current);
      if (savedStatusTimeout.current) clearTimeout(savedStatusTimeout.current);
      setSaveState("saving");
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(flushSave, 800);
    },
    [flushSave]
  );

  function commitData(next: ResumeFormData) {
    resumeDataRef.current = next;
    setResumeData(next);
  }

  function updateHistoryFlags() {
    setHistoryFlags({
      canUndo: history.current.past.length > 0,
      canRedo: history.current.future.length > 0,
    });
  }

  function recordHistory(previous: ResumeFormData, key: string) {
    const currentHistory = history.current;
    const now = Date.now();
    // Typing in the same section within a second counts as one undo step.
    const sameBurst = currentHistory.lastKey === key && now - currentHistory.lastAt < 1000 && currentHistory.past.length > 0;
    currentHistory.lastKey = key;
    currentHistory.lastAt = now;
    if (!sameBurst) {
      currentHistory.past.push(previous);
      if (currentHistory.past.length > 50) currentHistory.past.shift();
    }
    currentHistory.future = [];
    updateHistoryFlags();
  }

  function updateField<K extends keyof ResumeFormData>(
    key: K,
    dbColumn: string,
    value: NonNullable<ResumeFormData[K]>
  ) {
    const previous = resumeDataRef.current;
    if (JSON.stringify(previous[key]) === JSON.stringify(value)) return;
    recordHistory(previous, key);
    commitData({ ...previous, [key]: value });
    scheduleSave({ [dbColumn]: value });
  }

  /** Moves the editor to `target` and saves whichever sections differ from the current state. */
  function applySnapshot(target: ResumeFormData) {
    const current = resumeDataRef.current;
    const updates: Record<string, unknown> = {};
    for (const field of Object.keys(FIELD_COLUMNS) as FieldKey[]) {
      if (JSON.stringify(current[field]) !== JSON.stringify(target[field])) {
        updates[FIELD_COLUMNS[field]] = target[field] ?? emptyColumnValue(field);
      }
    }
    commitData(target);
    setFormVersion((version) => version + 1); // remount the step so its inputs show the restored values
    if (Object.keys(updates).length > 0) scheduleSave(updates);
  }

  function undo() {
    const currentHistory = history.current;
    const target = currentHistory.past.pop();
    if (!target) return;
    currentHistory.future.push(resumeDataRef.current);
    currentHistory.lastKey = null;
    applySnapshot(target);
    updateHistoryFlags();
  }

  function redo() {
    const currentHistory = history.current;
    const target = currentHistory.future.pop();
    if (!target) return;
    currentHistory.past.push(resumeDataRef.current);
    currentHistory.lastKey = null;
    applySnapshot(target);
    updateHistoryFlags();
  }

  function restoreDraft() {
    if (!pendingDraft) return;
    const patch: Record<string, unknown> = {};
    for (const [column, value] of Object.entries(pendingDraft.updates)) {
      const field = fieldForColumn(column);
      if (field) patch[field] = value;
    }
    recordHistory(resumeDataRef.current, "draft-restore");
    history.current.lastKey = null;
    commitData({ ...resumeDataRef.current, ...patch });
    setFormVersion((version) => version + 1);
    scheduleSave(pendingDraft.updates);
    setPendingDraft(null);
  }

  function discardDraft() {
    clearDraft(resumeIdRef.current);
    setPendingDraft(null);
  }

  async function goToStep(index: number) {
    if (!(await flushSave())) return;
    setStepIndex(index);
  }

  async function handleFinish() {
    setNavigating(true);
    if (!(await flushSave())) {
      setNavigating(false);
      return;
    }
    const id = resumeIdRef.current;
    if (!id) {
      toast.error("Please fill in your personal details first.");
      setNavigating(false);
      setStepIndex(0);
      return;
    }
    router.push(`/builder/${id}/templates`);
  }

  useEffect(() => {
    flushRef.current = flushSave;
    shortcutsRef.current = { undo, redo };
  });

  useEffect(() => {
    const hasUnsaved = () => Object.keys(unsavedRef.current).length > 0;

    // Warn before closing or reloading the tab while changes are still unsaved.
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasUnsaved()) return;
      event.preventDefault();
      event.returnValue = "";
    };
    // Push pending changes out as soon as the tab is hidden, or the connection returns.
    const onVisibility = () => {
      if (document.visibilityState === "hidden" && hasUnsaved()) void flushRef.current();
    };
    const onOnline = () => {
      if (hasUnsaved()) void flushRef.current();
    };
    // Ctrl/Cmd+Z and Ctrl+Shift+Z / Ctrl+Y (inputs keep the browser's own text undo).
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return;
      const target = event.target as HTMLElement | null;
      if (target && (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) || target.isContentEditable)) return;
      const key = event.key.toLowerCase();
      if (key === "z" && !event.shiftKey) {
        event.preventDefault();
        shortcutsRef.current.undo();
      } else if ((key === "z" && event.shiftKey) || key === "y") {
        event.preventDefault();
        shortcutsRef.current.redo();
      }
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    window.addEventListener("online", onOnline);
    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("visibilitychange", onVisibility);
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      if (savedStatusTimeout.current) clearTimeout(savedStatusTimeout.current);
      // Leaving the editor (e.g. in-app navigation): save whatever is still pending.
      if (hasUnsaved()) void flushRef.current();
    };
  }, []);

  if (loading) return <SplashLoader />;

  return (
    <div className="w-full max-w-7xl mx-auto py-6 sm:py-10 px-4 sm:px-6">
      <div className="w-full max-w-sm mx-auto flex items-center gap-2 mb-6 sm:mb-8">
        <div className="flex gap-1 flex-1">
          {steps.map((step, index) => (
            <button
              key={step}
              type="button"
              onClick={() => {
                if (
                  (!personalInfoValid && index > 0) ||
                  (!skillsValid && index > steps.indexOf("skills")) ||
                  (!projectsValid && index > steps.indexOf("projects"))
                ) return;
                void goToStep(index);
              }}
              className="group relative flex-1 py-1.5"
              aria-label={`Go to ${stepLabels[step]}`}
              aria-current={index === stepIndex ? "step" : undefined}
            >
              <div className={`h-1 rounded-full transition-colors ${index <= stepIndex ? "bg-primary" : "bg-muted group-hover:bg-primary/40"}`} />
              <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-2 whitespace-nowrap rounded-md bg-foreground text-background text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 hidden sm:block">
                {stepLabels[step]}
              </span>
            </button>
          ))}
        </div>
        { skippableSteps.includes(currentStep) && (
          <button
            type="button"
            onClick={() => goToStep(Math.min(steps.length - 1, stepIndex + 1))}
            className="shrink-0 px-4 py-1.5 rounded-full bg-primary text-primary-fg text-xs font-medium hover:opacity-90 transition-opacity"
          >
            Skip
          </button>
        )}
      </div>

      {pendingDraft && (
        <div
          role="alert"
          className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900"
        >
          <span>We found unsaved changes from {new Date(pendingDraft.savedAt).toLocaleString()}.</span>
          <span className="flex gap-2">
            <button
              type="button"
              onClick={restoreDraft}
              className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-fg"
            >
              Restore
            </button>
            <button
              type="button"
              onClick={discardDraft}
              className="rounded-full border border-amber-400 px-3 py-1 text-xs font-medium"
            >
              Discard
            </button>
          </span>
        </div>
      )}

      <div className="mb-4 flex h-9 items-center justify-between">
        <div className="flex w-20 gap-1">
          <button
            type="button"
            onClick={undo}
            disabled={!historyFlags.canUndo}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30 sm:h-8 sm:w-8"
            aria-label="Undo"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 size={15} />
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={!historyFlags.canRedo}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30 sm:h-8 sm:w-8"
            aria-label="Redo"
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 size={15} />
          </button>
        </div>
        <div className="flex-1 text-center">
          <AnimatePresence mode="wait">
            {saveState === "saving" && (
              <motion.span
                key="saving"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.15 }}
                className="inline-flex items-center gap-1.5 text-xs text-foreground/40"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-pulse" />
                Saving...
              </motion.span>
            )}
            {saveState === "saved" && (
              <motion.span
                key="saved"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.15 }}
                className="inline-flex items-center gap-1 text-xs text-green-600"
              >
                <Check size={12} /> Saved
              </motion.span>
            )}
            {saveState === "error" && (
              <motion.span
                key="error"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.15 }}
                className="inline-flex items-center gap-1.5 text-xs text-amber-600"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Not saved yet — kept on this device
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <div className="w-20" aria-hidden />
      </div>

      {((currentStep === "skills" && !skillsValid) ||
        (currentStep === "projects" && !projectsValid) ||
        (currentStep === "summary" && !summaryValid)) && (
        <p className="text-xs text-amber-600 text-center mb-4">
          {currentStep === "skills" && "Add at least one skill to continue."}
          {currentStep === "projects" && "Add at least one project to continue."}
          {currentStep === "summary" && "Write a short summary to continue."}
        </p>
      )}

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_420px] xl:grid-cols-[minmax(0,1fr)_480px]">
      <div className="flex items-center gap-2 sm:gap-6 lg:gap-6">
        <button
          type="button"
          onClick={() => goToStep(Math.max(0, stepIndex - 1))}
          disabled={stepIndex === 0}
          className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full border border-border disabled:opacity-30 disabled:cursor-not-allowed hover:bg-muted transition-colors"
          aria-label="Previous step"
          title="Previous"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex-1 max-w-2xl mx-auto min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentStep}-${formVersion}`}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
            >
              {currentStep === "personal" && (
                <PersonalInfoStep
                  defaultValues={resumeData.personalInfo ?? {}}
                  onChange={(data) => updateField("personalInfo", "personal_info", {
                    ...data,
                    fontFamily: resumeData.personalInfo?.fontFamily,
                    pageTarget: resumeData.personalInfo?.pageTarget,
                    fontScale: resumeData.personalInfo?.fontScale,
                  })}
                  onValidityChange={setPersonalInfoValid}
                />
              )}
              {currentStep === "experience" && (
                <ExperienceStep
                  defaultValues={resumeData.experience ?? []}
                  onChange={(data) => updateField("experience", "experience", data)}
                />
              )}
              {currentStep === "education" && (
                <EducationStep
                  defaultValues={resumeData.education ?? []}
                  onChange={(data) => updateField("education", "education", data)}
                />
              )}
              {currentStep === "skills" && (
                <SkillsStep
                  defaultValues={resumeData.skills ?? []}
                  onChange={(data) => updateField("skills", "skills", data)}
                />
              )}
              {currentStep === "projects" && (
                <ProjectsStep
                  defaultValues={resumeData.projects ?? []}
                  onChange={(data) => updateField("projects", "projects", data)}
                />
              )}
              {currentStep === "certifications" && (
                <CertificationsStep
                  defaultValues={resumeData.certifications ?? []}
                  onChange={(data) => updateField("certifications", "certifications", data)}
                />
              )}
              {currentStep === "languages" && (
                <LanguagesStep
                  defaultValues={resumeData.languages ?? []}
                  onChange={(data) => updateField("languages", "languages", data)}
                />
              )}
              {currentStep === "achievements" && (
                <AdditionalSectionStep
                  type="achievements"
                  defaultValues={resumeData.achievements ?? []}
                  onChange={(data) => updateField("achievements", "achievements", data)}
                />
              )}
              {currentStep === "awards" && (
                <AdditionalSectionStep
                  type="awards"
                  defaultValues={resumeData.awards ?? []}
                  onChange={(data) => updateField("awards", "awards", data)}
                />
              )}
              {currentStep === "publications" && (
                <AdditionalSectionStep
                  type="publications"
                  defaultValues={resumeData.publications ?? []}
                  onChange={(data) => updateField("publications", "publications", data)}
                />
              )}
              {currentStep === "courses" && (
                <AdditionalSectionStep
                  type="courses"
                  defaultValues={resumeData.courses ?? []}
                  onChange={(data) => updateField("courses", "courses", data)}
                />
              )}
              {currentStep === "summary" && (
                <SummaryStep
                  defaultValue={resumeData.summary ?? ""}
                  onChange={(data) => updateField("summary", "summary", data)}
                  experience={resumeData.experience}
                  projects={resumeData.projects}
                  role={resumeData.personalInfo?.role}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {stepIndex === steps.length - 1 ? (
          <button
            type="button"
            onClick={handleFinish}
            disabled={navigating || !summaryValid}
            className="shrink-0 p-3 rounded-full bg-primary text-primary-fg disabled:opacity-60 hover:opacity-90 transition-opacity"
            aria-label="Choose template"
            title="Choose Template"
          >
            {navigating ? <Loader2 size={20} className="animate-spin" /> : <Check size={20} />}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => goToStep(Math.min(steps.length - 1, stepIndex + 1))}
            disabled={
              (currentStep === "personal" && !personalInfoValid) ||
              (currentStep === "skills" && !skillsValid) ||
              (currentStep === "projects" && !projectsValid)
            }
            className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-primary text-primary-fg disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            aria-label="Next step"
            title="Next"
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>

      <DesktopPreview data={previewData} templateId={appearance.templateId} />
      </div>

      <MobilePreview data={previewData} templateId={appearance.templateId} />
    </div>
  );
}
