import { describe, expect, it } from "vitest";
import { joinContact } from "./contact-line";

describe("joinContact", () => {
  it("joins with the separator", () => {
    expect(joinContact(["a@b.com", "123"])).toBe("a@b.com · 123");
  });

  it("skips empty parts so no separator dangles", () => {
    expect(joinContact(["", "123"])).toBe("123");
    expect(joinContact(["a@b.com", undefined, "  "])).toBe("a@b.com");
    expect(joinContact(["", ""])).toBe("");
  });

  it("supports a custom separator", () => {
    expect(joinContact(["a", "b"], " | ")).toBe("a | b");
  });
});