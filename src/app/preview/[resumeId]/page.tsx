import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { rowToPreview, type ResumeRow } from "@/lib/resume-row";
import { PreviewClient } from "./preview-client";

const isValidResumeId = (value: string) => {
  const normalized = value.replace(/[\u0000-\u001f\u007f]/g, "");
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(normalized);
};

export const metadata: Metadata = {
  title: "Preview",
  robots: { index: false, follow: false },
};

export default async function PreviewPage({ params }: { params: Promise<{ resumeId: string }> }) {
  const { resumeId } = await params;
  if (!isValidResumeId(resumeId)) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirectTo=${encodeURIComponent(`/preview/${resumeId}`)}`);

  const { data: row, error } = await supabase
    .from("resumes")
    .select("*")
    .eq("id", resumeId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("[preview] failed to load resume", { code: error.code });
    throw new Error("Could not load this resume.");
  }
  if (!row) notFound();

  const preview = rowToPreview(row as ResumeRow);
  return <PreviewClient resumeId={resumeId} {...preview} />;
}