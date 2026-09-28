"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ResumeRenderer } from "@/components/templates";
import { ScaledPreview } from "@/components/scaled-preview";
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
import { AtsCheck } from "@/components/ats-check";
import { CoverLetter } from "@/components/cover-letter";
import { ShareLink } from "@/components/share-link";
import { SplashLoader } from "@/components/splash-screen";

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
          certifications: resume.certifications ?? [],
          languages: resume.languages ?? [],
          achievements: resume.achievements ?? [],
          awards: resume.awards ?? [],
          publications: resume.publications ?? [],
          courses: resume.courses ?? [],
          themeColor: resume.theme_color ?? undefined,
          sectionOrder: normalizeOrder(resume.section_order),
          fontFamily: resume.personal_info?.fontFamily ?? undefined,
        });
        setTemplateId(resume.template_id ?? "modern");
        setAccentColor(resume.accent_color ?? undefined);
      }
      setLoading(false);
    }
    load();
  }, [resumeId, supabase]);

  if (loading) return <SplashLoader />;

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
            <AtsCheck data={data} />
            <CoverLetter data={data} />
            <ShareLink resumeId={resumeId} />
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
        {/* On-screen copy: always laid out at 800px, then scaled down to fit — phones and laptops see the same page. */}
        <div className="rounded-lg overflow-hidden shadow-lg bg-white print:hidden">
          <ScaledPreview>
            <ResumeRenderer templateId={templateId} data={data} accentColor={accentColor} />
          </ScaledPreview>
        </div>

        {/* Fixed-width copy used for PDF/PNG export and printing, so files look identical on every device. */}
        <div
          aria-hidden
          className="print-area fixed -left-[10000px] top-0 w-[800px] pointer-events-none print:static print:left-auto print:w-full print:pointer-events-auto"
        >
          <div ref={resumeRef}>
            <ResumeRenderer templateId={templateId} data={data} accentColor={accentColor} />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}