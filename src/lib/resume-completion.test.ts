import { describe, expect, it } from "vitest";
import { resumeCompletion } from "./resume-completion";
import type { ResumeData } from "@/types/resume";

const empty: ResumeData = {
  personalInfo: { fullName: "", email: "", phone: "" },
  summary: "",
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  languages: [],
  achievements: [],
  awards: [],
  publications: [],
  courses: [],
};

describe("resumeCompletion", () => {
  it("is 0 for an empty resume", () => {
    expect(resumeCompletion(empty)).toBe(0);
  });

  it("scores each section", () => {
    const partial: ResumeData = {
      ...empty,
      personalInfo: { fullName: "A B", email: "a@b.co", phone: "123456" },
      summary: "Hello",
    };
    expect(resumeCompletion(partial)).toBe(35);
  });

  it("is 100 for a complete resume", () => {
    const full: ResumeData = {
      ...empty,
      personalInfo: { fullName: "A B", email: "a@b.co", phone: "123456" },
      summary: "Hello",
      experience: [{ company: "X", role: "Y", startDate: "2020", description: "" }],
      education: [{ institution: "U", degree: "BSc", startDate: "2016" }],
      skills: ["a", "b", "c"],
      languages: [{ name: "English", proficiency: "Fluent" }],
    };
    expect(resumeCompletion(full)).toBe(100);
  });
});