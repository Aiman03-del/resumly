"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { TemplatePicker } from "@/components/template-picker";
import { ColorPalette } from "@/components/color-palette";
import { SectionOrderList } from "@/components/section-order-list";
import { ResumeRenderer } from "@/components/templates";
import { Skeleton } from "@/components/ui/skeleton";
import type { ResumeData } from "@/types/resume";
import { DEFAULT_ACCENT_COLOR } from "@/lib/accent-color";
import { normalizeOrder, type SectionKey } from "@/lib/section-order";
import { toast } from "sonner";

export default function TemplateSelectPage() {
  const { resumeId } = useParams<{ resumeId: string }>();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [selected, setSelected] = useState("modern");
  const [accentColor, setAccentColor] = useState(DEFAULT_ACCENT_COLOR);
  const [sectionOrder, setSectionOrder] = useState<SectionKey[]>(normalizeOrder());
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("resumes").select("*").eq("id", resumeId).single();
      if (data) {
        setSelected(data.template_id ?? "modern");
        setAccentColor(data.accent_color ?? DEFAULT_ACCENT_COLOR);
        setSectionOrder(normalizeOrder(data.section_order));
        setResumeData({
          personalInfo: data.personal_info ?? { fullName: "", email: "", phone: "" },
          summary: typeof data.summary === "string" ? data.summary : data.summary?.text ?? "",
          experience: data.experience ?? [],
          education: data.education ?? [],
          skills: data.skills ?? [],
          projects: data.projects ?? [],
          sectionOrder: normalizeOrder(data.section_order),
        });
      }
      setLoading(false);
    }
    load();
  }, [resumeId, supabase]);

  async function handleContinue() {
    setSaving(true);
    const { error } = await supabase
      .from("resumes")
      .update({
        template_id: selected,
        accent_color: accentColor,
        section_order: sectionOrder,
        status: "polished",
      })
      .eq("id", resumeId);
    if (error) {
      toast.error("Could not save template settings", { description: error.message });
      setSaving(false);
      return;
    }
    router.push(`/preview/${resumeId}`);
  }

  if (loading || !resumeData) {
    return (
      <div className="max-w-6xl mx-auto py-10 px-6">
        <Skeleton className="h-7 w-48 mb-2" />
        <Skeleton className="h-4 w-64 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          <Skeleton className="h-96 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  const previewData: ResumeData = { ...resumeData, sectionOrder, accentColor };

  return (
    <div className="max-w-6xl mx-auto py-10 px-6">
      <h1 className="text-2xl font-semibold mb-1">Choose a Template</h1>
      <p className="text-foreground/60 text-sm mb-8">
        Pick a style, a color, and drag to reorder sections — you can change this later.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
        <div className="space-y-5 lg:sticky lg:top-24">
          <ColorPalette value={accentColor} onChange={setAccentColor} />
          <TemplatePicker
            orientation="list"
            selected={selected}
            onSelect={setSelected}
            accentColor={accentColor}
          />
        </div>

        <div className="space-y-5 min-w-0">
          <div className="rounded-xl border border-border overflow-hidden shadow-sm bg-neutral-100">
            <div className="max-h-[75vh] overflow-auto p-6 flex justify-center">
              <div className="w-fit origin-top scale-[0.62] sm:scale-[0.8]">
                <ResumeRenderer templateId={selected} data={previewData} accentColor={accentColor} />
              </div>
            </div>
          </div>

          <SectionOrderList order={sectionOrder} onChange={setSectionOrder} />
        </div>
      </div>

      <div className="flex justify-end mt-8">
        <button
          onClick={handleContinue}
          disabled={saving}
          className="px-5 py-2.5 rounded-lg bg-primary text-primary-fg font-medium disabled:opacity-60"
        >
          {saving ? "Saving..." : "Continue to Preview"}
        </button>
      </div>
    </div>
  );
}