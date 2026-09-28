import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, FileText } from "lucide-react";
import { ResumeCard } from "@/components/resume-card";
import { normalizeOrder } from "@/lib/section-order";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: resumes } = await supabase.from("resumes").select("*").order("updated_at", { ascending: false });

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

      {!resumes?.length ? (
        <div className="text-center py-24 text-foreground/50">
          <FileText size={32} className="mx-auto mb-3" />
          <p>No resumes yet — create your first one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {resumes.map((r) => (
            <ResumeCard
              key={r.id}
              id={r.id}
              displayName={r.personal_info?.fullName?.trim() || "Untitled Resume"}
              updatedAt={new Date(r.updated_at).toLocaleDateString()}
              templateId={r.template_id ?? "modern"}
              accentColor={r.accent_color ?? undefined}
              data={{
                personalInfo: {
                  fullName: r.personal_info?.fullName ?? "",
                  email: r.personal_info?.email ?? "",
                  phone: r.personal_info?.phone ?? "",
                  role: r.personal_info?.role,
                  location: r.personal_info?.location,
                  photoUrl: r.personal_info?.photoUrl,
                },
                summary: typeof r.summary === "string" ? r.summary : "",
                experience: r.experience ?? [],
                education: r.education ?? [],
                skills: r.skills ?? [],
                projects: r.projects ?? [],
                themeColor: r.theme_color ?? undefined,
                sectionOrder: normalizeOrder(r.section_order),
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}