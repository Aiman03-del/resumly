import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ResumeRenderer } from "@/components/templates";
import { ScaledPreview } from "@/components/scaled-preview";
import { normalizeOrder } from "@/lib/section-order";
import { normalizeFontScale } from "@/lib/page-settings";
import { isHexColor } from "@/lib/theme";
import type { ResumeData } from "@/types/resume";
import { sanitizeResumeUrls } from "@/types/resume";

const SHARE_ID_PATTERN = /^[A-Za-z0-9_-]{8,64}$/;

type SharedRow = {
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
};

const loadSharedResume = cache(async (shareId: string) => {
  if (!SHARE_ID_PATTERN.test(shareId)) return null;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_shared_resume", { p_share_id: shareId });
  if (error) {
    console.error("get_shared_resume failed:", error.message);
    return null;
  }
  if (!data) return null;

  const row = data as SharedRow;
  const basePersonalInfo = row.personal_info ?? { fullName: "", email: "", phone: "" };
  const resume: ResumeData = {
    personalInfo: basePersonalInfo.hideContact === true
      ? { ...basePersonalInfo, email: "", phone: "" }
      : basePersonalInfo,
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
    resume: sanitizeResumeUrls(resume),
    templateId: row.template_id ?? "modern",
    accentColor: isHexColor(row.accent_color) ? row.accent_color : undefined,
  };
});

export async function generateMetadata({ params }: { params: Promise<{ shareId: string }> }): Promise<Metadata> {
  const { shareId } = await params;
  const shared = await loadSharedResume(shareId);
  const name = shared?.resume.personalInfo.fullName?.trim();

  return {
    title: name ? `${name} - Resume` : "Resume",
    robots: { index: false, follow: false },
  };
}

export default async function SharedResumePage({ params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = await params;
  const shared = await loadSharedResume(shareId);
  if (!shared) notFound();

  return (
    <div className="min-h-[calc(100vh-64px)] bg-muted/30 py-6 sm:py-10 px-4 sm:px-6">
      <div className="max-w-200 mx-auto">
        <div className="print-area rounded-lg overflow-hidden shadow-lg bg-white">
          <ScaledPreview>
            <ResumeRenderer templateId={shared.templateId} data={shared.resume} accentColor={shared.accentColor} />
          </ScaledPreview>
        </div>
        <p className="no-print text-center text-xs text-foreground/50 mt-6">
          Made with{" "}
          <Link href="/" className="font-medium text-primary hover:underline">Resumly</Link>
        </p>
      </div>
    </div>
  );
}
