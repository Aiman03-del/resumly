"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { PersonalInfoStep } from "@/components/form-steps/personal-info-step";
import { ExperienceStep } from "@/components/form-steps/experience-step";
import { EducationStep } from "@/components/form-steps/education-step";
import { SkillsStep } from "@/components/form-steps/skills-step";
import { ProjectsStep } from "@/components/form-steps/projects-step";
import { SummaryStep } from "@/components/form-steps/summary-step";
import { Loader2, Check } from "lucide-react";

const steps = ["personal", "experience", "education", "skills", "projects", "summary"] as const;

export default function BuilderPage() {
  const { resumeId } = useParams<{ resumeId: string }>();
  const supabase = createClient();

  const [stepIndex, setStepIndex] = useState(0);
  const [resumeData, setResumeData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentStep = steps[stepIndex];

  // Load existing resume
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

  // Debounced auto-save
  const scheduleSave = useCallback(
    (updates: Record<string, any>) => {
      setSaveState("saving");
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(async () => {
        await supabase.from("resumes").update(updates).eq("id", resumeId);
        setSaveState("saved");
      }, 800);
    },
    [resumeId]
  );

  function updateField(key: string, dbColumn: string, value: any) {
    setResumeData((prev: any) => ({ ...prev, [key]: value }));
    scheduleSave({ [dbColumn]: value });
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={24} />
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
          onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
          disabled={stepIndex === 0}
          className="px-4 py-2 rounded-lg border border-border disabled:opacity-40"
        >
          Back
        </button>
        {stepIndex === steps.length - 1 ? (
          <a
            href={`/builder/${resumeId}/templates`}
            className="px-4 py-2 rounded-lg bg-primary text-primary-fg"
          >
            Choose Template
          </a>
        ) : (
          <button
            onClick={() => setStepIndex((i) => Math.min(steps.length - 1, i + 1))}
            className="px-4 py-2 rounded-lg bg-primary text-primary-fg"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}