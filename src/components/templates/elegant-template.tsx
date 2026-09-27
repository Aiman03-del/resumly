import { ResumeData } from "@/types/resume";

export function ElegantTemplate({ data }: { data: ResumeData }) {
  return (
    <div className="bg-white text-neutral-900 p-14 max-w-200 mx-auto font-serif text-sm">
      <header className="text-center mb-10">
        <h1 className="text-4xl tracking-wide mb-2">{data.personalInfo.fullName}</h1>
        <div className="w-16 h-px bg-neutral-400 mx-auto my-3" />
        <p className="text-neutral-500 text-xs">
          {data.personalInfo.email} &nbsp;•&nbsp; {data.personalInfo.phone}
          {data.personalInfo.location && ` \u00A0•\u00A0 ${data.personalInfo.location}`}
        </p>
      </header>

      {data.summary && (
        <p className="text-center italic text-neutral-600 mb-10 max-w-lg mx-auto">{data.summary}</p>
      )}

      <section className="mb-8">
        <h2 className="text-center text-xs tracking-[0.3em] text-neutral-500 mb-5">EXPERIENCE</h2>
        {data.experience.map((exp, i) => (
          <div key={i} className="mb-5 text-center">
            <p className="font-semibold">{exp.role}</p>
            <p className="text-neutral-500 text-xs">{exp.company} &nbsp;·&nbsp; {exp.startDate} - {exp.endDate ?? "Present"}</p>
            <p className="text-neutral-600 mt-1 max-w-md mx-auto">{exp.description}</p>
          </div>
        ))}
      </section>

      <section className="mb-8">
        <h2 className="text-center text-xs tracking-[0.3em] text-neutral-500 mb-5">EDUCATION</h2>
        {data.education.map((edu, i) => (
          <div key={i} className="mb-2 text-center">
            <p className="font-semibold">{edu.degree}</p>
            <p className="text-neutral-500 text-xs">{edu.institution} · {edu.startDate} - {edu.endDate ?? "Present"}</p>
          </div>
        ))}
      </section>

      <section className="text-center">
        <h2 className="text-xs tracking-[0.3em] text-neutral-500 mb-3">SKILLS</h2>
        <p className="text-neutral-700">{data.skills.join("  ·  ")}</p>
      </section>
    </div>
  );
}
