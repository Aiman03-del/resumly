import { describe, expect, it } from "vitest";
import { sampleResumeData } from "./sample-resume";
import { DEFAULT_SECTION_ORDER } from "./section-order";

describe("sampleResumeData", () => {
  it("has content for every section so template previews are complete", () => {
    for (const key of DEFAULT_SECTION_ORDER) {
      const value = sampleResumeData[key];
      expect(value, key).toBeTruthy();
      if (Array.isArray(value)) expect(value.length, key).toBeGreaterThan(0);
    }
  });

  it("contains no links (previews render inside buttons)", () => {
    expect(JSON.stringify(sampleResumeData)).not.toMatch(/credentialUrl|"link"|"links"|"url"/);
  });
});