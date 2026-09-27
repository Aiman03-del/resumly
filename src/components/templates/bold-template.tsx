import { ResumeData } from "@/types/resume";

export function BoldTemplate({ data }: { data: ResumeData }) {
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
        {data.summary && <p className="text-neutral-600 mb-8">{data.summary}</p>}

        <section className="mb-8">
          <h2 className="text-primary font-bold uppercase text-xs tracking-wider mb-3 pb-1 border-b-2 border-primary/20">Experience</h2>
          {data.experience.map((exp, i) => (
            <div key={i} className="mb-4">
              <div className="flex justify-between gap-3">
                <p className="font-semibold min-w-0">{exp.role} · {exp.company}</p>
                <p className="text-neutral-400 text-xs shrink-0 whitespace-nowrap">{exp.startDate} - {exp.endDate ?? "Present"}</p>
              </div>
              <p className="text-neutral-600 mt-1">{exp.description}</p>
            </div>
          ))}
        </section>

        <section className="mb-8">
          <h2 className="text-primary font-bold uppercase text-xs tracking-wider mb-3 pb-1 border-b-2 border-primary/20">Education</h2>
          {data.education.map((edu, i) => (
            <div key={i} className="flex justify-between gap-3 mb-2">
              <p className="font-semibold min-w-0">{edu.degree}, {edu.institution}</p>
              <p className="text-neutral-400 text-xs shrink-0 whitespace-nowrap">{edu.startDate} - {edu.endDate ?? "Present"}</p>
            </div>
          ))}
        </section>

        <section>
          <h2 className="text-primary font-bold uppercase text-xs tracking-wider mb-3 pb-1 border-b-2 border-primary/20">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill, i) => (
              <span key={i} className="bg-primary text-primary-fg px-3 py-1 rounded-full text-xs font-medium">{skill}</span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
