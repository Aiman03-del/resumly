import { describe, expect, it } from "vitest";
import {
  computeMatchScore,
  containsTerm,
  matchRequirements,
  parseRequirements,
  resumeSearchText,
  type RequirementResult,
} from "./keyword-match";

describe("containsTerm", () => {
  it("matches whole words case-insensitively", () => {
    expect(containsTerm("built apps with react and node", "React")).toBe(true);
  });

  it("does not match inside a longer word", () => {
    expect(containsTerm("wrote javascript daily", "java")).toBe(false);
  });

  it("does not treat C as C++ or C#", () => {
    expect(containsTerm("experienced in c++ and c#", "c")).toBe(false);
    expect(containsTerm("experienced in c++", "c++")).toBe(true);
  });

  it("handles dots and separators", () => {
    expect(containsTerm("used node.js on the backend", "Node.js")).toBe(true);
    expect(containsTerm("set up ci/cd pipelines", "CI/CD")).toBe(true);
    expect(containsTerm("set up ci cd pipelines", "ci-cd")).toBe(true);
  });

  it("returns false for an empty term", () => {
    expect(containsTerm("anything", "  ")).toBe(false);
  });
});

describe("resumeSearchText", () => {
  it("includes skills and descriptions but ignores urls and photo fields", () => {
    const text = resumeSearchText({
      personalInfo: { role: "Frontend Developer", photoUrl: "https://cdn.example.com/react.png" },
      skills: ["TypeScript"],
      experience: [{ role: "Dev", company: "Acme", description: "Built dashboards" }],
      projects: [{ name: "Shop", description: "Checkout flow", link: "https://github.com/x/kubernetes" }],
    });
    expect(text).toContain("typescript");
    expect(text).toContain("built dashboards");
    expect(text).not.toContain("kubernetes");
    expect(text).not.toContain("cdn.example.com");
  });
});

describe("parseRequirements", () => {
  it("cleans, dedupes and defaults importance to preferred", () => {
    const result = parseRequirements([
      { keyword: "React", aliases: ["React.js", "react", ""], importance: "required" },
      { keyword: "react", importance: "required" },
      { keyword: "SQL" },
      { keyword: "" },
      "junk",
    ]);
    expect(result).toEqual([
      { keyword: "React", aliases: ["React.js"], importance: "required" },
      { keyword: "SQL", aliases: [], importance: "preferred" },
    ]);
  });

  it("returns an empty list for non-arrays", () => {
    expect(parseRequirements(null)).toEqual([]);
  });

  it("caps the list at 30 entries", () => {
    const many = Array.from({ length: 50 }, (_, i) => ({ keyword: `skill${i}` }));
    expect(parseRequirements(many)).toHaveLength(30);
  });
});

describe("matchRequirements and computeMatchScore", () => {
  const requirements = [
    { keyword: "JavaScript", aliases: ["JS"], importance: "required" as const },
    { keyword: "Docker", aliases: [], importance: "required" as const },
    { keyword: "GraphQL", aliases: [], importance: "preferred" as const },
  ];

  it("uses aliases to find matches", () => {
    const results = matchRequirements(requirements, "strong js and docker experience");
    expect(results.map((result) => result.found)).toEqual([true, true, false]);
  });

  it("weighs required keywords twice as much as preferred ones", () => {
    const results = matchRequirements(requirements, "strong js and docker experience");
    expect(computeMatchScore(results)).toBe(80);
  });

  it("scores 0 for no requirements and 100 when everything matches", () => {
    expect(computeMatchScore([])).toBe(0);
    const all: RequirementResult[] = requirements.map((requirement) => ({ ...requirement, found: true }));
    expect(computeMatchScore(all)).toBe(100);
  });
});