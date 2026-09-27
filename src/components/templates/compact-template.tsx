import { ResumeData } from "@/types/resume";

export function CompactTemplate({ data }: { data: ResumeData }) {
  return (
    <div className="bg-white text-neutral-900 p-8 max-w-200 mx-auto font-sans text-xs leading-snug">
      <header className="flex justify-between items-start border-b border-neutral-300 pb-3 mb-4">
        <div>
          <h1 className="text-xl font-bold">{data.personalInfo.fullName}</h1>
          {data.personalInfo.role && (
            <p className="text-primary text-xs font-medium">{data.personalInfo.role}</p>
          )}
          <p className="text-neutral-500 text-[11px]">{data.personalInfo.email} · {data.personalInfo.phone}</p>
        </div>
        {data.personalInfo.location && (
          <p className="text-neutral-400 text-[11px] shrink-0">{data.personalInfo.location}</p>
        )}
      </header>

      {data.summary && <p className="text-neutral-600 mb-4">{data.summary}</p>}

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <h2 className="font-bold uppercase text-[10px] tracking-wider text-primary mb-2">Experience</h2>
          {data.experience.map((exp, i) => (
            <div key={i} className="mb-3">
              <div className="flex justify-between gap-2">
                <p className="font-semibold min-w-0">{exp.role}, {exp.company}</p>
                <p className="text-neutral-400 text-[10px] shrink-0 whitespace-nowrap">{exp.startDate}-{exp.endDate ?? "Now"}</p>
              </div>
              <p className="text-neutral-600">{exp.description}</p>
            </div>
          ))}

          {data.projects?.length > 0 && (
            <>
              <h2 className="font-bold uppercase text-[10px] tracking-wider text-primary mb-2 mt-4">Projects</h2>
              {data.projects.map((project, i) => (
                <div key={i} className="mb-2">
                  <p className="font-semibold">{project.name}</p>
                  <p className="text-neutral-600">{project.description}</p>
                </div>
              ))}
            </>
          )}
        </div>

        <div>
          <h2 className="font-bold uppercase text-[10px] tracking-wider text-primary mb-2">Education</h2>
          {data.education.map((edu, i) => (
            <div key={i} className="mb-2">
              <p className="font-semibold">{edu.degree}</p>
              <p className="text-neutral-500 text-[10px]">{edu.institution}</p>
              <p className="text-neutral-400 text-[10px]">{edu.startDate}-{edu.endDate ?? "Now"}</p>
            </div>
          ))}

          <h2 className="font-bold uppercase text-[10px] tracking-wider text-primary mb-2 mt-4">Skills</h2>
          <div className="flex flex-wrap gap-1">
            {data.skills.map((skill, i) => (
              <span key={i} className="bg-neutral-100 px-1.5 py-0.5 rounded text-[10px]">{skill}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
