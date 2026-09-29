// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  maybeSingle: vi.fn(),
  eq: vi.fn(),
  select: vi.fn(),
  from: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
  redirect: (url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  },
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ auth: { getUser: mocks.getUser }, from: mocks.from })),
}));

vi.mock("./preview-client", () => ({ PreviewClient: () => null }));

import PreviewPage from "./page";

const ID = "3f2b8c1e-5d4a-4b6f-9a7e-1c2d3e4f5a6b";
const params = (resumeId: string) => ({ params: Promise.resolve({ resumeId }) });

beforeEach(() => {
  vi.clearAllMocks();
  const chain = { eq: mocks.eq, maybeSingle: mocks.maybeSingle };
  mocks.eq.mockReturnValue(chain);
  mocks.select.mockReturnValue(chain);
  mocks.from.mockReturnValue({ select: mocks.select });
  mocks.getUser.mockResolvedValue({ data: { user: { id: "user-a" } } });
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("preview page access control", () => {
  it("returns 404 for ids that are not UUIDs, without touching the database", async () => {
    await expect(PreviewPage(params("../../etc/passwd"))).rejects.toThrow("NEXT_NOT_FOUND");
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it("redirects logged-out visitors to login and brings them back afterwards", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } });
    await expect(PreviewPage(params(ID))).rejects.toThrow(
      `NEXT_REDIRECT:/login?redirectTo=${encodeURIComponent(`/preview/${ID}`)}`,
    );
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it("only queries rows owned by the signed-in user", async () => {
    mocks.maybeSingle.mockResolvedValue({ data: { personal_info: { fullName: "Ada" } }, error: null });
    await PreviewPage(params(ID));
    expect(mocks.eq).toHaveBeenCalledWith("id", ID);
    expect(mocks.eq).toHaveBeenCalledWith("user_id", "user-a");
  });

  it("gives another user's resume the same 404 as a missing one", async () => {
    mocks.maybeSingle.mockResolvedValue({ data: null, error: null });
    await expect(PreviewPage(params(ID))).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("surfaces database errors as errors, not as 'not found'", async () => {
    mocks.maybeSingle.mockResolvedValue({ data: null, error: { code: "PGRST301", message: "secret detail" } });
    const failure = PreviewPage(params(ID));
    await expect(failure).rejects.toThrow("Could not load this resume.");
    await expect(failure).rejects.not.toThrow("secret detail");
  });

  it("does not hand ownership or sharing columns to the client component", async () => {
    mocks.maybeSingle.mockResolvedValue({
      data: {
        user_id: "user-a",
        share_id: "abcdefgh1234",
        is_public: true,
        personal_info: { fullName: "Ada", email: "a@x.com", phone: "1" },
        template_id: "classic",
      },
      error: null,
    });
    const element = (await PreviewPage(params(ID))) as { props: Record<string, unknown> };
    expect(Object.keys(element.props).sort()).toEqual(["accentColor", "data", "resumeId", "templateId"]);
    expect(JSON.stringify(element.props)).not.toContain("abcdefgh1234");
    expect(element.props.templateId).toBe("classic");
  });
});
