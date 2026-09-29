// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({ getUser: vi.fn() }));

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => ({ auth: { getUser: mocks.getUser } })),
}));

import { proxy } from "./proxy";

const call = (path: string) => proxy(new NextRequest(`http://localhost${path}`));
const loggedOut = () => mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });
const loggedIn = () => mocks.getUser.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });

describe("proxy: login redirect", () => {
  beforeEach(() => mocks.getUser.mockReset());

  it.each(["/dashboard", "/builder/new", "/preview/abc", "/account"])(
    "sends logged-out visitors from %s to /login and remembers the page",
    async (path) => {
      loggedOut();
      const res = await call(path);
      expect(res.status).toBe(307);
      const location = new URL(res.headers.get("location")!);
      expect(location.pathname).toBe("/login");
      expect(location.searchParams.get("redirectTo")).toBe(path);
    },
  );

  it("treats an expired session (token refresh failed) like logged out", async () => {
    mocks.getUser.mockResolvedValue({
      data: { user: null },
      error: { code: "session_expired", status: 401, message: "Session expired" },
    });
    const res = await call("/dashboard");
    expect(new URL(res.headers.get("location")!).pathname).toBe("/login");
  });

  it("keeps logged-in users out of /login and /signup", async () => {
    loggedIn();
    for (const path of ["/login", "/signup"]) {
      const res = await call(path);
      expect(new URL(res.headers.get("location")!).pathname).toBe("/dashboard");
    }
  });

  it("lets logged-in users through to protected pages", async () => {
    loggedIn();
    const res = await call("/dashboard");
    expect(res.headers.get("location")).toBeNull();
  });

  it("leaves public pages alone, even logged out", async () => {
    loggedOut();
    for (const path of ["/", "/pricing", "/r/abcdefgh1234", "/login"]) {
      const res = await call(path);
      expect(res.headers.get("location")).toBeNull();
    }
  });
});
