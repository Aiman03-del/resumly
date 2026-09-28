import type { ResumeData } from "@/types/resume";
import { normalizeOrder, pickOrder, type SectionKey } from "@/lib/section-order";
import { renderSections } from "@/lib/render-sections";
import { AdditionalResumeSections } from "./additional-resume-sections";

export function ElegantTemplate({ data }: { data: ResumeData }) {
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
      <p key="summary" className="text-center italic text-neutral-600 mb-10 max-w-lg mx-auto">{data.summary}</p>
    ) : null,
    experience: (
      <section key="experience" className="mb-8">
        <h2 className="text-center text-xs tracking-[0.3em] text-neutral-500 mb-5">EXPERIENCE</h2>
        {data.experience.map((exp, index) => (
          <div key={index} className="mb-5 text-center">
            <p className="font-semibold">{exp.role}</p>
            <p className="text-neutral-500 text-xs">{exp.company} &nbsp;·&nbsp; {exp.startDate} - {exp.endDate ?? "Present"}</p>
            <p className="text-neutral-600 mt-1 max-w-md mx-auto">{exp.description}</p>
          </div>
        ))}
      </section>
    ),
    education: (
      <section key="education" className="mb-8">
        <h2 className="text-center text-xs tracking-[0.3em] text-neutral-500 mb-5">EDUCATION</h2>
        {data.education.map((edu, index) => (
          <div key={index} className="mb-2 text-center">
            <p className="font-semibold">{edu.degree}</p>
            <p className="text-neutral-500 text-xs">{edu.institution} · {edu.startDate} - {edu.endDate ?? "Present"}</p>
          </div>
        ))}
      </section>
    ),
    skills: (
      <section key="skills" className="text-center">
        <h2 className="text-xs tracking-[0.3em] text-neutral-500 mb-3">SKILLS</h2>
        <p className="text-neutral-700">{data.skills.join("  ·  ")}</p>
      </section>
    ),
    projects: data.projects?.length > 0 ? (
      <section key="projects" className="mb-8 text-center">
        <h2 className="text-xs tracking-[0.3em] text-neutral-500 mb-5">PROJECTS</h2>
        {data.projects.map((project, index) => (
          <div key={index} className="mb-3">
            <p className="font-semibold">{project.name}</p>
            <p className="text-neutral-600 text-xs max-w-md mx-auto">{project.description}</p>
          </div>
        ))}
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
    <div className="bg-white text-neutral-900 p-14 max-w-200 mx-auto font-serif text-sm">
      <header className="text-center mb-10">
        <h1 className="text-4xl tracking-wide mb-2">{data.personalInfo.fullName}</h1>
        {data.personalInfo.role && (
          <p className="text-neutral-500 text-sm tracking-[0.2em] uppercase">{data.personalInfo.role}</p>
        )}
        <div className="w-16 h-px bg-neutral-400 mx-auto my-3" />
        <p className="text-neutral-500 text-xs">
          {data.personalInfo.email} &nbsp;•&nbsp; {data.personalInfo.phone}
          {data.personalInfo.location && ` \u00A0•\u00A0 ${data.personalInfo.location}`}
        </p>
      </header>

      {renderSections(order, sections)}
    </div>
  );
}
