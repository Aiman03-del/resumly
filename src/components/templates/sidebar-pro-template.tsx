import type { ResumeData } from "@/types/resume";
import { normalizeOrder, pickOrder } from "@/lib/section-order";
import { renderSections } from "@/lib/render-sections";
import { AdditionalResumeSections } from "./additional-resume-sections";

export function SidebarProTemplate({ data }: { data: ResumeData }) {
  const fullOrder = normalizeOrder(data.sectionOrder);
  const sidebarOrder = pickOrder(fullOrder, ["skills", "education"]);
  const mainOrder = pickOrder(fullOrder, [
    "summary",
    "experience",
    "projects",
    "certifications",
    "languages",
    "achievements",
    "awards",
    "publications",
    "courses",
  ]);

  const sidebarSections = {
    skills: (
      <div key="skills">
        <h2 className="text-primary font-semibold uppercase text-[10px] tracking-wider mt-6 mb-2">Skills</h2>
        <div className="space-y-1.5">
          {data.skills.map((skill, index) => (
            <div key={index} className="text-xs bg-white border border-neutral-200 rounded px-2 py-1">{skill}</div>
          ))}
        </div>
      </div>
    ),
    education: (
      <div key="education">
        <h2 className="text-primary font-semibold uppercase text-[10px] tracking-wider mt-6 mb-2">Education</h2>
        {data.education.map((edu, index) => (
          <div key={index} className="mb-2 text-xs">
            <p className="font-medium">{edu.degree}</p>
            <p className="text-neutral-500">{edu.institution}</p>
          </div>
        ))}
      </div>
    ),
  };

  const mainSections = {
    summary: data.summary ? (
      <section key="summary" className="mb-6">
        <h2 className="text-primary font-semibold uppercase text-xs tracking-wider mb-2">Summary</h2>
        <p className="text-neutral-700">{data.summary}</p>
      </section>
    ) : null,
    experience: (
      <section key="experience" className="mb-6">
        <h2 className="text-primary font-semibold uppercase text-xs tracking-wider mb-3">Experience</h2>
        {data.experience.map((exp, index) => (
          <div key={index} className="mb-4">
            <div className="flex justify-between gap-3">
              <p className="font-medium min-w-0">{exp.role} · {exp.company}</p>
              <p className="text-neutral-400 text-xs shrink-0 whitespace-nowrap">
                {exp.startDate} - {exp.endDate ?? "Present"}
              </p>
            </div>
            <p className="text-neutral-600 mt-1">{exp.description}</p>
          </div>
        ))}
      </section>
    ),
    projects: data.projects?.length > 0 ? (
      <section key="projects">
        <h2 className="text-primary font-semibold uppercase text-xs tracking-wider mb-3">Projects</h2>
        {data.projects.map((project, index) => (
          <div key={index} className="mb-3">
            <p className="font-medium">{project.name}</p>
            <p className="text-neutral-600 text-xs">{project.description}</p>
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
    <div className="bg-white text-neutral-900 flex min-h-[1000px] font-sans text-sm">
      <aside className="w-[32%] bg-neutral-50 border-r border-neutral-200 p-7">
        {data.personalInfo.photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.personalInfo.photoUrl}
            alt={data.personalInfo.fullName}
            className="w-20 h-20 rounded-lg object-cover mb-4"
          />
        )}
        <h1 className="text-lg font-bold">{data.personalInfo.fullName}</h1>
        {data.personalInfo.role && (
          <p className="text-primary text-xs font-medium mb-1">{data.personalInfo.role}</p>
        )}
        <div className="text-xs text-neutral-500 mt-2 space-y-0.5">
          <p>{data.personalInfo.email}</p>
          <p>{data.personalInfo.phone}</p>
          {data.personalInfo.location && <p>{data.personalInfo.location}</p>}
        </div>

        {renderSections(sidebarOrder, sidebarSections)}
      </aside>

      <main className="flex-1 p-7">
        {renderSections(mainOrder, mainSections)}
      </main>
    </div>
  );
}
