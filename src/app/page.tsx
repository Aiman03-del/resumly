import { Hero } from "@/components/landing/hero";
import { StatsStrip } from "@/components/landing/stats-strip";
import { Features } from "@/components/landing/features";
import { AtsSection } from "@/components/landing/ats-section";
import { BeforeAfter } from "@/components/landing/before-after";
import { HowItWorks } from "@/components/landing/how-it-works";
import { TemplateGallery } from "@/components/landing/template-gallery";
import { Faq } from "@/components/landing/faq";
import { BottomCta } from "@/components/landing/bottom-cta";

export default function LandingPage() {
  return (
    <div className="max-w-6xl mx-auto px-6">
      <Hero />
      <StatsStrip />
      <Features />
      <AtsSection />
      <BeforeAfter />
      <HowItWorks />
      <TemplateGallery />
      <Faq />
      <BottomCta />
    </div>
  );
}