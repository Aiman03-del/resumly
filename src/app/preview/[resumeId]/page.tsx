"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ResumeRenderer } from "@/components/templates";
import type { ResumeData } from "@/types/resume";
import { normalizeOrder } from "@/lib/section-order";
import { Printer, Pencil, ArrowLeft } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DownloadMenu } from "@/components/download-menu";
import { Skeleton } from "@/components/ui/skeleton";

export default function PreviewPage() {
  const { resumeId } = useParams<{ resumeId: string }>();
  const supabase = useMemo(() => createClient(), []);
  const resumeRef = useRef<HTMLDivElement>(null);

  const [data, setData] = useState<ResumeData | null>(null);
  const [templateId, setTemplateId] = useState("modern");
  const [accentColor, setAccentColor] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: resume, error } = await supabase.from("resumes").select("*").eq("id", resumeId).single();
      if (!error && resume) {
        setData({
          personalInfo: resume.personal_info ?? {},
          summary: typeof resume.summary === "string" ? resume.summary : resume.summary?.text ?? "",
          experience: resume.experience ?? [],
          education: resume.education ?? [],
          skills: resume.skills ?? [],
          projects: resume.projects ?? [],
          themeColor: resume.theme_color ?? undefined,
          sectionOrder: normalizeOrder(resume.section_order),
        });
        setTemplateId(resume.template_id ?? "modern");
        setAccentColor(resume.accent_color ?? undefined);
      }
      setLoading(false);
    }
    load();
  }, [resumeId, supabase]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-6 space-y-4">
        <div className="flex justify-end gap-2">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-10 w-10 rounded-lg" />
        </div>
        <div className="rounded-lg border border-border p-10 space-y-6">
          <div className="text-center space-y-2">
            <Skeleton className="h-7 w-56 mx-auto" />
            <Skeleton className="h-3 w-72 mx-auto" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/6" />
          </div>
        </div>
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
    <TooltipProvider>
      {/* Sticky toolbar — full width, own background, never overlaps content */}
      <div className="no-print sticky top-16 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm text-foreground/60 hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Link
                    href={`/builder/${resumeId}`}
                    className="p-2 sm:p-2.5 rounded-lg border border-border hover:bg-muted transition-colors"
                    aria-label="Edit"
                  >
                    <Pencil size={16} />
                  </Link>
                }
              />
              <TooltipContent side="bottom">Edit</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    onClick={() => window.print()}
                    className="p-2 sm:p-2.5 rounded-lg border border-border hover:bg-muted transition-colors"
                    aria-label="Print"
                  >
                    <Printer size={16} />
                  </button>
                }
              />
              <TooltipContent side="bottom">Print</TooltipContent>
            </Tooltip>

            <DownloadMenu targetRef={resumeRef} fileName={data.personalInfo.fullName || "resume"} />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-6 sm:py-8 px-4 sm:px-6">
        <div className="print-area rounded-lg overflow-hidden shadow-lg">
          <div ref={resumeRef}>
            <ResumeRenderer templateId={templateId} data={data} accentColor={accentColor} />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}