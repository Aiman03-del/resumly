import { ResumeData } from "@/types/resume";

export function MinimalTemplate({ data }: { data: ResumeData }) {
  return (
    <div className="bg-white text-neutral-900 p-12 max-w-200 mx-auto font-sans text-sm leading-relaxed">
      <header className="border-b border-neutral-200 pb-6 mb-7">
        <h1 className="text-3xl font-light tracking-tight">{data.personalInfo.fullName}</h1>
        {data.personalInfo.role && (
          <p className="text-neutral-600 text-sm mt-1">{data.personalInfo.role}</p>
        )}
        <p className="text-neutral-500 text-xs mt-2">
          {data.personalInfo.email} · {data.personalInfo.phone}
          {data.personalInfo.location && ` · ${data.personalInfo.location}`}
        </p>
      </header>

      {data.summary && (
        <section className="mb-7">
          <p className="text-neutral-600">{data.summary}</p>
        </section>
      )}

      <section className="mb-7">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500 mb-3">Experience</h2>
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

      <section className="mb-7">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500 mb-3">Education</h2>
        {data.education.map((edu, i) => (
          <div key={i} className="flex justify-between gap-3 mb-2">
            <p className="font-medium min-w-0">{edu.degree}, {edu.institution}</p>
            <p className="text-neutral-400 text-xs shrink-0 whitespace-nowrap">{edu.startDate} - {edu.endDate ?? "Present"}</p>
          </div>
        ))}
      </section>

      {data.projects.length > 0 && (
        <section className="mb-7">
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500 mb-3">Projects</h2>
          {data.projects.map((project, i) => (
            <div key={i} className="mb-3">
              <p className="font-medium">{project.name}</p>
              <p className="text-neutral-600 text-xs">{project.description}</p>
            </div>
          ))}
        </section>
      )}

      <section>
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500 mb-3">Skills</h2>
        <p className="text-neutral-700">{data.skills.join(" · ")}</p>
      </section>
    </div>
  );
}
