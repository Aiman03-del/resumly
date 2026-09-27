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
import { SummaryStep } from "@/components/form-steps/summary-step";
import { Loader2, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { ResumeData } from "@/types/resume";

type ResumeFormData = Partial<Omit<ResumeData, "personalInfo">> & {
  personalInfo?: Partial<ResumeData["personalInfo"]>;
};

const steps = ["personal", "experience", "education", "skills", "projects", "summary"] as const;
const stepLabels: Record<(typeof steps)[number], string> = {
  personal: "Personal Info",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  projects: "Projects",
  summary: "Summary",
};

export function ResumeBuilderForm({ initialResumeId }: { initialResumeId?: string }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const resumeIdRef = useRef<string | null>(initialResumeId ?? null);

  const [stepIndex, setStepIndex] = useState(0);
  const [resumeData, setResumeData] = useState<ResumeFormData>({});
  const [loading, setLoading] = useState(!!initialResumeId);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [personalInfoValid, setPersonalInfoValid] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const skillsValid = (resumeData.skills?.length ?? 0) > 0;
  const projectsValid = (resumeData.projects?.length ?? 0) > 0;
  const summaryValid = (resumeData.summary?.trim?.().length ?? 0) > 0;

  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedStatusTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingUpdates = useRef<Record<string, unknown>>({});

  const currentStep = steps[stepIndex];

  useEffect(() => {
    if (!initialResumeId) return;

    async function load() {
      const { data, error } = await supabase
        .from("resumes")
        .select("*")
        .eq("id", initialResumeId)
        .single();
      if (!error && data) {
        setResumeData({
          personalInfo: data.personal_info,
          experience: data.experience,
          education: data.education,
          skills: data.skills,
          projects: data.projects,
          summary: data.summary?.text ?? data.summary ?? "",
        });
      }
      setLoading(false);
    }
    load();
  }, [initialResumeId, supabase]);

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

    const id = resumeIdRef.current ?? (await ensureResumeExists());
    if (!id) {
      pendingUpdates.current = { ...updates, ...pendingUpdates.current };
      setSaveState("idle");
      return false;
    }

    const { error } = await supabase.from("resumes").update(updates).eq("id", id);
    if (error) {
      pendingUpdates.current = { ...updates, ...pendingUpdates.current };
      setSaveState("idle");
      toast.error("Failed to save changes", { description: error.message });
      return false;
    }

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
      if (savedStatusTimeout.current) clearTimeout(savedStatusTimeout.current);
      setSaveState("saving");
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(flushSave, 800);
    },
    [flushSave]
  );

  function updateField<K extends keyof ResumeFormData>(
    key: K,
    dbColumn: string,
    value: NonNullable<ResumeFormData[K]>
  ) {
    setResumeData((previous) => ({ ...previous, [key]: value }));
    scheduleSave({ [dbColumn]: value });
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

  useEffect(() => () => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    if (savedStatusTimeout.current) clearTimeout(savedStatusTimeout.current);
  }, []);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-6">
        <div className="flex gap-2 mb-8">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-1.5 flex-1 rounded-full" />
          ))}
        </div>
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-6">
      <div className="max-w-sm mx-auto flex items-center gap-2 mb-8">
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
              <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-2 whitespace-nowrap rounded-md bg-foreground text-background text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                {stepLabels[step]}
              </span>
            </button>
          ))}
        </div>
        {["experience", "education"].includes(currentStep) && (
          <button
            type="button"
            onClick={() => goToStep(Math.min(steps.length - 1, stepIndex + 1))}
            className="shrink-0 px-4 py-1.5 rounded-full bg-primary text-primary-fg text-xs font-medium hover:opacity-90 transition-opacity"
          >
            Skip
          </button>
        )}
      </div>

      <div className="h-5 mb-4 text-center">
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
        </AnimatePresence>
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

      <div className="flex items-center gap-6 lg:gap-10">
        <button
          type="button"
          onClick={() => goToStep(Math.max(0, stepIndex - 1))}
          disabled={stepIndex === 0}
          className="shrink-0 p-3 rounded-full border border-border disabled:opacity-30 disabled:cursor-not-allowed hover:bg-muted transition-colors"
          aria-label="Previous step"
          title="Previous"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex-1 max-w-2xl mx-auto min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
            >
              {currentStep === "personal" && (
                <PersonalInfoStep
                  defaultValues={resumeData.personalInfo ?? {}}
                  onChange={(data) => updateField("personalInfo", "personal_info", data)}
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
            className="shrink-0 p-3 rounded-full bg-primary text-primary-fg disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            aria-label="Next step"
            title="Next"
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
}
