"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PersonalInfoStep } from "@/components/form-steps/personal-info-step";
import { ExperienceStep } from "@/components/form-steps/experience-step";
import { EducationStep } from "@/components/form-steps/education-step";
import { SkillsStep } from "@/components/form-steps/skills-step";
import { ProjectsStep } from "@/components/form-steps/projects-step";
import { SummaryStep } from "@/components/form-steps/summary-step";

const steps = ["personal", "experience", "education", "skills", "projects", "summary"] as const;

export default function BuilderPage() {
  const [stepIndex, setStepIndex] = useState(0);
  const [resumeData, setResumeData] = useState<any>({});
  const currentStep = steps[stepIndex];

  return (
    <div className="max-w-2xl mx-auto py-10 px-6">
      <div className="flex gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= stepIndex ? "bg-primary" : "bg-muted"}`} />
        ))}
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
              onChange={(data) => setResumeData((prev: any) => ({ ...prev, personalInfo: data }))}
            />
          )}
          {currentStep === "experience" && (
            <ExperienceStep
              defaultValues={resumeData.experience ?? []}
              onChange={(data) => setResumeData((prev: any) => ({ ...prev, experience: data }))}
            />
          )}
          {currentStep === "education" && (
            <EducationStep
              defaultValues={resumeData.education ?? []}
              onChange={(data) => setResumeData((prev: any) => ({ ...prev, education: data }))}
            />
          )}
          {currentStep === "skills" && (
            <SkillsStep
              defaultValues={resumeData.skills ?? []}
              onChange={(data) => setResumeData((prev: any) => ({ ...prev, skills: data }))}
            />
          )}
          {currentStep === "projects" && (
            <ProjectsStep
              defaultValues={resumeData.projects ?? []}
              onChange={(data) => setResumeData((prev: any) => ({ ...prev, projects: data }))}
            />
          )}
          {currentStep === "summary" && (
            <SummaryStep
              defaultValue={resumeData.summary ?? ""}
              onChange={(data) => setResumeData((prev: any) => ({ ...prev, summary: data }))}
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
        <button
          onClick={() => setStepIndex((i) => Math.min(steps.length - 1, i + 1))}
          className="px-4 py-2 rounded-lg bg-primary text-primary-fg"
        >
          {stepIndex === steps.length - 1 ? "Finish" : "Next"}
        </button>
      </div>
    </div>
  );
}