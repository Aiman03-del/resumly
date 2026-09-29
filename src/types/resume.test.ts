import { describe, expect, it } from "vitest";
import {
  isAllowedPhotoUrl,
  isHttpUrl,
  LIMITS,
  resumeApiSchema,
  sanitizeResumeUrls,
  type ResumeData,
} from "./resume";

describe("isHttpUrl", () => {
  it("accepts plain http/https URLs", () => {
    expect(isHttpUrl("https://example.com")).toBe(true);
    expect(isHttpUrl("http://example.com/path?query=1")).toBe(true);
  });

  it("rejects dangerous or malformed schemes", () => {
    expect(isHttpUrl("javascript:alert(1)")).toBe(false);
    expect(isHttpUrl("data:text/html,<script>alert(1)</script>")).toBe(false);
    expect(isHttpUrl("not a url")).toBe(false);
    expect(isHttpUrl("")).toBe(false);
  });

  it("rejects URLs carrying embedded credentials", () => {
    expect(isHttpUrl("https://user:pass@example.com")).toBe(false);
  });
});

describe("isAllowedPhotoUrl", () => {
  it("accepts ImageKit https URLs", () => {
    expect(isAllowedPhotoUrl("https://ik.imagekit.io/demo/photo.png")).toBe(true);
  });

  it("rejects other origins, even if they are otherwise valid https URLs", () => {
    expect(isAllowedPhotoUrl("https://evil.example.com/photo.png")).toBe(false);
  });

  it("rejects http (non-tls) and credentialed URLs", () => {
    expect(isAllowedPhotoUrl("http://ik.imagekit.io/demo/photo.png")).toBe(false);
    expect(isAllowedPhotoUrl("https://user:pass@ik.imagekit.io/demo/photo.png")).toBe(false);
  });

  it("rejects overly long values", () => {
    const long = `https://ik.imagekit.io/${"a".repeat(LIMITS.url)}`;
    expect(isAllowedPhotoUrl(long)).toBe(false);
  });
});

describe("resumeApiSchema", () => {
  it("fills in sensible defaults for a mostly-empty resume", () => {
    const result = resumeApiSchema.parse({});
    expect(result.personalInfo).toEqual({});
    expect(result.experience).toEqual([]);
    expect(result.skills).toEqual([]);
  });

  it("accepts a well-formed resume", () => {
    const result = resumeApiSchema.parse({
      personalInfo: { fullName: "Ada Lovelace", email: "ada@example.com" },
      summary: "Mathematician and writer.",
      experience: [{ company: "Analytical Engines Inc", role: "Engineer" }],
      skills: ["Math", "Programming"],
    });
    expect(result.personalInfo.fullName).toBe("Ada Lovelace");
    expect(result.experience).toHaveLength(1);
  });

  it("rejects a resume with too many experience entries", () => {
    const experience = Array.from({ length: LIMITS.maxExperience + 1 }, () => ({ company: "X", role: "Y" }));
    expect(() => resumeApiSchema.parse({ experience })).toThrow();
  });

  it("rejects a field that exceeds its length limit", () => {
    expect(() => resumeApiSchema.parse({ summary: "a".repeat(LIMITS.summary + 1) })).toThrow();
  });

  it("strips unknown keys instead of passing them through", () => {
    const result = resumeApiSchema.parse({ summary: "ok", maliciousField: "<script>alert(1)</script>" });
    expect(result).not.toHaveProperty("maliciousField");
  });
});

describe("sanitizeResumeUrls", () => {
  const baseResume: ResumeData = {
    personalInfo: { fullName: "Ada", email: "ada@example.com", phone: "123", photoUrl: "javascript:alert(1)" },
    summary: "",
    experience: [],
    education: [],
    skills: [],
    projects: [
      { name: "Project A", description: "", link: "javascript:alert(1)", links: ["https://good.example.com", "data:text/html,evil"] },
    ],
    certifications: [{ name: "Cert", issuer: "Issuer", credentialUrl: "not-a-url" }],
    languages: [],
    achievements: [],
    awards: [],
    publications: [{ title: "Paper", url: "https://legit.example.com" }],
    courses: [],
  };

  it("drops a photo URL that is not on the allowed ImageKit origin", () => {
    const result = sanitizeResumeUrls(baseResume);
    expect(result.personalInfo.photoUrl).toBeUndefined();
  });

  it("drops non-http(s) project links but keeps valid ones", () => {
    const result = sanitizeResumeUrls(baseResume);
    expect(result.projects[0].link).toBeUndefined();
    expect(result.projects[0].links).toEqual(["https://good.example.com"]);
  });

  it("drops an invalid credential URL", () => {
    const result = sanitizeResumeUrls(baseResume);
    expect(result.certifications[0].credentialUrl).toBeUndefined();
  });

  it("keeps a valid publication URL untouched", () => {
    const result = sanitizeResumeUrls(baseResume);
    expect(result.publications[0].url).toBe("https://legit.example.com");
  });
});