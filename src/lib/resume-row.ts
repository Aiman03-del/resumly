import type { ResumeData } from "@/types/resume";
import { sanitizeResumeUrls } from "@/types/resume";
import { normalizeOrder } from "@/lib/section-order";
import { normalizeFontScale } from "@/lib/page-settings";
import { isHexColor } from "@/lib/theme";

/** The columns the preview needs. user_id, share_id and is_public are deliberately not here. */
export interface ResumeRow {
  personal_info?: ResumeData["personalInfo"] | null;
  summary?: string | { text?: string } | null;
  experience?: ResumeData["experience"] | null;
  education?: ResumeData["education"] | null;
  skills?: ResumeData["skills"] | null;
  projects?: ResumeData["projects"] | null;
  certifications?: ResumeData["certifications"] | null;
  languages?: ResumeData["languages"] | null;
  achievements?: ResumeData["achievements"] | null;
  awards?: ResumeData["awards"] | null;
  publications?: ResumeData["publications"] | null;
  courses?: ResumeData["courses"] | null;
  template_id?: string | null;
  theme_color?: string | null;
  accent_color?: string | null;
  section_order?: string[] | null;
}

export function rowToPreview(row: ResumeRow): {
  data: ResumeData;
  templateId: string;
  accentColor?: string;
} {
  const data: ResumeData = {
    personalInfo: row.personal_info ?? { fullName: "", email: "", phone: "" },
    summary: typeof row.summary === "string" ? row.summary : row.summary?.text ?? "",
    experience: row.experience ?? [],
    education: row.education ?? [],
    skills: row.skills ?? [],
    projects: row.projects ?? [],
    certifications: row.certifications ?? [],
    languages: row.languages ?? [],
    achievements: row.achievements ?? [],
    awards: row.awards ?? [],
    publications: row.publications ?? [],
    courses: row.courses ?? [],
    themeColor: isHexColor(row.theme_color) ? row.theme_color : undefined,
    sectionOrder: normalizeOrder(row.section_order),
    fontFamily: row.personal_info?.fontFamily ?? undefined,
    fontScale: normalizeFontScale(row.personal_info?.fontScale),
  };
  return {
    data: sanitizeResumeUrls(data),
    templateId: row.template_id ?? "modern",
    accentColor: isHexColor(row.accent_color) ? row.accent_color : undefined,
  };
}
