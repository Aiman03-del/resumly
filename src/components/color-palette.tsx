"use client";
import { Check } from "lucide-react";
import { ACCENT_COLORS } from "@/lib/accent-color";

export function ColorPalette({
  value,
  onChange,
}: {
  value: string;
  onChange: (color: string) => void;
}) {
  return (
    <div className="rounded-xl border border-border p-4">
      <p className="text-sm font-medium mb-3">Resume color</p>
      <div className="flex flex-wrap gap-2 mb-3">
        {ACCENT_COLORS.map((color) => {
          const isActive = value.toLowerCase() === color.value.toLowerCase();
          return (
            <button
              key={color.value}
              type="button"
              title={color.name}
              aria-label={color.name}
              aria-pressed={isActive}
              onClick={() => onChange(color.value)}
              className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 ring-offset-2 ring-offset-background"
              style={{
                backgroundColor: color.value,
                boxShadow: isActive ? `0 0 0 2px var(--color-background), 0 0 0 4px ${color.value}` : undefined,
              }}
            >
              {isActive && <Check size={14} className="text-white drop-shadow" />}
            </button>
          );
        })}
      </div>
      <label className="flex items-center gap-2 text-xs text-muted-foreground">
        Custom
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-8 h-8 rounded border border-border cursor-pointer bg-transparent p-0"
          aria-label="Custom resume color"
        />
      </label>
    </div>
  );
}
