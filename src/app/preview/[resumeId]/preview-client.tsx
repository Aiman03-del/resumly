"use client";
import { useRef } from "react";
import Link from "next/link";
import { ResumeRenderer } from "@/components/templates";
import { ScaledPreview } from "@/components/scaled-preview";
import type { ResumeData } from "@/types/resume";
import { FULL_BLEED_TEMPLATES } from "@/lib/page-settings";
import { PageStatusPill, useContentHeight } from "@/components/page-quality";
import { Printer, Pencil, ArrowLeft } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DownloadMenu } from "@/components/download-menu";
import { AtsCheck } from "@/components/ats-check";
import { JobMatch } from "@/components/job-match";
import { CoverLetter } from "@/components/cover-letter";
import { ShareLink } from "@/components/share-link";

interface PreviewClientProps {
  resumeId: string;
  data: ResumeData;
  templateId: string;
  accentColor?: string;
}

export function PreviewClient({ resumeId, data, templateId, accentColor }: PreviewClientProps) {
  const resumeRef = useRef<HTMLDivElement>(null);
  const contentHeight = useContentHeight(resumeRef, true);

  return (
    <TooltipProvider>
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
            <JobMatch data={data} />
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

            <DownloadMenu
              targetRef={resumeRef}
              fileName={data.personalInfo.fullName || "resume"}
              fullBleed={FULL_BLEED_TEMPLATES.includes(templateId)}
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-6 sm:py-8 px-4 sm:px-6">
        <PageStatusPill data={data} templateId={templateId} height={contentHeight} />
        <div className="rounded-lg overflow-hidden shadow-lg bg-white print:hidden">
          <ScaledPreview>
            <ResumeRenderer templateId={templateId} data={data} accentColor={accentColor} />
          </ScaledPreview>
        </div>

        <div
          aria-hidden
          className="print-area fixed left-[-10000px] top-0 w-[800px] pointer-events-none print:static print:left-auto print:w-full print:pointer-events-auto"
        >
          <div ref={resumeRef}>
            <ResumeRenderer templateId={templateId} data={data} accentColor={accentColor} />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
