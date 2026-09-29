import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus } from "lucide-react";
import { DashboardList, type DashboardItem } from "@/components/dashboard-list";
import { resumeCompletion } from "@/lib/resume-completion";
import { normalizeOrder } from "@/lib/section-order";
import { sanitizeResumeUrls, type ResumeData } from "@/types/resume";
import { versionLabel } from "@/lib/resume-version";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: resumes } = await supabase.from("resumes").select("*").order("updated_at", { ascending: false });

  const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

  const items: DashboardItem[] = (resumes ?? []).map((r) => {
    const fullName = r.personal_info?.fullName?.trim() || "";
    const label = versionLabel(r.title, fullName);
    const data = sanitizeResumeUrls({
      personalInfo: {
        fullName: r.personal_info?.fullName ?? "",
        email: r.personal_info?.email ?? "",
        phone: r.personal_info?.phone ?? "",
        role: r.personal_info?.role,
        location: r.personal_info?.location,
        photoUrl: r.personal_info?.photoUrl,
        fontFamily: r.personal_info?.fontFamily,
      },
      fontFamily: r.personal_info?.fontFamily,
      summary: typeof r.summary === "string" ? r.summary : "",
      experience: r.experience ?? [],
      education: r.education ?? [],
      skills: r.skills ?? [],
      projects: r.projects ?? [],
      certifications: r.certifications ?? [],
      languages: r.languages ?? [],
      achievements: r.achievements ?? [],
      awards: r.awards ?? [],
      publications: r.publications ?? [],
      courses: r.courses ?? [],
      themeColor: r.theme_color ?? undefined,
      sectionOrder: normalizeOrder(r.section_order),
    } as ResumeData);

    return {
      id: r.id,
      displayName: label,
      subtitle: fullName && fullName !== label ? fullName : undefined,
      role: r.personal_info?.role,
      updatedAt: r.updated_at,
      updatedLabel: dateFormat.format(new Date(r.updated_at)),
      templateId: r.template_id ?? "modern",
      accentColor: r.accent_color ?? undefined,
      completion: resumeCompletion(data),
      deletedAt: r.deleted_at ?? null,
      data,
    };
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="flex items-center justify-between gap-3 mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-semibold min-w-0 truncate">Your Resumes</h1>
        <Link
          href="/builder/new"
          className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-fg text-sm font-medium"
        >
          <Plus size={15} /> New Resume
        </Link>
      </div>

      <DashboardList items={items} />
    </div>
  );
}