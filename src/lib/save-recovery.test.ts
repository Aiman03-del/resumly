import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearDraft,
  draftChangesAgainst,
  dropConfirmedUpdates,
  loadDraft,
  saveDraft,
} from "./draft-storage";

describe("save failure and recovery", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("a save that never reaches the server leaves a draft that offers only the differing columns", () => {
    const unsaved = { summary: "New summary", skills: ["TypeScript"] };
    saveDraft("r1", unsaved);

    const draft = loadDraft("r1")!;
    const differing = draftChangesAgainst(draft.updates, { summary: "Old summary", skills: ["TypeScript"] });
    expect(differing).toEqual({ summary: "New summary" });
  });

  it("if the server already has everything, nothing is offered", () => {
    saveDraft("r1", { summary: "Same" });
    const draft = loadDraft("r1")!;
    expect(draftChangesAgainst(draft.updates, { summary: "Same" })).toEqual({});
  });

  it("a confirmed save removes those columns from the draft", () => {
    const summary = "Saved text";
    const unsaved = { summary, skills: ["A"] };
    const remaining = dropConfirmedUpdates(unsaved, { summary });
    expect(remaining).toEqual({ skills: ["A"] });

    saveDraft("r1", remaining);
    expect(loadDraft("r1")?.updates).toEqual({ skills: ["A"] });

    saveDraft("r1", dropConfirmedUpdates(remaining, { skills: remaining.skills }));
    expect(loadDraft("r1")).toBeNull();
  });

  it("keeps text typed while the save request was still in flight", () => {
    const sent = { personal_info: { fullName: "Ada" } };
    const typedMeanwhile = { personal_info: { fullName: "Ada Lovelace" } };
    expect(dropConfirmedUpdates(typedMeanwhile, sent)).toEqual(typedMeanwhile);
  });

  it("does not mutate the object it was given", () => {
    const unsaved = { summary: "x" };
    dropConfirmedUpdates(unsaved, { summary: unsaved.summary });
    expect(unsaved).toEqual({ summary: "x" });
  });

  it("survives blocked or full browser storage without throwing", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("QuotaExceededError");
    });
    expect(() => saveDraft("r1", { summary: "x" })).not.toThrow();
  });

  it("ignores a corrupted draft instead of crashing the editor", () => {
    localStorage.setItem("resumly:draft:r1", "{not json");
    expect(loadDraft("r1")).toBeNull();
    localStorage.setItem("resumly:draft:r2", JSON.stringify({ savedAt: Date.now(), updates: { secret: "x" } }));
    expect(loadDraft("r2")).toBeNull();
  });

  it("discarding removes the draft for that resume only", () => {
    saveDraft("r1", { summary: "a" });
    saveDraft("r2", { summary: "b" });
    clearDraft("r1");
    expect(loadDraft("r1")).toBeNull();
    expect(loadDraft("r2")?.updates).toEqual({ summary: "b" });
  });
});
