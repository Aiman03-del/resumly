import { ResumeData } from "@/types/resume";
import { ModernTemplate } from "./modern-template";
// import { CreativeTemplate } from "./creative-template";
// import { ClassicTemplate } from "./classic-template";

const templateMap: Record<string, React.ComponentType<{ data: ResumeData }>> = {
  modern: ModernTemplate,
  // creative: CreativeTemplate,
  // classic: ClassicTemplate,
};

export function ResumeRenderer({ templateId, data }: { templateId: string; data: ResumeData }) {
  const Template = templateMap[templateId] ?? ModernTemplate;
  return <Template data={data} />;
}