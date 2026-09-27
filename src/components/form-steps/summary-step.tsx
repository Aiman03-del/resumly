"use client";
import { useState } from "react";
import { Loader2 } from "lucide-react";
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
  const [generating, setGenerating] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Professional Summary</h2>
        <PolishButton
          section="summary"
          content={summary}
          context={{ experience, projects, role }}
          onPolished={(text) => { setSummary(text); onChange(text); }}
          onLoadingChange={setGenerating}
        />
      </div>
      <div className="relative">
        <textarea
          value={summary}
          onChange={(event) => { setSummary(event.target.value); onChange(event.target.value); }}
          rows={5}
          disabled={generating}
          className="w-full px-3 py-2 rounded-lg border border-border bg-background disabled:opacity-60"
          placeholder="Optional: jot a line about your career aim — or leave this empty and click AI to generate a full summary from your role, experience, and projects."
        />
        {generating && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-lg bg-background/80 backdrop-blur-[1px] text-sm text-foreground/70">
            <Loader2 size={16} className="animate-spin" />
            Generating your summary…
          </div>
        )}
      </div>
      <p className="text-xs text-foreground/40">
        Tip: you don&apos;t need to write anything first — click AI and it will build a full summary using your role, experience, and projects. Add a line of your own first if you want it to guide the tone.
      </p>
    </div>
  );
}