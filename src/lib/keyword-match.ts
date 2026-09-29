import { asArray, asRecord, text, type Rec } from "@/lib/resume-text";

export type Importance = "required" | "preferred";

export interface Requirement {
  keyword: string;
  aliases: string[];
  importance: Importance;
}

export interface RequirementResult extends Requirement {
  found: boolean;
}

const MAX_REQUIREMENTS = 30;

/** Lowercase, unify separators and collapse whitespace so "CI/CD" matches "ci cd". */
function normalize(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[-_/\\]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Whole-term match. "java" must not match "javascript", and "c" must not match "c++". */
export function containsTerm(haystack: string, term: string): boolean {
  const needle = normalize(term);
  if (!needle) return false;
  const endsWithSymbol = /[+#]$/.test(needle);
  const after = endsWithSymbol ? "(?![a-z0-9])" : "(?![a-z0-9+#])";
  const pattern = new RegExp(`(?<![a-z0-9])${escapeRegExp(needle)}${after}`);
  return pattern.test(normalize(haystack));
}

/** Flattens the parts of a resume that can legitimately contain keywords (no URLs, fonts, ids). */
export function resumeSearchText(resume: Rec): string {
  const parts: string[] = [];
  const push = (value: unknown) => {
    const str = text(value, 5000);
    if (str) parts.push(str);
  };
  const each = (list: unknown, fields: string[]) => {
    for (const item of asArray(list)) {
      const record = asRecord(item);
      fields.forEach((field) => push(record[field]));
    }
  };

  push(asRecord(resume.personalInfo).role);
  push(resume.summary);
  asArray(resume.skills).forEach(push);
  each(resume.experience, ["role", "company", "description"]);
  each(resume.education, ["degree", "institution"]);
  each(resume.projects, ["name", "description"]);
  each(resume.certifications, ["name", "issuer"]);
  each(resume.languages, ["name"]);
  each(resume.achievements, ["title", "description"]);
  each(resume.awards, ["title", "description"]);
  each(resume.publications, ["title", "description"]);
  each(resume.courses, ["name", "provider", "description"]);

  return normalize(parts.join("\n"));
}

/** Cleans the AI's requirement list: caps sizes, removes duplicates and empty entries. */
export function parseRequirements(raw: unknown): Requirement[] {
  const seen = new Set<string>();
  const result: Requirement[] = [];

  for (const item of asArray(raw)) {
    const entry = asRecord(item);
    const keyword = text(entry.keyword, 60);
    const key = keyword.toLowerCase();
    if (!keyword || seen.has(key)) continue;
    seen.add(key);

    const aliases = asArray(entry.aliases)
      .map((alias) => text(alias, 60))
      .filter((alias) => alias && alias.toLowerCase() !== key)
      .slice(0, 5);

    result.push({
      keyword,
      aliases,
      importance: entry.importance === "required" ? "required" : "preferred",
    });
    if (result.length >= MAX_REQUIREMENTS) break;
  }

  return result;
}

/** Checks every requirement against the resume text. Deterministic: the AI never decides a match. */
export function matchRequirements(requirements: Requirement[], resumeText: string): RequirementResult[] {
  return requirements.map((requirement) => ({
    ...requirement,
    found: [requirement.keyword, ...requirement.aliases].some((term) => containsTerm(resumeText, term)),
  }));
}

/** 0-100. Required keywords weigh twice as much as preferred ones. */
export function computeMatchScore(results: RequirementResult[]): number {
  const weight = (result: RequirementResult) => (result.importance === "required" ? 2 : 1);
  const total = results.reduce((sum, result) => sum + weight(result), 0);
  if (total === 0) return 0;
  const matched = results.reduce((sum, result) => sum + (result.found ? weight(result) : 0), 0);
  return Math.round((matched / total) * 100);
}