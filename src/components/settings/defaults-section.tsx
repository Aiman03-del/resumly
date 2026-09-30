"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { TemplatePicker } from "@/components/template-picker";
import { ColorPalette } from "@/components/color-palette";
import { FontPicker } from "@/components/font-picker";
import { FONT_SCALE, normalizeFontScale, PAGE_TARGETS } from "@/lib/page-settings";
import { themeStyle } from "@/lib/theme";
import { DEFAULT_RESUME_DEFAULTS, type ResumeDefaults } from "@/lib/user-settings";
import { SaveButton, SettingsCard } from "./settings-ui";

export function DefaultsSection({ defaults }: { defaults: ResumeDefaults }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [value, setValue] = useState<ResumeDefaults>(defaults);
  const [saving, setSaving] = useState(false);

  const patch = (changes: Partial<ResumeDefaults>) => setValue((current) => ({ ...current, ...changes }));

  async function save(next: ResumeDefaults) {
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ data: { resume_defaults: next } });
    setSaving(false);
    if (error) {
      toast.error("Could not save your defaults", { description: "Please try again." });
      return;
    }
    toast.success("Defaults saved", { description: "They apply to resumes you create from now on." });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Default resume style"
        description="Used when you start a new resume. Existing resumes are not changed, and you can still change everything per resume."
      >
        <div className="space-y-5">
          <div style={themeStyle(value.themeColor)}>
            <p className="text-sm font-medium mb-2">Template</p>
            <TemplatePicker variant="list" selected={value.templateId} onSelect={(templateId) => patch({ templateId })} />
          </div>
          <ColorPalette value={value.themeColor} onChange={(themeColor) => patch({ themeColor })} />
          <FontPicker value={value.fontFamily} onChange={(fontFamily) => patch({ fontFamily })} />

          <div className="rounded-xl border border-border p-4">
            <p className="text-sm font-medium mb-2">Page length</p>
            <div className="flex gap-2" role="group" aria-label="Default page length">
              {PAGE_TARGETS.map((target) => (
                <button
                  key={target.value}
                  type="button"
                  aria-pressed={value.pageTarget === target.value}
                  onClick={() => patch({ pageTarget: target.value })}
                  className={`px-3.5 py-1.5 rounded-lg text-sm border transition-colors ${
                    value.pageTarget === target.value ? "border-primary bg-primary/10 text-primary font-medium" : "border-border hover:bg-muted"
                  }`}
                >
                  {target.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border p-4">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="default-font-scale" className="text-sm font-medium">Font size</label>
              <span className="text-xs text-foreground/60">{Math.round(value.fontScale * 100)}%</span>
            </div>
            <input
              id="default-font-scale"
              type="range"
              min={FONT_SCALE.min}
              max={FONT_SCALE.max}
              step={FONT_SCALE.step}
              value={value.fontScale}
              onChange={(event) => patch({ fontScale: normalizeFontScale(event.target.value) })}
              className="w-full accent-primary"
            />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap justify-end gap-3">
          <SaveButton variant="outline" onClick={() => { setValue(DEFAULT_RESUME_DEFAULTS); void save(DEFAULT_RESUME_DEFAULTS); }} disabled={saving}>Reset to app defaults</SaveButton>
          <SaveButton onClick={() => void save(value)} loading={saving}>Save defaults</SaveButton>
        </div>
      </SettingsCard>
    </div>
  );
}