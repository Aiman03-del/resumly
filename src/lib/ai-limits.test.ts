import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { AI_FEATURE_LABELS, AI_LIMITS } from "./ai-limits";

describe("AI limits", () => {
  it("has a label for every limited route", () => {
    expect(Object.keys(AI_FEATURE_LABELS).sort()).toEqual(Object.keys(AI_LIMITS).sort());
  });

  it("is what each API route actually enforces", () => {
    for (const route of Object.keys(AI_LIMITS)) {
      const source = readFileSync(`src/app/api/${route}/route.ts`, "utf8");
      expect(source, route).toContain(`AI_LIMITS["${route}"]`);
    }
  });
});