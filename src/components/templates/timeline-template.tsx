import { ResumeData } from "@/types/resume";

export function TimelineTemplate({ data }: { data: ResumeData }) {
  return (
    <div className="bg-white text-neutral-900 p-10 max-w-200 mx-auto font-sans text-sm">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">{data.personalInfo.fullName}</h1>
        <p className="text-neutral-500 text-xs mt-1">
          {data.personalInfo.email} · {data.personalInfo.phone}
          {data.personalInfo.location && ` · ${data.personalInfo.location}`}
        </p>
      </header>

      {data.summary && <p className="text-neutral-600 mb-8">{data.summary}</p>}

      <h2 className="text-primary font-semibold uppercase text-xs tracking-wider mb-4">Experience</h2>
      <div className="relative pl-6 border-l-2 border-primary/20 space-y-6 mb-8">
        {data.experience.map((exp, i) => (
          <div key={i} className="relative">
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

      <h2 className="text-primary font-semibold uppercase text-xs tracking-wider mb-4">Education</h2>
      <div className="relative pl-6 border-l-2 border-primary/20 space-y-4 mb-8">
        {data.education.map((edu, i) => (
          <div key={i} className="relative">
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

      {data.projects?.length > 0 && (
        <>
          <h2 className="text-primary font-semibold uppercase text-xs tracking-wider mb-3">Projects</h2>
          {data.projects.map((project, i) => (
            <div key={i} className="mb-3">
              <p className="font-medium">{project.name}</p>
              <p className="text-neutral-600 text-xs">{project.description}</p>
            </div>
          ))}
        </>
      )}

      <h2 className="text-primary font-semibold uppercase text-xs tracking-wider mb-2 mt-6">Skills</h2>
      <div className="flex flex-wrap gap-2">
        {data.skills.map((skill, i) => (
          <span key={i} className="bg-primary/10 text-primary px-2.5 py-1 rounded-full text-xs">{skill}</span>
        ))}
      </div>
    </div>
  );
}
