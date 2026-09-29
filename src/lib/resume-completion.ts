import type { ResumeData } from "@/types/resume";

const filled = (value?: string | null) => Boolean(value && value.trim());

/** 0–100 score of how complete a resume is. Weights add up to 100. */
export function resumeCompletion(data: ResumeData): number {
  const info = data.personalInfo ?? { fullName: "", email: "", phone: "" };
  const hasExtras = [
    data.projects,
    data.certifications,
    data.languages,
    data.achievements,
    data.awards,
    data.publications,
    data.courses,
  ].some((list) => (list?.length ?? 0) > 0);

  const checks: Array<[weight: number, done: boolean]> = [
    [20, filled(info.fullName) && filled(info.email) && filled(info.phone)],
    [15, filled(data.summary)],
    [25, (data.experience ?? []).some((experience) => filled(experience.role) && filled(experience.company))],
    [15, (data.education ?? []).some((education) => filled(education.institution) && filled(education.degree))],
    [15, (data.skills ?? []).filter(filled).length >= 3],
    [10, hasExtras],
  ];

  return checks.reduce((total, [weight, done]) => total + (done ? weight : 0), 0);
}