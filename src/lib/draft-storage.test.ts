import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearDraft,
  draftChangesAgainst,
  emptyColumnValue,
  fieldForColumn,
  loadDraft,
  sanitizeDraftUpdates,
  saveDraft,
} from "./draft-storage";

describe("draft storage", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  it("keeps only known columns with their expected value shapes", () => {
    expect(sanitizeDraftUpdates({
      summary: "Draft",
      personal_info: { fullName: "Ada" },
      skills: ["TS"],
      experience: "invalid",
      secret: "ignored",
    })).toEqual({
      summary: "Draft",
      personal_info: { fullName: "Ada" },
      skills: ["TS"],
    });
  });

  it("maps columns and provides correct empty values", () => {
    expect(fieldForColumn("personal_info")).toBe("personalInfo");
    expect(fieldForColumn("not_a_column")).toBeUndefined();
    expect(emptyColumnValue("personalInfo")).toEqual({});
    expect(emptyColumnValue("summary")).toBe("");
    expect(emptyColumnValue("skills")).toEqual([]);
  });

  it("saves, loads and clears drafts per resume", () => {
    saveDraft("resume-1", { summary: "Local draft" });
    expect(loadDraft("resume-1")?.updates).toEqual({ summary: "Local draft" });
    expect(loadDraft("resume-2")).toBeNull();
    clearDraft("resume-1");
    expect(loadDraft("resume-1")).toBeNull();
  });

  it("removes expired and empty drafts", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    saveDraft("old", { summary: "Expired" });
    vi.advanceTimersByTime(31 * 24 * 60 * 60 * 1000);
    expect(loadDraft("old")).toBeNull();

    saveDraft("empty", {});
    expect(loadDraft("empty")).toBeNull();
  });

  it("compares draft columns against saved values, including legacy object summaries", () => {
    expect(draftChangesAgainst(
      { summary: "Updated", skills: ["TypeScript"] },
      { summary: { text: "Saved" }, skills: ["TypeScript"] },
    )).toEqual({ summary: "Updated" });
    expect(draftChangesAgainst({ summary: "Saved" }, { summary: "Saved" })).toEqual({});
  });
});