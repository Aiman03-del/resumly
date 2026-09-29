import { describe, expect, it } from "vitest";
import { friendlyLoginError, GENERIC_LOGIN_ERROR } from "./auth-errors";

describe("friendlyLoginError", () => {
  it("maps known auth codes", () => {
    expect(friendlyLoginError({ code: "invalid_credentials" })).toMatch(/incorrect email or password/i);
    expect(friendlyLoginError({ code: "email_not_confirmed" })).toMatch(/confirm your email/i);
    expect(friendlyLoginError({ code: "over_request_rate_limit" })).toMatch(/too many attempts/i);
    expect(friendlyLoginError({ status: 429 })).toMatch(/too many attempts/i);
  });

  it("understands older errors that only have a message", () => {
    expect(friendlyLoginError({ message: "Invalid login credentials" })).toMatch(/incorrect email or password/i);
    expect(friendlyLoginError({ message: "Email not confirmed" })).toMatch(/confirm your email/i);
  });

  it("never leaks technical messages", () => {
    const text = friendlyLoginError({
      code: "unexpected_failure",
      status: 500,
      message: 'duplicate key value violates unique constraint "users_pkey"',
    });
    expect(text).toBe(GENERIC_LOGIN_ERROR);
    expect(friendlyLoginError(null)).toBe(GENERIC_LOGIN_ERROR);
  });
});
