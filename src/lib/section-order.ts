export type SectionKey = "summary" | "experience" | "education" | "skills" | "projects";

export const SECTION_LABELS: Record<SectionKey, string> = {
  summary: "Summary",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  projects: "Projects",
};

export const DEFAULT_SECTION_ORDER: SectionKey[] = [
  "summary",
  "experience",
  "education",
  "skills",
  "projects",
];

export function normalizeOrder(order?: string[] | null): SectionKey[] {
  const valid = (order ?? []).filter((key): key is SectionKey =>
    (DEFAULT_SECTION_ORDER as string[]).includes(key)
  );
  const deduped = valid.filter((key, index) => valid.indexOf(key) === index);
  const missing = DEFAULT_SECTION_ORDER.filter((key) => !deduped.includes(key));
  return [...deduped, ...missing];
}

export function pickOrder<T extends SectionKey>(order: readonly SectionKey[], keys: readonly T[]): T[] {
  return order.filter((key): key is T => keys.includes(key as T));
}
