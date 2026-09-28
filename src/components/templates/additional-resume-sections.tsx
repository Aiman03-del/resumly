import type { ReactNode } from "react";
import type { ResumeData } from "@/types/resume";
import type { AdditionalSectionKey } from "@/lib/section-order";

interface AdditionalResumeSectionsProps {
  data: ResumeData;
  section?: AdditionalSectionKey;
}

const SECTION_KEYS: AdditionalSectionKey[] = [
  "certifications",
  "languages",
  "achievements",
  "awards",
  "publications",
  "courses",
];

export function AdditionalResumeSections({
  data,
  section,
}: AdditionalResumeSectionsProps) {
  const certifications = data.certifications ?? [];
  const languages = data.languages ?? [];
  const achievements = data.achievements ?? [];
  const awards = data.awards ?? [];
  const publications = data.publications ?? [];
  const courses = data.courses ?? [];

  const sections: Record<AdditionalSectionKey, ReactNode> = {
    certifications: certifications.length > 0 ? (
      <section key="certifications">
        <h2 className="text-primary font-semibold uppercase text-xs tracking-wider mb-3 pb-1.5 border-b border-primary/30">
          Certifications
        </h2>
        <div className="space-y-4">
          {certifications.map((item, index) => (
            <div key={index}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{item.name}</h3>
                  {item.issuer && <p className="text-sm opacity-70">{item.issuer}</p>}
                </div>
                {item.issueDate && (
                  <span className="text-sm opacity-60">
                    {item.issueDate}{item.expiryDate ? ` – ${item.expiryDate}` : ""}
                  </span>
                )}
              </div>
              {item.credentialId && (
                <p className="text-xs opacity-60 mt-1">Credential ID: {item.credentialId}</p>
              )}
              {item.credentialUrl && (
                <a href={item.credentialUrl} target="_blank" rel="noopener noreferrer" className="text-xs underline opacity-70">
                  View Credential
                </a>
              )}
            </div>
          ))}
        </div>
      </section>
    ) : null,
    languages: languages.length > 0 ? (
      <section key="languages">
        <h2 className="text-primary font-semibold uppercase text-xs tracking-wider mb-3 pb-1.5 border-b border-primary/30">
          Languages
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {languages.map((item, index) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <span className="font-medium">{item.name}</span>
              <span className="text-sm opacity-65">{item.proficiency}</span>
            </div>
          ))}
        </div>
      </section>
    ) : null,
    achievements: achievements.length > 0 ? (
      <section key="achievements">
        <h2 className="text-primary font-semibold uppercase text-xs tracking-wider mb-3 pb-1.5 border-b border-primary/30">
          Achievements
        </h2>
        <div className="space-y-4">
          {achievements.map((item, index) => (
            <div key={index}>
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  {item.organization && <p className="text-sm opacity-70">{item.organization}</p>}
                </div>
                {item.date && <span className="text-sm opacity-60">{item.date}</span>}
              </div>
              {item.description && <p className="text-sm opacity-75 mt-1 leading-relaxed">{item.description}</p>}
            </div>
          ))}
        </div>
      </section>
    ) : null,
    awards: awards.length > 0 ? (
      <section key="awards">
        <h2 className="text-primary font-semibold uppercase text-xs tracking-wider mb-3 pb-1.5 border-b border-primary/30">
          Awards &amp; Honors
        </h2>
        <div className="space-y-4">
          {awards.map((item, index) => (
            <div key={index}>
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  {item.issuer && <p className="text-sm opacity-70">{item.issuer}</p>}
                </div>
                {item.date && <span className="text-sm opacity-60">{item.date}</span>}
              </div>
              {item.description && <p className="text-sm opacity-75 mt-1 leading-relaxed">{item.description}</p>}
            </div>
          ))}
        </div>
      </section>
    ) : null,
    publications: publications.length > 0 ? (
      <section key="publications">
        <h2 className="text-primary font-semibold uppercase text-xs tracking-wider mb-3 pb-1.5 border-b border-primary/30">
          Publications
        </h2>
        <div className="space-y-4">
          {publications.map((item, index) => (
            <div key={index}>
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  {item.publisher && <p className="text-sm opacity-70">{item.publisher}</p>}
                </div>
                {item.date && <span className="text-sm opacity-60">{item.date}</span>}
              </div>
              {item.description && <p className="text-sm opacity-75 mt-1 leading-relaxed">{item.description}</p>}
              {item.url && (
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-block text-xs underline opacity-70 mt-1">
                  View Publication
                </a>
              )}
            </div>
          ))}
        </div>
      </section>
    ) : null,
    courses: courses.length > 0 ? (
      <section key="courses">
        <h2 className="text-primary font-semibold uppercase text-xs tracking-wider mb-3 pb-1.5 border-b border-primary/30">
          Courses &amp; Training
        </h2>
        <div className="space-y-4">
          {courses.map((item, index) => (
            <div key={index}>
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{item.name}</h3>
                  {item.provider && <p className="text-sm opacity-70">{item.provider}</p>}
                </div>
                {item.date && <span className="text-sm opacity-60">{item.date}</span>}
              </div>
              {item.description && <p className="text-sm opacity-75 mt-1 leading-relaxed">{item.description}</p>}
              {item.credentialUrl && (
                <a href={item.credentialUrl} target="_blank" rel="noopener noreferrer" className="inline-block text-xs underline opacity-70 mt-1">
                  View Certificate
                </a>
              )}
            </div>
          ))}
        </div>
      </section>
    ) : null,
  };

  const visibleKeys = section ? [section] : SECTION_KEYS;
  const visibleSections = visibleKeys.map((key) => sections[key]).filter(Boolean);
  if (visibleSections.length === 0) return null;

  return <div className="space-y-7">{visibleSections}</div>;
}