import { describe, expect, it } from "vitest";
import {
  atsFriendlyCheck,
  estimatePages,
  fontScaleStyle,
  normalizeFontScale,
  normalizePageTarget,
  pageHeightPx,
} from "./page-settings";

describe("page settings normalization", () => {
  it("normalizes target page count", () => {
    expect(normalizePageTarget("1")).toBe("1");
    expect(normalizePageTarget("2")).toBe("2");
    expect(normalizePageTarget("3")).toBe("auto");
  });

  it("clamps and rounds font scale to supported increments", () => {
    expect(normalizeFontScale(0.1)).toBe(0.8);
    expect(normalizeFontScale(1.13)).toBe(1.15);
    expect(normalizeFontScale(4)).toBe(1.2);
    expect(normalizeFontScale(Number.NaN)).toBe(1);
    expect(fontScaleStyle(1)).toEqual({});
    expect((fontScaleStyle(0.9) as Record<string, string>)["--text-base"]).toBe("0.9000rem");
  });
});

describe("page height estimates", () => {
  it("uses no page margins for full-bleed templates", () => {
    expect(pageHeightPx("bold")).toBeCloseTo((800 * 297) / 210);
    expect(pageHeightPx("modern")).toBeLessThan(pageHeightPx("bold"));
  });

  it("estimates one or more pages from content height", () => {
    expect(estimatePages(0, "modern")).toBe(1);
    expect(estimatePages(100, "modern")).toBe(1);
    expect(estimatePages(pageHeightPx("modern") * 2 + 100, "modern")).toBe(3);
  });
});

describe("atsFriendlyCheck", () => {
  const base = { templateId: "modern", fontScale: 1, hasPhoto: false, hasContact: true, pages: 1 };

  it("returns good for a single-column readable resume with contact details", () => {
    expect(atsFriendlyCheck(base).level).toBe("good");
  });

  it("marks multi-column templates as risk", () => {
    expect(atsFriendlyCheck({ ...base, templateId: "compact" }).level).toBe("risk");
  });

  it("warns for small type, photos, missing contact details, and long resumes", () => {
    const result = atsFriendlyCheck({ ...base, fontScale: 0.85, hasPhoto: true, hasContact: false, pages: 3 });
    expect(result.level).toBe("warn");
    expect(result.items).toHaveLength(5);
    expect(result.items.filter((item) => item.status === "warn")).toHaveLength(4);
  });
});