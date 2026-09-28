import type { ResumeData } from "@/types/resume";
import { normalizeOrder, pickOrder, type SectionKey } from "@/lib/section-order";
import { renderSections } from "@/lib/render-sections";
import { AdditionalResumeSections } from "./additional-resume-sections";

export function TechTemplate({ data }: { data: ResumeData }) {
  const order = pickOrder(normalizeOrder(data.sectionOrder), [
    "summary",
    "experience",
    "education",
    "skills",
    "projects",
    "certifications",
    "languages",
    "achievements",
    "awards",
    "publications",
    "courses",
  ]);

  const sections: Record<SectionKey, React.ReactNode> = {
    summary: data.summary ? (
      <p key="summary" className="text-neutral-600 mb-6 border-l-2 border-primary/30 pl-3">{data.summary}</p>
    ) : null,
    experience: (
      <section key="experience" className="mb-6">
        <p className="text-primary font-bold mb-2">const experience = [</p>
        {data.experience.map((exp, index) => (
          <div key={index} className="pl-4 mb-3 border-l border-neutral-200">
            <div className="flex justify-between gap-3">
              <p className="font-semibold min-w-0">{exp.role} @ {exp.company}</p>
              <p className="text-neutral-400 shrink-0 whitespace-nowrap">{exp.startDate}→{exp.endDate ?? "now"}</p>
            </div>
            <p className="text-neutral-600">{exp.description}</p>
          </div>
        ))}
        <p className="text-primary font-bold">]</p>
      </section>
    ),
    education: (
      <section key="education" className="mb-6">
        <p className="text-primary font-bold mb-2">const education = [</p>
        {data.education.map((edu, index) => (
          <div key={index} className="pl-4 mb-2 border-l border-neutral-200">
            <div className="flex justify-between gap-3">
              <p className="min-w-0">{edu.degree}, {edu.institution}</p>
              <p className="text-neutral-400 shrink-0 whitespace-nowrap">{edu.startDate}→{edu.endDate ?? "now"}</p>
            </div>
          </div>
        ))}
        <p className="text-primary font-bold">]</p>
      </section>
    ),
    skills: (
      <section key="skills">
        <p className="text-primary font-bold mb-2">const skills = [</p>
        <p className="pl-4 text-neutral-700">{data.skills.map((skill) => `"${skill}"`).join(", ")}</p>
        <p className="text-primary font-bold">]</p>
      </section>
    ),
    projects: data.projects?.length > 0 ? (
      <section key="projects" className="mb-6">
        <p className="text-primary font-bold mb-2">const projects = [</p>
        {data.projects.map((project, index) => (
          <div key={index} className="pl-4 mb-2 border-l border-neutral-200">
            <p className="font-semibold">{project.name}</p>
            <p className="text-neutral-600">{project.description}</p>
          </div>
        ))}
        <p className="text-primary font-bold">]</p>
      </section>
    ) : null,
    certifications: <AdditionalResumeSections data={data} section="certifications" />,
    languages: <AdditionalResumeSections data={data} section="languages" />,
    achievements: <AdditionalResumeSections data={data} section="achievements" />,
    awards: <AdditionalResumeSections data={data} section="awards" />,
    publications: <AdditionalResumeSections data={data} section="publications" />,
    courses: <AdditionalResumeSections data={data} section="courses" />,
  };

  return (
    <div className="bg-white text-neutral-900 p-10 max-w-200 mx-auto font-mono text-xs">
      <header className="mb-6">
        <p className="text-neutral-400">{"//"} resume.ts</p>
        <h1 className="text-2xl font-bold text-primary">{data.personalInfo.fullName}</h1>
        {data.personalInfo.role && (
          <p className="text-neutral-500 text-xs">{"// "}{data.personalInfo.role}</p>
        )}
        <p className="text-neutral-500 mt-1">
          {data.personalInfo.email} | {data.personalInfo.phone}
          {data.personalInfo.location && ` | ${data.personalInfo.location}`}
        </p>
      </header>

      {renderSections(order, sections)}
    </div>
  );
}
