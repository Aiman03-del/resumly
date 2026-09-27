import type { ResumeData } from "@/types/resume";
import { normalizeOrder, pickOrder } from "@/lib/section-order";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 text-neutral-900 font-bold uppercase text-xs tracking-[0.12em] mb-3 pb-1.5 border-b-2 border-accent">
      <span className="w-2 h-2 rounded-sm bg-accent shrink-0" />
      {children}
    </h2>
  );
}

function SidebarSectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 text-accent font-bold uppercase text-xs tracking-[0.12em] mb-3 pb-1.5 border-b border-accent/30">
      <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
      {children}
    </h2>
  );
}

export function CreativeTemplate({ data }: { data: ResumeData }) {
  const fullOrder = normalizeOrder(data.sectionOrder);
  const sidebarOrder = pickOrder(fullOrder, ["skills", "education"]);
  const mainOrder = pickOrder(fullOrder, ["summary", "experience", "projects"]);

  const sidebarSections = {
    skills: (
      <div key="skills">
        <SidebarSectionTitle>Skills</SidebarSectionTitle>
        <div className="flex flex-wrap gap-1.5 mb-8">
          {data.skills.map((skill, index) => (
            <span key={index} className="bg-white/10 px-2 py-1 rounded text-xs">{skill}</span>
          ))}
        </div>
      </div>
    ),
    education: (
      <div key="education">
        <SidebarSectionTitle>Education</SidebarSectionTitle>
        {data.education.map((edu, index) => (
          <div key={index} className="mb-3 text-xs">
            <p className="font-medium">{edu.degree}</p>
            <p className="text-neutral-400">{edu.institution}</p>
          </div>
        ))}
      </div>
    ),
  };

  const mainSections = {
    summary: data.summary ? (
      <section key="summary" className="mb-6">
        <SectionTitle>Profile</SectionTitle>
        <p className="text-neutral-700">{data.summary}</p>
      </section>
    ) : null,
    experience: (
      <section key="experience" className="mb-6">
        <SectionTitle>Experience</SectionTitle>
        {data.experience.map((exp, index) => (
          <div key={index} className="mb-4 pl-3 border-l-2 border-accent/30">
            <div className="flex justify-between gap-3">
              <p className="font-medium min-w-0">{exp.role}</p>
              <p className="text-neutral-500 text-xs shrink-0 whitespace-nowrap">
                {exp.startDate} - {exp.endDate ?? "Present"}
              </p>
            </div>
            <p className="text-accent text-xs mb-1 font-medium">{exp.company}</p>
            <p className="text-neutral-700">{exp.description}</p>
          </div>
        ))}
      </section>
    ),
    projects: data.projects?.length > 0 ? (
      <section key="projects">
        <SectionTitle>Projects</SectionTitle>
        {data.projects.map((project, index) => {
          const currentLinks = project.links?.filter((link) => link.trim()) ?? [];
          const links = currentLinks.length ? currentLinks : project.link ? [project.link] : [];
          return (
            <div key={index} className="mb-3">
              <div className="flex justify-between gap-3">
                <p className="font-medium min-w-0">{project.name}</p>
                {links.length > 0 && (
                  <span className="text-accent text-xs shrink-0 whitespace-nowrap">
                    {links.map((link) => link.replace(/^https?:\/\//, "")).join(" · ")}
                  </span>
                )}
              </div>
              <p className="text-neutral-700 text-xs mt-0.5">{project.description}</p>
            </div>
          );
        })}
      </section>
    ) : null,
  };

  return (
    <div className="bg-white text-neutral-900 flex min-h-[1000px] font-sans text-sm">
      <aside className="w-[35%] bg-neutral-900 text-white p-8">
        {data.personalInfo.photoUrl && (
          <img
            src={data.personalInfo.photoUrl}
            alt={data.personalInfo.fullName}
            className="w-24 h-24 rounded-full object-cover mb-5 border-4 border-accent"
          />
        )}
        <h1 className="text-xl font-bold mb-1">{data.personalInfo.fullName}</h1>
        {data.personalInfo.role && (
          <p className="text-accent text-sm font-medium mb-1">{data.personalInfo.role}</p>
        )}
        <p className="text-neutral-400 text-xs mb-6">{data.personalInfo.location}</p>

        <div className="space-y-1 text-xs text-neutral-300 mb-8">
          <p>{data.personalInfo.email}</p>
          <p>{data.personalInfo.phone}</p>
        </div>

        {sidebarOrder.map((key) => sidebarSections[key])}
      </aside>

      <main className="flex-1 p-8">
        {mainOrder.map((key) => mainSections[key])}
      </main>
    </div>
  );
}