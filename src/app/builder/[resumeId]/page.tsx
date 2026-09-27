"use client";
import { useParams } from "next/navigation";
import { ResumeBuilderForm } from "@/components/builder/resume-builder-form";

export default function BuilderPage() {
  const { resumeId } = useParams<{ resumeId: string }>();
  return <ResumeBuilderForm initialResumeId={resumeId} />;
}