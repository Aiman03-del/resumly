import type { ResumeData } from "@/types/resume";
import { joinContact } from "@/lib/contact-line";
import { normalizeOrder, pickOrder, type SectionKey } from "@/lib/section-order";
import { renderSections } from "@/lib/render-sections";
import { AdditionalResumeSections } from "./additional-resume-sections";

export function TimelineTemplate({ data }: { data: ResumeData }) {
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
      <p key="summary" className="text-neutral-600 mb-8">{data.summary}</p>
    ) : null,
    experience: (
      <div key="experience" className="mb-8">
        <h2 className="text-primary font-semibold uppercase text-xs tracking-wider mb-4">Experience</h2>
        <div className="relative pl-6 border-l-2 border-primary/20 space-y-6">
          {data.experience.map((exp, index) => (
            <div key={index} className="relative">
              <span className="absolute -left-[29px] top-1 w-3 h-3 rounded-full bg-primary border-2 border-white" />
              <div className="flex justify-between gap-3">
                <p className="font-medium min-w-0">{exp.role} · {exp.company}</p>
                <p className="text-neutral-400 text-xs shrink-0 whitespace-nowrap">
                  {exp.startDate} - {exp.endDate ?? "Present"}
                </p>
              </div>
              <p className="text-neutral-600 mt-1">{exp.description}</p>
            </div>
          ))}
        </div>
      </div>
    ),
    education: (
      <div key="education" className="mb-8">
        <h2 className="text-primary font-semibold uppercase text-xs tracking-wider mb-4">Education</h2>
        <div className="relative pl-6 border-l-2 border-primary/20 space-y-4">
          {data.education.map((edu, index) => (
            <div key={index} className="relative">
              <span className="absolute -left-[29px] top-1 w-3 h-3 rounded-full bg-neutral-300 border-2 border-white" />
              <div className="flex justify-between gap-3">
                <p className="font-medium min-w-0">{edu.degree}, {edu.institution}</p>
                <p className="text-neutral-400 text-xs shrink-0 whitespace-nowrap">
                  {edu.startDate} - {edu.endDate ?? "Present"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    skills: (
      <div key="skills" className="mt-6">
        <h2 className="text-primary font-semibold uppercase text-xs tracking-wider mb-2">Skills</h2>
        <div className="flex flex-wrap gap-2">
          {data.skills.map((skill, index) => (
            <span key={index} className="bg-primary/10 text-primary px-2.5 py-1 rounded-full text-xs">{skill}</span>
          ))}
        </div>
      </div>
    ),
    projects: data.projects?.length > 0 ? (
      <div key="projects" className="mb-8">
        <h2 className="text-primary font-semibold uppercase text-xs tracking-wider mb-3">Projects</h2>
        {data.projects.map((project, index) => (
          <div key={index} className="mb-3">
            <p className="font-medium">{project.name}</p>
            <p className="text-neutral-600 text-xs">{project.description}</p>
          </div>
        ))}
      </div>
    ) : null,
    certifications: <AdditionalResumeSections data={data} section="certifications" />,
    languages: <AdditionalResumeSections data={data} section="languages" />,
    achievements: <AdditionalResumeSections data={data} section="achievements" />,
    awards: <AdditionalResumeSections data={data} section="awards" />,
    publications: <AdditionalResumeSections data={data} section="publications" />,
    courses: <AdditionalResumeSections data={data} section="courses" />,
  };

  return (
    <div className="bg-white text-neutral-900 p-10 max-w-200 mx-auto font-sans text-sm">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">{data.personalInfo.fullName}</h1>
        {data.personalInfo.role && (
          <p className="text-primary text-sm font-medium">{data.personalInfo.role}</p>
        )}
        <p className="text-neutral-500 text-xs mt-1">
          {joinContact([data.personalInfo.email, data.personalInfo.phone, data.personalInfo.location])}
        </p>
      </header>

      {renderSections(order, sections)}
    </div>
  );
}
