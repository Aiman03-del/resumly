"use client";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { ResumeRenderer } from "@/components/templates";
import { ResumeData } from "@/types/resume";

export default function PreviewPage({ data, templateId }: { data: ResumeData; templateId: string }) {
  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({ contentRef: printRef });

  return (
    <div>
      <button onClick={() => handlePrint()} className="mb-4 px-4 py-2 rounded-lg bg-primary text-primary-fg">
        Download PDF
      </button>
      <div ref={printRef}>
        <ResumeRenderer templateId={templateId} data={data} />
      </div>
    </div>
  );
}