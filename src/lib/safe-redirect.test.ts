import { describe, expect, it } from "vitest";
import { safeRedirect } from "./safe-redirect";

describe("safeRedirect", () => {
  it("keeps same-site paths, including query strings", () => {
    expect(safeRedirect("/dashboard")).toBe("/dashboard");
    expect(safeRedirect("/preview/abc?tab=1")).toBe("/preview/abc?tab=1");
  });

  it.each([
    ["missing", null],
    ["empty", ""],
    ["absolute URL", "https://evil.com"],
    ["protocol-relative", "//evil.com"],
    ["backslash trick", "/\\evil.com"],
    ["tab trick", "/\t/evil.com"],
    ["newline", "/dash\nboard"],
    ["no leading slash", "dashboard"],
  ])("falls back for %s", (_label, value) => {
    expect(safeRedirect(value)).toBe("/dashboard");
  });

  it("uses a custom fallback", () => {
    expect(safeRedirect("//x.com", "/home")).toBe("/home");
  });
});
