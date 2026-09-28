"use client";

import { RESUME_FONTS } from "@/lib/font";

interface FontPickerProps {
  value?: string;
  onChange: (font: string) => void;
}

export function FontPicker({ value = "Arial", onChange }: FontPickerProps) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <label
        htmlFor="resume-font"
        className="block text-sm font-medium mb-2"
      >
        Resume Font
      </label>

      <select
        id="resume-font"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
      >
        {RESUME_FONTS.map((font) => (
          <option
            key={font.value}
            value={font.value}
            style={{ fontFamily: font.css }}
          >
            {font.label}
          </option>
        ))}
      </select>

      <p
        className="text-xs text-foreground/50 mt-2"
        style={{
          fontFamily:
            RESUME_FONTS.find((font) => font.value === value)?.css,
        }}
      >
        Your resume will use this font.
      </p>
    </div>
  );
}