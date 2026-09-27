import type { CSSProperties } from "react";
import type { ResumeData } from "@/types/resume";
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

export function ResumeRenderer({
  templateId,
  data,
  accentColor,
}: {
  templateId: string;
  data: ResumeData;
  accentColor?: string;
}) {
  const Template = templateMap[templateId] ?? ModernTemplate;
  const style = accentColor
    ? ({
        "--color-primary": accentColor,
        "--color-accent": accentColor,
        "--primary": accentColor,
        "--accent": accentColor,
      } as CSSProperties)
    : undefined;

  return (
    <div style={style}>
      <Template data={data} />
    </div>
  );
}