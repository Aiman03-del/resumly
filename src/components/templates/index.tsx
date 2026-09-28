import type { ComponentType } from "react";
import type { ResumeData } from "@/types/resume";
import { themeStyle } from "@/lib/theme";
import { getResumeFontCss } from "@/lib/font";

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

const templateMap: Record<string, ComponentType<{ data: ResumeData }>> = {
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
  const theme = themeStyle(data.themeColor ?? accentColor);

  const fontStyle = {
    fontFamily: getResumeFontCss(data.fontFamily),
  };

  return (
    <div style={{ ...theme, ...fontStyle }}>
      <Template data={data} />
    </div>
  );
}