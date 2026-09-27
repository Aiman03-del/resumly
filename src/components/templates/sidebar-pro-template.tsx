import { ResumeData } from "@/types/resume";

export function SidebarProTemplate({ data }: { data: ResumeData }) {
  return (
    <div className="bg-white text-neutral-900 flex min-h-[1000px] font-sans text-sm">
      <aside className="w-[32%] bg-neutral-50 border-r border-neutral-200 p-7">
        {data.personalInfo.photoUrl && (
          <img
            src={data.personalInfo.photoUrl}
            alt={data.personalInfo.fullName}
            className="w-20 h-20 rounded-lg object-cover mb-4"
          />
        )}
        <h1 className="text-lg font-bold">{data.personalInfo.fullName}</h1>
        <div className="text-xs text-neutral-500 mt-2 space-y-0.5">
          <p>{data.personalInfo.email}</p>
          <p>{data.personalInfo.phone}</p>
          {data.personalInfo.location && <p>{data.personalInfo.location}</p>}
        </div>

        <h2 className="text-primary font-semibold uppercase text-[10px] tracking-wider mt-6 mb-2">Skills</h2>
        <div className="space-y-1.5">
          {data.skills.map((skill, i) => (
            <div key={i} className="text-xs bg-white border border-neutral-200 rounded px-2 py-1">{skill}</div>
          ))}
        </div>

        <h2 className="text-primary font-semibold uppercase text-[10px] tracking-wider mt-6 mb-2">Education</h2>
        {data.education.map((edu, i) => (
          <div key={i} className="mb-2 text-xs">
            <p className="font-medium">{edu.degree}</p>
            <p className="text-neutral-500">{edu.institution}</p>
          </div>
        ))}
      </aside>

      <main className="flex-1 p-7">
        {data.summary && (
          <section className="mb-6">
            <h2 className="text-primary font-semibold uppercase text-xs tracking-wider mb-2">Summary</h2>
            <p className="text-neutral-700">{data.summary}</p>
          </section>
        )}

        <section className="mb-6">
          <h2 className="text-primary font-semibold uppercase text-xs tracking-wider mb-3">Experience</h2>
          {data.experience.map((exp, i) => (
            <div key={i} className="mb-4">
              <div className="flex justify-between gap-3">
                <p className="font-medium min-w-0">{exp.role} · {exp.company}</p>
                <p className="text-neutral-400 text-xs shrink-0 whitespace-nowrap">{exp.startDate} - {exp.endDate ?? "Present"}</p>
              </div>
              <p className="text-neutral-600 mt-1">{exp.description}</p>
            </div>
          ))}
        </section>

        {data.projects?.length > 0 && (
          <section>
            <h2 className="text-primary font-semibold uppercase text-xs tracking-wider mb-3">Projects</h2>
            {data.projects.map((project, i) => (
              <div key={i} className="mb-3">
                <p className="font-medium">{project.name}</p>
                <p className="text-neutral-600 text-xs">{project.description}</p>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
