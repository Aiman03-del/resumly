"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { PersonalInfoStep } from "@/components/form-steps/personal-info-step";
import { ExperienceStep } from "@/components/form-steps/experience-step";
import { EducationStep } from "@/components/form-steps/education-step";
import { SkillsStep } from "@/components/form-steps/skills-step";
import { ProjectsStep } from "@/components/form-steps/projects-step";
import { SummaryStep } from "@/components/form-steps/summary-step";
import { Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const steps = ["personal", "experience", "education", "skills", "projects", "summary"] as const;

export default function BuilderPage() {
  const { resumeId } = useParams<{ resumeId: string }>();
  const router = useRouter();
  const supabase = createClient();

  const [stepIndex, setStepIndex] = useState(0);
  const [resumeData, setResumeData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [personalInfoValid, setPersonalInfoValid] = useState(false);
  const [navigating, setNavigating] = useState(false);

  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingUpdates = useRef<Record<string, any>>({});

  const currentStep = steps[stepIndex];

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.from("resumes").select("*").eq("id", resumeId).single();
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
  }, [resumeId]);

  // Immediately writes any pending changes — call this before navigating away from the page
  const flushSave = useCallback(async () => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    if (Object.keys(pendingUpdates.current).length === 0) return true;

    setSaveState("saving");
    const updates = pendingUpdates.current;
    pendingUpdates.current = {};

    const { error } = await supabase.from("resumes").update(updates).eq("id", resumeId);
    if (error) {
      pendingUpdates.current = { ...updates, ...pendingUpdates.current };
      setSaveState("idle");
      toast.error("Failed to save changes", { description: error.message });
      return false;
    }

    setSaveState("saved");
    return true;
  }, [resumeId]);

  const scheduleSave = useCallback(
    (updates: Record<string, any>) => {
      pendingUpdates.current = { ...pendingUpdates.current, ...updates };
      setSaveState("saving");
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(flushSave, 800);
    },
    [flushSave]
  );

  function updateField(key: string, dbColumn: string, value: any) {
    setResumeData((prev: any) => ({ ...prev, [key]: value }));
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
    router.push(`/builder/${resumeId}/templates`);
  }

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
    <div className="max-w-2xl mx-auto py-10 px-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex gap-2 flex-1">
          {steps.map((s, i) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= stepIndex ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>
        <div className="ml-4 text-xs text-foreground/40 w-16 text-right">
          {saveState === "saving" && "Saving..."}
          {saveState === "saved" && (
            <span className="flex items-center gap-1 justify-end text-green-600">
              <Check size={12} /> Saved
            </span>
          )}
        </div>
      </div>

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
            />
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between mt-8">
        <button
          onClick={() => goToStep(Math.max(0, stepIndex - 1))}
          disabled={stepIndex === 0}
          className="px-4 py-2 rounded-lg border border-border disabled:opacity-40"
        >
          Back
        </button>

        {stepIndex === steps.length - 1 ? (
          <button
            onClick={handleFinish}
            disabled={navigating}
            className="px-4 py-2 rounded-lg bg-primary text-primary-fg disabled:opacity-60 flex items-center gap-2"
          >
            {navigating && <Loader2 size={14} className="animate-spin" />}
            Choose Template
          </button>
        ) : (
          <button
            onClick={() => goToStep(Math.min(steps.length - 1, stepIndex + 1))}
            disabled={currentStep === "personal" && !personalInfoValid}
            className="px-4 py-2 rounded-lg bg-primary text-primary-fg disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}