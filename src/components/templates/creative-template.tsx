import { ResumeData } from "@/types/resume";

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

        <SidebarSectionTitle>Skills</SidebarSectionTitle>
        <div className="flex flex-wrap gap-1.5 mb-8">
          {data.skills.map((skill, i) => (
            <span key={i} className="bg-white/10 px-2 py-1 rounded text-xs">
              {skill}
            </span>
          ))}
        </div>

        <SidebarSectionTitle>Education</SidebarSectionTitle>
        {data.education.map((edu, i) => (
          <div key={i} className="mb-3 text-xs">
            <p className="font-medium">{edu.degree}</p>
            <p className="text-neutral-400">{edu.institution}</p>
          </div>
        ))}
      </aside>

      <main className="flex-1 p-8">
        {data.summary && (
          <section className="mb-6">
            <SectionTitle>Profile</SectionTitle>
            <p className="text-neutral-700">{data.summary}</p>
          </section>
        )}

        <section className="mb-6">
          <SectionTitle>Experience</SectionTitle>
          {data.experience.map((exp, i) => (
            <div key={i} className="mb-4 pl-3 border-l-2 border-accent/30">
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

        <section>
            <SectionTitle>Projects</SectionTitle>
          {data.projects.map((proj, i) => (
            <div key={i} className="mb-3">
                <div className="flex justify-between gap-3">
                  <p className="font-medium min-w-0">{proj.name}</p>
                  {proj.link && (
                    <span className="text-accent text-xs shrink-0 whitespace-nowrap">
                      {proj.link.replace(/^https?:\/\//, "")}
                    </span>
                  )}
                </div>
                <p className="text-neutral-700 text-xs mt-0.5">{proj.description}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}