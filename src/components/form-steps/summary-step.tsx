"use client";
import { useState } from "react";
import { PolishButton } from "@/components/polish-button";

export function SummaryStep({
  defaultValue,
  onChange,
}: {
  defaultValue: string;
  onChange: (data: string) => void;
}) {
  const [summary, setSummary] = useState(defaultValue ?? "");

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Professional Summary</h2>
        <PolishButton
          section="summary"
          content={summary}
          onPolished={(text) => { setSummary(text); onChange(text); }}
        />
      </div>
      <textarea
        value={summary}
        onChange={(e) => { setSummary(e.target.value); onChange(e.target.value); }}
        rows={5}
        className="w-full px-3 py-2 rounded-lg border border-border bg-background"
        placeholder="A short 2-3 sentence summary of your professional background..."
      />
    </div>
  );
}