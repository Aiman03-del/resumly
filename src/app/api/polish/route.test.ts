// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import OpenAI from "openai";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  rpc: vi.fn(),
  create: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mocks.getUser },
    rpc: mocks.rpc,
  })),
}));

vi.mock("@/lib/api-error", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api-error")>();
  return {
    ...actual,
    createGroqClient: () => ({ chat: { completions: { create: mocks.create } } }),
  };
});

import { POST } from "./route";

function makeReq(
  body: unknown,
  headers: Record<string, string> = { "content-type": "application/json" },
) {
  return new NextRequest("http://localhost/api/polish", {
    method: "POST",
    headers,
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

const validBody = {
  section: "experience-description",
  content: "built dashboards with react",
  context: { role: "Frontend Dev", company: "Acme" },
};

function aiReturns(text: string | null) {
  mocks.create.mockResolvedValue({ choices: [{ message: { content: text } }] });
}

describe("POST /api/polish", () => {
  beforeEach(() => {
    vi.stubEnv("GROQ_API_KEY", "test-key");
    mocks.getUser.mockResolvedValue({
      data: { user: { id: `user-${crypto.randomUUID()}` } },
      error: null,
    });
    mocks.rpc.mockResolvedValue({ data: 1, error: null });
    aiReturns("Polished text.");
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it("returns 401 when no user is present", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });
    const res = await POST(makeReq(validBody));
    expect(res.status).toBe(401);
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("returns 401 when authentication fails", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: new Error("jwt expired") });
    const res = await POST(makeReq(validBody));
    expect(res.status).toBe(401);
  });

  it("returns 415 for a non-JSON content type", async () => {
    const res = await POST(makeReq("hello", { "content-type": "text/plain" }));
    expect(res.status).toBe(415);
  });

  it("returns 400 for malformed JSON", async () => {
    const res = await POST(makeReq("{not json"));
    expect(res.status).toBe(400);
  });

  it("returns 413 when the body is too large", async () => {
    const res = await POST(makeReq({ ...validBody, content: "a".repeat(600 * 1024) }));
    expect(res.status).toBe(413);
  });

  it("returns 400 for an invalid section", async () => {
    const res = await POST(makeReq({ ...validBody, section: "bad section!" }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("Invalid section");
  });

  it("returns 400 for empty or whitespace-only content", async () => {
    const res = await POST(makeReq({ ...validBody, content: "   " }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when content exceeds the maximum length", async () => {
    const res = await POST(makeReq({ ...validBody, content: "a".repeat(10_001) }));
    expect(res.status).toBe(400);
  });

  it("does not consume quota for invalid requests", async () => {
    await POST(makeReq({ ...validBody, content: "" }));
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it("returns 503 when GROQ_API_KEY is missing", async () => {
    vi.stubEnv("GROQ_API_KEY", "");
    const res = await POST(makeReq(validBody));
    expect(res.status).toBe(503);
  });

  it("returns 429 with Retry-After after the burst limit", async () => {
    for (let i = 0; i < 15; i += 1) {
      expect((await POST(makeReq(validBody))).status).toBe(200);
    }
    const res = await POST(makeReq(validBody));
    expect(res.status).toBe(429);
    expect(Number(res.headers.get("Retry-After"))).toBeGreaterThan(0);
  });

  it("does not call quota RPC or AI when burst limited", async () => {
    for (let i = 0; i < 15; i += 1) await POST(makeReq(validBody));
    mocks.rpc.mockClear();
    mocks.create.mockClear();
    await POST(makeReq(validBody));
    expect(mocks.rpc).not.toHaveBeenCalled();
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("returns 429 and skips AI when the daily quota is exceeded", async () => {
    mocks.rpc
      .mockResolvedValueOnce({ data: 101, error: null })
      .mockResolvedValueOnce({ data: false, error: null });
    const res = await POST(makeReq(validBody));
    expect(res.status).toBe(429);
    expect((await res.json()).error).toMatch(/today's limit/i);
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("spends a purchased credit after the daily free quota", async () => {
    mocks.rpc
      .mockResolvedValueOnce({ data: 101, error: null })
      .mockResolvedValueOnce({ data: true, error: null });
    const res = await POST(makeReq(validBody));
    expect(res.status).toBe(200);
    expect(mocks.rpc).toHaveBeenNthCalledWith(2, "consume_credit");
    expect(mocks.create).toHaveBeenCalled();
  });

  it("allows the 100th request", async () => {
    mocks.rpc.mockResolvedValue({ data: 100, error: null });
    expect((await POST(makeReq(validBody))).status).toBe(200);
  });

  it("fails closed with 503 when quota verification fails", async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { message: "db down" } });
    const res = await POST(makeReq(validBody));
    expect(res.status).toBe(503);
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("increments quota for the polish route", async () => {
    await POST(makeReq(validBody));
    expect(mocks.rpc).toHaveBeenCalledWith("increment_api_usage", { p_route: "polish" });
  });

  it("returns polished text", async () => {
    const res = await POST(makeReq(validBody));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ polished: "Polished text." });
  });

  it("includes role/company in the experience prompt and uses max_tokens=500", async () => {
    await POST(makeReq(validBody));
    const args = mocks.create.mock.calls[0][0];
    expect(args.max_tokens).toBe(500);
    expect(args.messages[0].content).toContain("Frontend Dev");
    expect(args.messages[0].content).toContain("Acme");
  });

  it("uses max_tokens=400 and includes experience/project context for summaries", async () => {
    await POST(makeReq({
      section: "summary",
      content: "draft",
      context: {
        role: "Engineer",
        experience: [{ role: "Dev", company: "X", description: "did stuff" }],
        projects: [{ name: "Resumly", description: "resume builder" }],
      },
    }));
    const args = mocks.create.mock.calls[0][0];
    expect(args.max_tokens).toBe(400);
    expect(args.messages[0].content).toContain("Dev at X: did stuff");
    expect(args.messages[0].content).toContain("Resumly: resume builder");
  });

  it("truncates long context roles to 150 characters", async () => {
    await POST(makeReq({ ...validBody, context: { role: "R".repeat(500), company: "C" } }));
    const prompt: string = mocks.create.mock.calls[0][0].messages[0].content;
    expect(prompt).toContain("R".repeat(150));
    expect(prompt).not.toContain("R".repeat(151));
  });

  it("returns 502 when AI returns empty content", async () => {
    aiReturns("   ");
    expect((await POST(makeReq(validBody))).status).toBe(502);
  });

  it("returns 502 when AI returns null content", async () => {
    aiReturns(null);
    expect((await POST(makeReq(validBody))).status).toBe(502);
  });

  it("maps AI connection errors to 502 without exposing details", async () => {
    mocks.create.mockRejectedValue(new OpenAI.APIConnectionError({ message: "ECONNREFUSED secret-host" }));
    const res = await POST(makeReq(validBody));
    const json = await res.json();
    expect(res.status).toBe(502);
    expect(JSON.stringify(json)).not.toContain("secret-host");
    expect(json.requestId).toBeTruthy();
  });

  it("returns a generic 500 message for unknown errors", async () => {
    mocks.create.mockRejectedValue(new Error("boom"));
    const res = await POST(makeReq(validBody));
    expect(res.status).toBe(500);
    expect((await res.json()).error).toBe("Something went wrong while polishing the text.");
  });
});