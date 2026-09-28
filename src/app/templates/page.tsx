import type { Metadata } from "next";
import Link from "next/link";
import { HeroSection, type CarouselSlide } from "@/components/ui/feature-carousel";
import { buttonVariants } from "@/components/ui/button";
import { ScaledPreview } from "@/components/scaled-preview";
import { ResumeRenderer } from "@/components/templates";
import { TemplateGallery } from "@/components/landing/template-gallery";
import { templates } from "@/types/template";
import { sampleResumeData } from "@/lib/sample-resume";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Templates | Resumly",
  description: "Browse every Resumly resume template and pick the one that fits you.",
};

const slides: CarouselSlide[] = templates.map((template) => ({
  id: template.id,
  label: template.name,
  content: (
    <ScaledPreview>
      <ResumeRenderer templateId={template.id} data={sampleResumeData} />
    </ScaledPreview>
  ),
  caption: (
    <div className="space-y-3">
      <div>
        <p className="text-lg font-semibold">{template.name}</p>
        <p className="text-sm text-muted-foreground max-w-sm">{template.description}</p>
      </div>
      <Link href="/builder/new" className={cn(buttonVariants({ size: "lg" }), "h-10 px-6 rounded-full text-sm")}>
        Use this template
      </Link>
    </div>
  ),
}));

export default function TemplatesPage() {
  return (
    <>
      <HeroSection
        title={
          <>
            Pick a template that{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-primary/50">gets you hired</span>
          </>
        }
        subtitle="Ten clean, ATS-friendly layouts. Choose one, change the color, reorder sections — switch anytime."
        slides={slides}
      />
      <div className="max-w-6xl mx-auto px-6 pt-8">
        <TemplateGallery />
      </div>
    </>
  );
}
