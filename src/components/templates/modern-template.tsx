import { ResumeData } from "@/types/resume";

export function ModernTemplate({ data }: { data: ResumeData }) {
  return (
    <div className="bg-white text-neutral-900 p-10 max-w-[800px] mx-auto font-sans text-sm leading-relaxed">
      <header className="flex items-center gap-5 border-b-2 border-primary pb-5 mb-6">
        {data.personalInfo.photoUrl && (
          <img
            src={data.personalInfo.photoUrl}
            alt={data.personalInfo.fullName}
            className="w-20 h-20 rounded-full object-cover"
          />
        )}
        <div>
          <h1 className="text-2xl font-bold">{data.personalInfo.fullName}</h1>
          <p className="text-neutral-600">
            {data.personalInfo.email} · {data.personalInfo.phone}
            {data.personalInfo.location && ` · ${data.personalInfo.location}`}
          </p>
        </div>
      </header>

      {data.summary && (
        <section className="mb-6">
          <h2 className="text-primary font-semibold uppercase text-xs tracking-wider mb-2">Summary</h2>
          <p>{data.summary}</p>
        </section>
      )}

      <section className="mb-6">
        <h2 className="text-primary font-semibold uppercase text-xs tracking-wider mb-2">Experience</h2>
        {data.experience.map((exp, i) => (
          <div key={i} className="mb-4">
            <div className="flex justify-between gap-3">
              <p className="font-medium min-w-0">{exp.role} · {exp.company}</p>
              <p className="text-neutral-500 text-xs shrink-0 whitespace-nowrap">
                {exp.startDate} - {exp.endDate ?? "Present"}
              </p>
            </div>
            <p className="text-neutral-700 mt-1">{exp.description}</p>
          </div>
        ))}
      </section>

      <section className="mb-6">
        <h2 className="text-primary font-semibold uppercase text-xs tracking-wider mb-2">Education</h2>
        {data.education.map((edu, i) => (
          <div key={i} className="flex justify-between gap-3 mb-2">
            <p className="font-medium min-w-0">{edu.degree}, {edu.institution}</p>
            <p className="text-neutral-500 text-xs shrink-0 whitespace-nowrap">
              {edu.startDate} - {edu.endDate ?? "Present"}
            </p>
          </div>
        ))}
      </section>

      <section>
        <h2 className="text-primary font-semibold uppercase text-xs tracking-wider mb-2">Skills</h2>
        <div className="flex flex-wrap gap-2">
          {data.skills.map((skill, i) => (
            <span key={i} className="bg-primary/10 text-primary px-2.5 py-1 rounded-full text-xs">
              {skill}
            </span>
          ))}
        </div>
      </section>

      {data.projects?.length > 0 && (
        <section className="mt-6">
          <h2 className="text-primary font-semibold uppercase text-xs tracking-wider mb-2">Projects</h2>
          {data.projects.map((proj, i) => (
            <div key={i} className="mb-3">
              <div className="flex justify-between gap-3">
                <p className="font-medium min-w-0">{proj.name}</p>
                {proj.link && (
                  <a href={proj.link} className="text-primary text-xs shrink-0 whitespace-nowrap">
                    {proj.link.replace(/^https?:\/\//, "")}
                  </a>
                )}
              </div>
              <p className="text-neutral-700 mt-0.5">{proj.description}</p>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}