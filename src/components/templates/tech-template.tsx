import { ResumeData } from "@/types/resume";

export function TechTemplate({ data }: { data: ResumeData }) {
  return (
    <div className="bg-white text-neutral-900 p-10 max-w-200 mx-auto font-mono text-xs">
      <header className="mb-6">
        <p className="text-neutral-400">{"//"} resume.ts</p>
        <h1 className="text-2xl font-bold text-primary">{data.personalInfo.fullName}</h1>
        <p className="text-neutral-500 mt-1">
          {data.personalInfo.email} | {data.personalInfo.phone}
          {data.personalInfo.location && ` | ${data.personalInfo.location}`}
        </p>
      </header>

      {data.summary && (
        <p className="text-neutral-600 mb-6 border-l-2 border-primary/30 pl-3">{data.summary}</p>
      )}

      <section className="mb-6">
        <p className="text-primary font-bold mb-2">const experience = [</p>
        {data.experience.map((exp, i) => (
          <div key={i} className="pl-4 mb-3 border-l border-neutral-200">
            <div className="flex justify-between gap-3">
              <p className="font-semibold min-w-0">{exp.role} @ {exp.company}</p>
              <p className="text-neutral-400 shrink-0 whitespace-nowrap">{exp.startDate}→{exp.endDate ?? "now"}</p>
            </div>
            <p className="text-neutral-600">{exp.description}</p>
          </div>
        ))}
        <p className="text-primary font-bold">]</p>
      </section>

      <section className="mb-6">
        <p className="text-primary font-bold mb-2">const education = [</p>
        {data.education.map((edu, i) => (
          <div key={i} className="pl-4 mb-2 border-l border-neutral-200">
            <div className="flex justify-between gap-3">
              <p className="min-w-0">{edu.degree}, {edu.institution}</p>
              <p className="text-neutral-400 shrink-0 whitespace-nowrap">{edu.startDate}→{edu.endDate ?? "now"}</p>
            </div>
          </div>
        ))}
        <p className="text-primary font-bold">]</p>
      </section>

      <section>
        <p className="text-primary font-bold mb-2">const skills = [</p>
        <p className="pl-4 text-neutral-700">{data.skills.map((skill) => `"${skill}"`).join(", ")}</p>
        <p className="text-primary font-bold">]</p>
      </section>
    </div>
  );
}
