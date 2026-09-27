import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, FileText } from "lucide-react";
import { ResumeCard } from "@/components/resume-card";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: resumes } = await supabase.from("resumes").select("*").order("updated_at", { ascending: false });

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">Your Resumes</h1>
        <Link
          href="/builder/new"
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-fg text-sm font-medium"
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
        <div className="grid sm:grid-cols-3 gap-5">
          {resumes.map((r) => (
            <ResumeCard
              key={r.id}
              id={r.id}
              displayName={r.personal_info?.fullName?.trim() || "Untitled Resume"}
              updatedAt={new Date(r.updated_at).toLocaleDateString()}
              templateId={r.template_id ?? "modern"}
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
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}