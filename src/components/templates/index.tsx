import { ResumeData } from "@/types/resume";
import { ModernTemplate } from "./modern-template";
import { CreativeTemplate } from "./creative-template";
import { ClassicTemplate } from "./classic-template";
import { MinimalTemplate } from "./minimal-template";
import { TimelineTemplate } from "./timeline-template";
import { CompactTemplate } from "./compact-template";
import { BoldTemplate } from "./bold-template";
import { ElegantTemplate } from "./elegant-template";
import { SidebarProTemplate } from "./sidebar-pro-template";
import { TechTemplate } from "./tech-template";

const templateMap: Record<string, React.ComponentType<{ data: ResumeData }>> = {
  modern: ModernTemplate,
  creative: CreativeTemplate,
  classic: ClassicTemplate,
  minimal: MinimalTemplate,
  timeline: TimelineTemplate,
  compact: CompactTemplate,
  bold: BoldTemplate,
  elegant: ElegantTemplate,
  "sidebar-pro": SidebarProTemplate,
  tech: TechTemplate,
};

export function ResumeRenderer({ templateId, data }: { templateId: string; data: ResumeData }) {
  const Template = templateMap[templateId] ?? ModernTemplate;
  return <Template data={data} />;
}