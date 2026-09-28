import type { ResumeData } from "@/types/resume";
import { normalizeOrder, pickOrder, type SectionKey } from "@/lib/section-order";
import { renderSections } from "@/lib/render-sections";

export function BoldTemplate({ data }: { data: ResumeData }) {
  const order = pickOrder(normalizeOrder(data.sectionOrder), [
    "summary",
    "experience",
    "education",
    "skills",
    "projects",
  ]);

  const sections: Record<SectionKey, React.ReactNode> = {
    summary: data.summary ? (
      <p key="summary" className="text-neutral-600 mb-8">{data.summary}</p>
    ) : null,
    experience: (
      <section key="experience" className="mb-8">
        <h2 className="text-primary font-bold uppercase text-xs tracking-wider mb-3 pb-1 border-b-2 border-primary/20">Experience</h2>
        {data.experience.map((exp, index) => (
          <div key={index} className="mb-4">
            <div className="flex justify-between gap-3">
              <p className="font-semibold min-w-0">{exp.role} · {exp.company}</p>
              <p className="text-neutral-400 text-xs shrink-0 whitespace-nowrap">
                {exp.startDate} - {exp.endDate ?? "Present"}
              </p>
            </div>
            <p className="text-neutral-600 mt-1">{exp.description}</p>
          </div>
        ))}
      </section>
    ),
    education: (
      <section key="education" className="mb-8">
        <h2 className="text-primary font-bold uppercase text-xs tracking-wider mb-3 pb-1 border-b-2 border-primary/20">Education</h2>
        {data.education.map((edu, index) => (
          <div key={index} className="flex justify-between gap-3 mb-2">
            <p className="font-semibold min-w-0">{edu.degree}, {edu.institution}</p>
            <p className="text-neutral-400 text-xs shrink-0 whitespace-nowrap">
              {edu.startDate} - {edu.endDate ?? "Present"}
            </p>
          </div>
        ))}
      </section>
    ),
    skills: (
      <section key="skills">
        <h2 className="text-primary font-bold uppercase text-xs tracking-wider mb-3 pb-1 border-b-2 border-primary/20">Skills</h2>
        <div className="flex flex-wrap gap-2">
          {data.skills.map((skill, index) => (
            <span key={index} className="bg-primary text-primary-fg px-3 py-1 rounded-full text-xs font-medium">{skill}</span>
          ))}
        </div>
      </section>
    ),
    projects: data.projects?.length > 0 ? (
      <section key="projects" className="mb-8">
        <h2 className="text-primary font-bold uppercase text-xs tracking-wider mb-3 pb-1 border-b-2 border-primary/20">Projects</h2>
        {data.projects.map((project, index) => {
          const currentLinks = project.links?.filter((link) => link.trim()) ?? [];
          const links = currentLinks.length ? currentLinks : project.link ? [project.link] : [];
          return (
            <div key={index} className="mb-3">
              <div className="flex justify-between gap-3">
                <p className="font-semibold min-w-0">{project.name}</p>
                {links.length > 0 && (
                  <span className="text-primary text-xs shrink-0 whitespace-nowrap">
                    {links.map((link) => link.replace(/^https?:\/\//, "")).join(" · ")}
                  </span>
                )}
              </div>
              <p className="text-neutral-600 text-xs">{project.description}</p>
            </div>
          );
        })}
      </section>
    ) : null,
  };

  return (
    <div className="bg-white text-neutral-900 max-w-200 mx-auto font-sans text-sm">
      <header className="bg-primary text-primary-fg p-10">
        <h1 className="text-3xl font-bold">{data.personalInfo.fullName}</h1>
        {data.personalInfo.role && (
          <p className="text-primary-fg/90 text-sm font-medium mt-0.5">{data.personalInfo.role}</p>
        )}
        <p className="text-primary-fg/80 text-xs mt-2">
          {data.personalInfo.email} · {data.personalInfo.phone}
          {data.personalInfo.location && ` · ${data.personalInfo.location}`}
        </p>
      </header>

      <div className="p-10">
        {renderSections(order, sections)}
      </div>
    </div>
  );
}
