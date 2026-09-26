"use client";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useReactToPrint } from "react-to-print";
import { createClient } from "@/lib/supabase/client";
import { ResumeRenderer } from "@/components/templates";
import { ResumeData } from "@/types/resume";
import { Download, Loader2 } from "lucide-react";

export default function PreviewPage() {
  const { resumeId } = useParams<{ resumeId: string }>();
  const supabase = createClient();
  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({ contentRef: printRef });

  const [data, setData] = useState<ResumeData | null>(null);
  const [templateId, setTemplateId] = useState("modern");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: resume, error } = await supabase.from("resumes").select("*").eq("id", resumeId).single();
      if (!error && resume) {
        setData({
          personalInfo: resume.personal_info ?? {},
          summary: resume.summary ?? "",
          experience: resume.experience ?? [],
          education: resume.education ?? [],
          skills: resume.skills ?? [],
          projects: resume.projects ?? [],
        });
        setTemplateId(resume.template_id ?? "modern");
      }
      setLoading(false);
    }
    load();
  }, [resumeId]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={24} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center text-foreground/50">
        Resume not found.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <div className="flex justify-end mb-4">
        <button
          onClick={() => handlePrint()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-fg text-sm font-medium"
        >
          <Download size={15} /> Download PDF
        </button>
      </div>
      <div ref={printRef} className="shadow-lg rounded-lg overflow-hidden">
        <ResumeRenderer templateId={templateId} data={data} />
      </div>
    </div>
  );
}