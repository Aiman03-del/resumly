"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { TemplatePicker } from "@/components/template-picker";
import { Loader2 } from "lucide-react";

export default function TemplateSelectPage() {
  const { resumeId } = useParams<{ resumeId: string }>();
  const router = useRouter();
  const supabase = createClient();

  const [selected, setSelected] = useState("modern");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("resumes").select("template_id").eq("id", resumeId).single();
      if (data?.template_id) setSelected(data.template_id);
      setLoading(false);
    }
    load();
  }, [resumeId]);

  async function handleContinue() {
    setSaving(true);
    await supabase.from("resumes").update({ template_id: selected, status: "polished" }).eq("id", resumeId);
    router.push(`/preview/${resumeId}`);
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={24} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-6">
      <h1 className="text-2xl font-semibold mb-1">Choose a Template</h1>
      <p className="text-foreground/60 text-sm mb-8">Pick a style — you can change this later.</p>

      <TemplatePicker selected={selected} onSelect={setSelected} />

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