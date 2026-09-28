"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { TemplatePicker } from "@/components/template-picker";
import { ColorPalette } from "@/components/color-palette";
import { FontPicker } from "@/components/font-picker";
import { SectionOrderList } from "@/components/section-order-list";
import { SectionDndProvider } from "@/components/sortable-section";
import { ResumeRenderer } from "@/components/templates";
import { Skeleton } from "@/components/ui/skeleton";
import type { ResumeData } from "@/types/resume";
import { normalizeOrder, type SectionKey } from "@/lib/section-order";
import { isHexColor, themeStyle } from "@/lib/theme";
import { DEFAULT_RESUME_FONT } from "@/lib/font";
import { toast } from "sonner";

export default function TemplateSelectPage() {
  const { resumeId } = useParams<{ resumeId: string }>();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [selected, setSelected] = useState("modern");
  const [fontFamily, setFontFamily] = useState(DEFAULT_RESUME_FONT);
  const [themeColor, setThemeColor] = useState<string | null>(null);
  const [sectionOrder, setSectionOrder] = useState<SectionKey[]>(normalizeOrder());
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("resumes").select("*").eq("id", resumeId).single();
      if (data) {
        const savedPersonalInfo = data.personal_info ?? {
          fullName: "",
          email: "",
          phone: "",
        };

        setSelected(data.template_id ?? "modern");
        setFontFamily(savedPersonalInfo.fontFamily ?? DEFAULT_RESUME_FONT);
        setThemeColor(isHexColor(data.theme_color) ? data.theme_color : isHexColor(data.accent_color) ? data.accent_color : null);
        setSectionOrder(normalizeOrder(data.section_order));
        setResumeData({
          personalInfo: savedPersonalInfo,
          summary: typeof data.summary === "string" ? data.summary : data.summary?.text ?? "",
          experience: data.experience ?? [],
          education: data.education ?? [],
          skills: data.skills ?? [],
          projects: data.projects ?? [],
          certifications: data.certifications ?? [],
          languages: data.languages ?? [],
          achievements: data.achievements ?? [],
          awards: data.awards ?? [],
          publications: data.publications ?? [],
          courses: data.courses ?? [],
          sectionOrder: normalizeOrder(data.section_order),
          themeColor: isHexColor(data.theme_color) ? data.theme_color : undefined,
          fontFamily: savedPersonalInfo.fontFamily ?? DEFAULT_RESUME_FONT,
        });
      }
      setLoading(false);
    }
    load();
  }, [resumeId, supabase]);

  async function handleContinue() {
    setSaving(true);
    const updatedPersonalInfo = {
      ...resumeData?.personalInfo,
      fontFamily,
    };

    const { error } = await supabase
      .from("resumes")
      .update({
        template_id: selected,
        accent_color: themeColor,
        theme_color: themeColor,
        section_order: sectionOrder,
        personal_info: updatedPersonalInfo,
        status: "polished",
      })
      .eq("id", resumeId);
    if (error) {
      const retry = await supabase
        .from("resumes")
        .update({
          template_id: selected,
          accent_color: themeColor,
          section_order: sectionOrder,
          personal_info: updatedPersonalInfo,
          status: "polished",
        })
        .eq("id", resumeId);
      if (retry.error) {
        toast.error("Could not save template settings", { description: retry.error.message });
        setSaving(false);
        return;
      }
      if (themeColor) toast.warning("Template saved, but the color was not", { description: "Add a theme_color text column to the resumes table to save colors." });
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

  const previewData: ResumeData = {
    ...resumeData,
    sectionOrder,
    themeColor: themeColor ?? undefined,
    fontFamily,
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-6">
      <h1 className="text-2xl font-semibold mb-1">Choose a Template</h1>
      <p className="text-foreground/60 text-sm mb-8">
        Pick a style, a color, and drag to reorder sections — you can change this later.
      </p>

      <div className="grid lg:grid-cols-[460px_1fr] gap-6 mt-5 items-start">
        <aside className="space-y-4 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-1">
          <ColorPalette
            value={themeColor}
            onChange={setThemeColor}
          />

          <FontPicker
            value={fontFamily}
            onChange={setFontFamily}
          />

          <SectionOrderList order={sectionOrder} onChange={setSectionOrder} />

          <div style={themeStyle(themeColor)}>
            <TemplatePicker
              variant="list"
              selected={selected}
              onSelect={setSelected}
            />
          </div>
        </aside>

        <div className="space-y-5 min-w-0">
          <p className="text-xs text-foreground/50">
            Tip: drag any section in the preview to reorder it. Sidebar templates reorder each column separately.
          </p>
          <div className="rounded-xl border border-border overflow-hidden shadow-sm bg-neutral-100">
            <div className="max-h-[75vh] overflow-auto p-6 flex justify-center">
              <div className="w-fit origin-top scale-[0.62] sm:scale-[0.8]">
                <SectionDndProvider order={sectionOrder} onChange={setSectionOrder}>
                  <ResumeRenderer templateId={selected} data={previewData} />
                </SectionDndProvider>
              </div>
            </div>
          </div>
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