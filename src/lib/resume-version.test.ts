import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  MAX_RESUMES_PER_USER,
  MAX_TITLE_LENGTH,
  buildVersionInsert,
  cleanTitle,
  duplicateResume,
  renameResume,
  suggestCopyTitle,
  versionLabel,
} from "./resume-version";

describe("cleanTitle", () => {
  it("trims, collapses whitespace and caps the length", () => {
    expect(cleanTitle("  Frontend   Developer  CV ")).toBe("Frontend Developer CV");
    expect(cleanTitle("a".repeat(200))).toHaveLength(MAX_TITLE_LENGTH);
  });
});

describe("versionLabel", () => {
  it("prefers a custom title", () => {
    expect(versionLabel("Internship CV", "Ada Lovelace")).toBe("Internship CV");
  });

  it("falls back to the person's name for the default title", () => {
    expect(versionLabel("Untitled Resume", "Ada Lovelace")).toBe("Ada Lovelace");
    expect(versionLabel(null, "Ada Lovelace")).toBe("Ada Lovelace");
  });

  it("falls back to the default title when nothing is available", () => {
    expect(versionLabel(undefined, "  ")).toBe("Untitled Resume");
  });
});

describe("suggestCopyTitle", () => {
  it("appends (copy) and stays within the length limit", () => {
    expect(suggestCopyTitle("Frontend CV")).toBe("Frontend CV (copy)");
    expect(suggestCopyTitle("x".repeat(200)).length).toBeLessThanOrEqual(MAX_TITLE_LENGTH);
    expect(suggestCopyTitle("x".repeat(200)).endsWith("(copy)")).toBe(true);
  });
});

describe("buildVersionInsert", () => {
  const source = {
    id: "old-id",
    user_id: "someone-else",
    title: "Old title",
    created_at: "2026-01-01",
    updated_at: "2026-01-02",
    is_public: true,
    share_id: "public-token",
    status: "polished",
    personal_info: { fullName: "Ada" },
    skills: ["TypeScript"],
    template_id: "modern",
    theme_color: null,
  };

  it("copies content columns and sets the new owner and title", () => {
    const insert = buildVersionInsert(source, "user-1", "  Full-Stack CV ");
    expect(insert).toMatchObject({
      user_id: "user-1",
      title: "Full-Stack CV",
      personal_info: { fullName: "Ada" },
      skills: ["TypeScript"],
      template_id: "modern",
      theme_color: null,
    });
  });

  it("never copies ids, timestamps, or sharing fields", () => {
    const insert = buildVersionInsert(source, "user-1", "Copy");
    for (const key of ["id", "created_at", "updated_at", "is_public", "share_id", "status"]) {
      expect(insert).not.toHaveProperty(key);
    }
  });

  it("skips columns that do not exist on the source row", () => {
    const insert = buildVersionInsert({ summary: "Hi" }, "user-1", "Copy");
    expect(Object.keys(insert).sort()).toEqual(["summary", "title", "user_id"]);
  });

  it("uses the default title when the given one is empty", () => {
    expect(buildVersionInsert({}, "user-1", "   ").title).toBe("Untitled Resume");
  });
});

type Result = { data?: unknown; error?: { message: string } | null; count?: number | null };

/** A chainable stand-in for the Supabase query builder. */
function builder(result: Result) {
  const chain: Record<string, unknown> = {};
  for (const method of ["select", "eq", "is", "insert", "update"]) chain[method] = vi.fn(() => chain);
  chain.single = vi.fn(() => Promise.resolve(result));
  chain.then = (resolve: (value: Result) => unknown) => Promise.resolve(result).then(resolve);
  return chain;
}

function fakeClient(options: { user?: { id: string } | null; queries: Result[] }) {
  const from = vi.fn();
  options.queries.forEach((result) => from.mockReturnValueOnce(builder(result)));
  const client = {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: options.user ?? null } }) },
    from,
  };
  return { client: client as unknown as SupabaseClient, from };
}

describe("duplicateResume", () => {
  it("creates a copy and returns the new id", async () => {
    const { client, from } = fakeClient({
      user: { id: "u1" },
      queries: [
        { count: 2, error: null },
        { data: { id: "src", personal_info: { fullName: "Ada" } }, error: null },
        { data: { id: "new-id" }, error: null },
      ],
    });
    await expect(duplicateResume(client, "src", "Backend CV")).resolves.toBe("new-id");
    expect(from).toHaveBeenCalledTimes(3);
  });

  it("rejects when logged out", async () => {
    const { client } = fakeClient({ user: null, queries: [] });
    await expect(duplicateResume(client, "src", "Copy")).rejects.toThrow(/logged in/i);
  });

  it("rejects once the resume limit is reached", async () => {
    const { client, from } = fakeClient({
      user: { id: "u1" },
      queries: [{ count: MAX_RESUMES_PER_USER, error: null }],
    });
    await expect(duplicateResume(client, "src", "Copy")).rejects.toThrow(/limit/i);
    expect(from).toHaveBeenCalledTimes(1);
  });

  it("rejects when the source resume cannot be loaded", async () => {
    const { client } = fakeClient({
      user: { id: "u1" },
      queries: [{ count: 1, error: null }, { data: null, error: { message: "not found" } }],
    });
    await expect(duplicateResume(client, "src", "Copy")).rejects.toThrow("not found");
  });
});

describe("renameResume", () => {
  it("saves the cleaned title", async () => {
    const { client } = fakeClient({ user: { id: "u1" }, queries: [{ error: null }] });
    await expect(renameResume(client, "id", "  New   name ")).resolves.toBe("New name");
  });

  it("rejects an empty name without calling the database", async () => {
    const { client, from } = fakeClient({ user: { id: "u1" }, queries: [] });
    await expect(renameResume(client, "id", "   ")).rejects.toThrow(/name/i);
    expect(from).not.toHaveBeenCalled();
  });

  it("surfaces database errors", async () => {
    const { client } = fakeClient({ user: { id: "u1" }, queries: [{ error: { message: "denied" } }] });
    await expect(renameResume(client, "id", "Name")).rejects.toThrow("denied");
  });
});