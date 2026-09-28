export type Rec = Record<string, unknown>;

export function asRecord(value: unknown): Rec {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? (value as Rec) : {};
}

export function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function text(value: unknown, max = 600): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function hasResumeContent(resume: Rec): boolean {
  return (
    text(resume.summary).length > 0 ||
    asArray(resume.experience).length > 0 ||
    asArray(resume.education).length > 0 ||
    asArray(resume.skills).length > 0 ||
    asArray(resume.projects).length > 0
  );
}

export function buildResumeText(resume: Rec, options: { includeName?: boolean } = {}): string {
  const info = asRecord(resume.personalInfo);
  const experience = asArray(resume.experience).slice(0, 10).map((item) => {
    const entry = asRecord(item);
    const dates = `${text(entry.startDate, 20)} - ${text(entry.endDate, 20) || "Present"}`;
    return `- ${text(entry.role, 80)} at ${text(entry.company, 80)} (${dates}): ${text(entry.description) || "(no description)"}`;
  });
  const education = asArray(resume.education).slice(0, 6).map((item) => {
    const entry = asRecord(item);
    return `- ${text(entry.degree, 100)}, ${text(entry.institution, 100)} (${text(entry.startDate, 20)} - ${text(entry.endDate, 20) || "Present"})`;
  });
  const skills = asArray(resume.skills).slice(0, 40).map((skill) => text(skill, 40)).filter(Boolean);
  const projects = asArray(resume.projects).slice(0, 10).map((item) => {
    const project = asRecord(item);
    const hasLink = asArray(project.links).some((link) => text(link)) || Boolean(text(project.link));
    return `- ${text(project.name, 80)}${hasLink ? " [has link]" : ""}: ${text(project.description) || "(no description)"}`;
  });

  return [
    ...(options.includeName ? [`Candidate name: ${text(info.fullName, 80) || "not stated"}`] : []),
    `Target role/title: ${text(info.role, 80) || "not stated"}`,
    `Contact: email ${text(info.email) ? "provided" : "missing"}, phone ${text(info.phone) ? "provided" : "missing"}, location ${text(info.location) ? "provided" : "missing"}`,
    `Summary: ${text(resume.summary, 800) || "(empty)"}`,
    `Experience:\n${experience.join("\n") || "(none)"}`,
    `Education:\n${education.join("\n") || "(none)"}`,
    `Skills: ${skills.join(", ") || "(none)"}`,
    `Projects:\n${projects.join("\n") || "(none)"}`,
  ].join("\n\n");
}
