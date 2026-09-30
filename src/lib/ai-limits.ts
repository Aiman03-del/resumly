/** Daily per-user limits for the AI routes. Routes and Settings read this source of truth. */
export const AI_LIMITS = {
  polish: 100,
  ats: 20,
  "job-match": 20,
  "cover-letter": 20,
  "project-link": 30,
} as const;

export type AiRoute = keyof typeof AI_LIMITS;

export const AI_FEATURE_LABELS: Record<AiRoute, string> = {
  polish: "AI polish",
  ats: "ATS check",
  "job-match": "Job match",
  "cover-letter": "Cover letter",
  "project-link": "Project link summary",
};