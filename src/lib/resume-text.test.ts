import { describe, expect, it } from "vitest";
import { asArray, asRecord, buildResumeText, hasResumeContent, text } from "./resume-text";

describe("asRecord", () => {
  it("passes through plain objects", () => {
    expect(asRecord({ a: 1 })).toEqual({ a: 1 });
  });

  it("returns an empty object for arrays, null, or primitives", () => {
    expect(asRecord([1, 2])).toEqual({});
    expect(asRecord(null)).toEqual({});
    expect(asRecord("hello")).toEqual({});
    expect(asRecord(undefined)).toEqual({});
  });
});

describe("asArray", () => {
  it("passes through arrays and defaults everything else to []", () => {
    expect(asArray([1, 2, 3])).toEqual([1, 2, 3]);
    expect(asArray({ length: 3 })).toEqual([]);
    expect(asArray(null)).toEqual([]);
  });
});

describe("text", () => {
  it("trims and truncates strings", () => {
    expect(text("  hello world  ", 5)).toBe("hello");
  });

  it("returns an empty string for non-strings instead of throwing", () => {
    expect(text(42)).toBe("");
    expect(text(null)).toBe("");
    expect(text(undefined)).toBe("");
    expect(text({ malicious: "payload" })).toBe("");
  });
});

describe("hasResumeContent", () => {
  it("is false for a fully empty resume", () => {
    expect(hasResumeContent({})).toBe(false);
  });

  it("is true once any meaningful section has content", () => {
    expect(hasResumeContent({ summary: "Hi" })).toBe(true);
    expect(hasResumeContent({ experience: [{ company: "X" }] })).toBe(true);
    expect(hasResumeContent({ skills: ["Go"] })).toBe(true);
  });

  it("ignores whitespace-only summaries", () => {
    expect(hasResumeContent({ summary: "   " })).toBe(false);
  });
});

describe("buildResumeText", () => {
  it("produces a readable block that includes the target role and skills", () => {
    const out = buildResumeText({
      personalInfo: { role: "Backend Engineer", email: "a@b.com" },
      summary: "Experienced engineer.",
      skills: ["Go", "Postgres"],
      experience: [{ company: "Acme", role: "Engineer", startDate: "2020", endDate: "2022", description: "Built things." }],
    });
    expect(out).toContain("Target role/title: Backend Engineer");
    expect(out).toContain("Go, Postgres");
    expect(out).toContain("Acme");
  });

  it("only includes the candidate's name when includeName is set", () => {
    const resume = { personalInfo: { fullName: "Ada Lovelace" } };
    expect(buildResumeText(resume)).not.toContain("Candidate name");
    expect(buildResumeText(resume, { includeName: true })).toContain("Candidate name: Ada Lovelace");
  });

  it("never lets unbounded input blow up the output size", () => {
    const out = buildResumeText({ summary: "a".repeat(5000) });
    expect(out.length).toBeLessThan(2000);
  });
});