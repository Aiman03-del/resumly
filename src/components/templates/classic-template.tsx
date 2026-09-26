import { ResumeData } from "@/types/resume";

export function ClassicTemplate({ data }: { data: ResumeData }) {
  return (
    <div className="bg-white text-neutral-900 p-10 max-w-[800px] mx-auto font-serif text-sm leading-relaxed">
      <header className="text-center border-b border-neutral-300 pb-5 mb-6">
        <h1 className="text-3xl font-bold tracking-wide">{data.personalInfo.fullName}</h1>
        <p className="text-neutral-600 mt-1 text-xs">
          {data.personalInfo.email} · {data.personalInfo.phone}
          {data.personalInfo.location && ` · ${data.personalInfo.location}`}
        </p>
      </header>

      {data.summary && (
        <section className="mb-6 text-center italic text-neutral-700">
          <p>{data.summary}</p>
        </section>
      )}

      <section className="mb-6">
        <h2 className="font-bold uppercase text-xs tracking-[0.15em] border-b border-neutral-300 pb-1 mb-3">
          Professional Experience
        </h2>
        {data.experience.map((exp, i) => (
          <div key={i} className="mb-4">
            <div className="flex justify-between font-semibold">
              <p>{exp.role}, {exp.company}</p>
              <p className="text-neutral-500 font-normal text-xs">{exp.startDate} - {exp.endDate ?? "Present"}</p>
            </div>
            <p className="text-neutral-700 mt-1">{exp.description}</p>
          </div>
        ))}
      </section>

      <section className="mb-6">
        <h2 className="font-bold uppercase text-xs tracking-[0.15em] border-b border-neutral-300 pb-1 mb-3">
          Education
        </h2>
        {data.education.map((edu, i) => (
          <div key={i} className="flex justify-between mb-2">
            <p className="font-semibold">{edu.degree}, {edu.institution}</p>
            <p className="text-neutral-500 text-xs">{edu.startDate} - {edu.endDate ?? "Present"}</p>
          </div>
        ))}
      </section>

      <section>
        <h2 className="font-bold uppercase text-xs tracking-[0.15em] border-b border-neutral-300 pb-1 mb-3">
          Skills
        </h2>
        <p className="text-neutral-700">{data.skills.join("  ·  ")}</p>
      </section>
    </div>
  );
}