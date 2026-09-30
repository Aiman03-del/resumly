import { describe, expect, it } from "vitest";
import { getPasswordStrength } from "./password-strength";

describe("getPasswordStrength", () => {
  it("is empty for an empty password", () => {
    const result = getPasswordStrength("");
    expect(result.level).toBe("empty");
    expect(result.percent).toBe(0);
    expect(result.isStrong).toBe(false);
  });

  it("progresses as rules are satisfied", () => {
    expect(getPasswordStrength("abcdefgh").level).toBe("weak");
    expect(getPasswordStrength("Abcdefgh").level).toBe("fair");
    expect(getPasswordStrength("Abcdefg1").level).toBe("good");
    expect(getPasswordStrength("Abcdef1!").level).toBe("strong");
  });

  it("only accepts a password that meets every rule", () => {
    expect(getPasswordStrength("Abcdefg1").isStrong).toBe(false);
    expect(getPasswordStrength("Abcdef1!").isStrong).toBe(true);
  });

  it("does not count whitespace as a symbol", () => {
    expect(getPasswordStrength("Abcdef1 ").isStrong).toBe(false);
  });
});