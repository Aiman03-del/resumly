import type { Metadata } from "next";
import Link from "next/link";
import {
  Camera,
  Download,
  FileCheck,
  GripVertical,
  LayoutTemplate,
  Mail,
  Palette,
  Share2,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Features",
  description: "See everything Resumly offers: AI writing help, ATS checks, cover letters, and professional templates.",
};

const FEATURES = [
  {
    icon: LayoutTemplate,
    title: "10 resume templates",
    description: "From minimal to bold, pick a layout that fits your role and switch anytime.",
  },
  {
    icon: Palette,
    title: "Custom colors",
    description: "Choose a color palette and see your resume update instantly in the preview.",
  },
  {
    icon: GripVertical,
    title: "Drag-and-drop sections",
    description: "Reorder Summary, Experience, Education, Skills and Projects the way you want.",
  },
  {
    icon: Sparkles,
    title: "AI polish",
    description: "Improve the wording of your resume with one click.",
  },
  {
    icon: FileCheck,
    title: "ATS check",
    description: "Check how well your resume reads to applicant tracking systems.",
  },
  {
    icon: Mail,
    title: "Cover letter",
    description: "Generate a cover letter from the details already in your resume.",
  },
  {
    icon: Camera,
    title: "Profile photo",
    description: "Upload a photo and see it in your resume right away.",
  },
  {
    icon: Download,
    title: "Download as PDF",
    description: "Export a print-ready copy of your finished resume.",
  },
  {
    icon: Share2,
    title: "Share with a link",
    description: "Send a public link so anyone can view your resume online.",
  },
];

export default function FeaturesPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="max-w-2xl mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">Features</h1>
        <p className="text-foreground/60">
          Everything you need to build, polish and share a professional resume.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <div key={title} className="rounded-xl border border-border p-6">
            <span className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Icon size={20} />
            </span>
            <h3 className="font-semibold mb-1.5">{title}</h3>
            <p className="text-sm text-foreground/60">{description}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 rounded-xl border border-border p-8 text-center">
        <h2 className="text-xl font-semibold mb-2">Ready to build yours?</h2>
        <p className="text-foreground/60 mb-5">It only takes a few minutes.</p>
        <Link
          href="/builder/new"
          className="inline-block px-6 py-2.5 rounded-full bg-primary text-primary-fg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Create your resume
        </Link>
      </div>
    </div>
  );
}
