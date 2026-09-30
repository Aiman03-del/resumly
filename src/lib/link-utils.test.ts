import { describe, expect, it } from "vitest";
import { displayUrl, toHref } from "./link-utils";

describe("toHref", () => {
  it("adds https to bare domains and preserves supported schemes", () => {
    expect(toHref(" github.com/me ")).toBe("https://github.com/me");
    expect(toHref("https://github.com/me")).toBe("https://github.com/me");
    expect(toHref("mailto:me@example.com")).toBe("mailto:me@example.com");
    expect(toHref("tel:+15551234567")).toBe("tel:+15551234567");
  });

  it("drops unsafe schemes and empty values", () => {
    expect(toHref("javascript:alert(1)")).toBe("");
    expect(toHref("data:text/html,unsafe")).toBe("");
    expect(toHref("vbscript:unsafe")).toBe("");
    expect(toHref("  ")).toBe("");
    expect(toHref(null)).toBe("");
  });
});

describe("displayUrl", () => {
  it("removes the protocol and one trailing slash", () => {
    expect(displayUrl(" https://github.com/me/ ")).toBe("github.com/me");
    expect(displayUrl("http://github.com/me")).toBe("github.com/me");
  });
});