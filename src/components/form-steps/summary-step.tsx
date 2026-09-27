"use client";
import { useState } from "react";
import { PolishButton } from "@/components/polish-button";
import type { ResumeData } from "@/types/resume";

export function SummaryStep({
  defaultValue,
  onChange,
  experience,
  projects,
  role,
}: {
  defaultValue: string;
  onChange: (data: string) => void;
  experience?: ResumeData["experience"];
  projects?: ResumeData["projects"];
  role?: string;
}) {
  const [summary, setSummary] = useState(defaultValue ?? "");

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Professional Summary</h2>
        <PolishButton
          section="summary"
          content={summary}
          context={{ experience, projects, role }}
          onPolished={(text) => { setSummary(text); onChange(text); }}
        />
      </div>
      <textarea
        value={summary}
        onChange={(e) => { setSummary(e.target.value); onChange(e.target.value); }}
        rows={5}
        className="w-full px-3 py-2 rounded-lg border border-border bg-background"
        placeholder="Write a line or two about your career aim, then click AI to expand it..."
      />
      <p className="text-xs text-foreground/40">
        Tip: jot down your career goal in a line, then let AI turn it into a full summary using your experience and projects.
      </p>
    </div>
  );
}