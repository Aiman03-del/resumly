import { describe, expect, it } from "vitest";
import { estimatePages, pageHeightPx } from "./page-settings";

describe("page overflow boundaries", () => {
  const page = pageHeightPx("modern");

  it("content that exactly fills a page (with the 4px tolerance) stays on one page", () => {
    expect(estimatePages(page, "modern")).toBe(1);
    expect(estimatePages(page + 4, "modern")).toBe(1);
  });

  it("one pixel beyond the tolerance spills onto page 2", () => {
    expect(estimatePages(page + 5, "modern")).toBe(2);
  });

  it("the same boundary repeats for page 3", () => {
    expect(estimatePages(page * 2 + 4, "modern")).toBe(2);
    expect(estimatePages(page * 2 + 5, "modern")).toBe(3);
  });

  it("full-bleed templates fit more per page (no print margin), so they overflow later", () => {
    const height = page + 50;
    expect(estimatePages(height, "modern")).toBe(2);
    expect(estimatePages(height, "bold")).toBe(1);
    expect(estimatePages(height, "creative")).toBe(1);
    expect(estimatePages(height, "sidebar-pro")).toBe(1);
  });

  it("empty or not-yet-measured content counts as one page", () => {
    expect(estimatePages(0, "modern")).toBe(1);
    expect(estimatePages(-10, "modern")).toBe(1);
  });
});
