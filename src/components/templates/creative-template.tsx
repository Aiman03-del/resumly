import { ResumeData } from "@/types/resume";

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
        <p className="text-neutral-400 text-xs mb-6">{data.personalInfo.location}</p>

        <div className="space-y-1 text-xs text-neutral-300 mb-8">
          <p>{data.personalInfo.email}</p>
          <p>{data.personalInfo.phone}</p>
        </div>

        <h2 className="text-accent font-semibold uppercase text-xs tracking-wider mb-3">Skills</h2>
        <div className="flex flex-wrap gap-1.5 mb-8">
          {data.skills.map((skill, i) => (
            <span key={i} className="bg-white/10 px-2 py-1 rounded text-xs">
              {skill}
            </span>
          ))}
        </div>

        <h2 className="text-accent font-semibold uppercase text-xs tracking-wider mb-3">Education</h2>
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
            <h2 className="text-accent font-semibold uppercase text-xs tracking-wider mb-2">Profile</h2>
            <p className="text-neutral-700">{data.summary}</p>
          </section>
        )}

        <section className="mb-6">
          <h2 className="text-accent font-semibold uppercase text-xs tracking-wider mb-3">Experience</h2>
          {data.experience.map((exp, i) => (
            <div key={i} className="mb-4 pl-3 border-l-2 border-accent/30">
              <div className="flex justify-between">
                <p className="font-medium">{exp.role}</p>
                <p className="text-neutral-500 text-xs">{exp.startDate} - {exp.endDate ?? "Present"}</p>
              </div>
              <p className="text-accent text-xs mb-1">{exp.company}</p>
              <p className="text-neutral-700">{exp.description}</p>
            </div>
          ))}
        </section>

        <section>
          <h2 className="text-accent font-semibold uppercase text-xs tracking-wider mb-3">Projects</h2>
          {data.projects.map((proj, i) => (
            <div key={i} className="mb-3">
              <p className="font-medium">{proj.name}</p>
              <p className="text-neutral-700 text-xs">{proj.description}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}