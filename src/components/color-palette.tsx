"use client";
import { Check, Palette } from "lucide-react";
import { isHexColor, themePresets } from "@/lib/theme";

export function ColorPalette({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (color: string | null) => void;
}) {
  const isCustom = isHexColor(value) && !themePresets.some((preset) => preset.color === value);

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border px-4 py-3">
      <span className="flex items-center gap-1.5 text-sm font-medium"><Palette size={16} /> Color</span>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => onChange(null)} title="Default" aria-label="Default color" className={`relative w-7 h-7 rounded-full border-2 overflow-hidden ${value === null ? "border-foreground" : "border-border"}`} style={{ background: "linear-gradient(135deg, #ef4444 50%, #8b5cf6 50%)" }}>
          {value === null && <Check size={14} className="absolute inset-0 m-auto text-white" />}
        </button>
        {themePresets.map((preset) => (
          <button key={preset.color} type="button" onClick={() => onChange(preset.color)} title={preset.name} aria-label={`${preset.name} color`} className={`relative w-7 h-7 rounded-full border-2 ${value === preset.color ? "border-foreground" : "border-transparent"}`} style={{ backgroundColor: preset.color }}>
            {value === preset.color && <Check size={14} className="absolute inset-0 m-auto text-white" />}
          </button>
        ))}
        <label title="Custom color" className={`relative w-7 h-7 rounded-full border-2 overflow-hidden cursor-pointer ${isCustom ? "border-foreground" : "border-border"}`} style={{ background: isCustom ? value : "conic-gradient(#ef4444, #f59e0b, #16a34a, #2563eb, #8b5cf6, #ef4444)" }}>
          <input type="color" value={isHexColor(value) ? value : "#2563eb"} onChange={(event) => onChange(event.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" aria-label="Pick a custom color" />
        </label>
      </div>
    </div>
  );
}
