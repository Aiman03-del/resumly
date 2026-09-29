// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({ signIn: vi.fn() }));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ auth: { signInWithPassword: mocks.signIn } })),
}));

import { POST } from "./route";

const req = (body: unknown) =>
  new NextRequest("http://localhost/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

const creds = { email: "person@example.com", password: "hunter2-hunter2" };

describe("POST /api/auth/login", () => {
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    mocks.signIn.mockReset();
    logSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("signs in and returns ok", async () => {
    mocks.signIn.mockResolvedValue({ error: null });
    const res = await POST(req(creds));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(mocks.signIn).toHaveBeenCalledWith(creds);
  });

  it("returns a friendly 401 for wrong credentials", async () => {
    mocks.signIn.mockResolvedValue({
      error: { code: "invalid_credentials", status: 400, message: "Invalid login credentials" },
    });
    const res = await POST(req(creds));
    expect(res.status).toBe(401);
    expect((await res.json()).error).toMatch(/incorrect email or password/i);
  });

  it("hides technical errors from the user but logs code/status on the server", async () => {
    mocks.signIn.mockResolvedValue({
      error: { code: "unexpected_failure", status: 500, message: 'relation "auth.users" does not exist' },
    });
    const res = await POST(req(creds));
    const text = JSON.stringify(await res.json());
    expect(res.status).toBe(503);
    expect(text).not.toContain("auth.users");

    const logged = JSON.stringify(logSpy.mock.calls);
    expect(logged).toContain("unexpected_failure");
    expect(logged).not.toContain(creds.email);
    expect(logged).not.toContain(creds.password);
  });

  it("passes rate limiting through as 429", async () => {
    mocks.signIn.mockResolvedValue({ error: { code: "over_request_rate_limit", status: 429, message: "x" } });
    const res = await POST(req(creds));
    expect(res.status).toBe(429);
  });

  it("rejects malformed bodies without calling Supabase", async () => {
    for (const bad of ["not json", {}, { email: "nope", password: "x" }, { email: creds.email, password: "" }]) {
      const res = await POST(req(bad));
      expect(res.status).toBe(400);
    }
    expect(mocks.signIn).not.toHaveBeenCalled();
  });

  it("returns 503 when the auth call throws", async () => {
    mocks.signIn.mockRejectedValue(new Error("socket hang up"));
    const res = await POST(req(creds));
    expect(res.status).toBe(503);
    expect(JSON.stringify(await res.json())).not.toContain("socket");
  });
});
