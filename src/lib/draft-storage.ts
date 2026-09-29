/**
 * Local draft recovery for the resume builder.
 *
 * Every edit is auto-saved to Supabase, but a save can fail (offline, expired
 * session) or the tab can close mid-request. Until the server confirms a save,
 * the pending column updates are mirrored to localStorage so they can be
 * restored on the next visit.
 */

export type DraftUpdates = Record<string, unknown>;

type StoredDraft = { savedAt: number; updates: DraftUpdates };

const PREFIX = "resumly:draft:";
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

/** ResumeFormData key -> database column. */
export const FIELD_COLUMNS = {
  personalInfo: "personal_info",
  summary: "summary",
  experience: "experience",
  education: "education",
  skills: "skills",
  projects: "projects",
  certifications: "certifications",
  languages: "languages",
  achievements: "achievements",
  awards: "awards",
  publications: "publications",
  courses: "courses",
} as const;

export type FieldKey = keyof typeof FIELD_COLUMNS;

const COLUMN_TO_FIELD = Object.fromEntries(
  Object.entries(FIELD_COLUMNS).map(([field, column]) => [column, field]),
) as Record<string, FieldKey>;

export function fieldForColumn(column: string): FieldKey | undefined {
  return COLUMN_TO_FIELD[column];
}

/** Empty value used when undoing back to a state where a field did not exist yet. */
export function emptyColumnValue(field: FieldKey): unknown {
  if (field === "personalInfo") return {};
  if (field === "summary") return "";
  return [];
}

const draftKey = (resumeId: string | null | undefined) => `${PREFIX}${resumeId ?? "new"}`;

function storage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

/** Keeps only known columns with the right shape, so a corrupted draft can never break the editor. */
export function sanitizeDraftUpdates(input: unknown): DraftUpdates {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {};
  const clean: DraftUpdates = {};
  for (const [column, value] of Object.entries(input as Record<string, unknown>)) {
    const field = fieldForColumn(column);
    if (!field) continue;
    if (field === "summary" && typeof value === "string") clean[column] = value;
    else if (field === "personalInfo" && value && typeof value === "object" && !Array.isArray(value)) clean[column] = value;
    else if (field !== "summary" && field !== "personalInfo" && Array.isArray(value)) clean[column] = value;
  }
  return clean;
}

export function saveDraft(resumeId: string | null | undefined, updates: DraftUpdates) {
  const store = storage();
  if (!store) return;
  try {
    if (Object.keys(updates).length === 0) {
      store.removeItem(draftKey(resumeId));
      return;
    }
    const draft: StoredDraft = { savedAt: Date.now(), updates };
    store.setItem(draftKey(resumeId), JSON.stringify(draft));
  } catch {
    // Storage full or blocked (private mode): drafts are best-effort.
  }
}

export function loadDraft(resumeId: string | null | undefined): StoredDraft | null {
  const store = storage();
  if (!store) return null;
  try {
    const raw = store.getItem(draftKey(resumeId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredDraft>;
    const updates = sanitizeDraftUpdates(parsed.updates);
    const savedAt = typeof parsed.savedAt === "number" ? parsed.savedAt : 0;
    if (Object.keys(updates).length === 0 || Date.now() - savedAt > MAX_AGE_MS) {
      store.removeItem(draftKey(resumeId));
      return null;
    }
    return { savedAt, updates };
  } catch {
    return null;
  }
}

export function clearDraft(resumeId: string | null | undefined) {
  try {
    storage()?.removeItem(draftKey(resumeId));
  } catch {
    // ignore
  }
}

const summaryText = (value: unknown) =>
  typeof value === "string" ? value : (value as { text?: unknown } | null | undefined)?.text ?? "";

/** Returns only the draft columns that differ from what the server has. */
export function draftChangesAgainst(updates: DraftUpdates, row: Record<string, unknown>): DraftUpdates {
  const changed: DraftUpdates = {};
  for (const [column, value] of Object.entries(updates)) {
    const saved = column === "summary" ? summaryText(row[column]) : row[column];
    if (JSON.stringify(saved ?? null) !== JSON.stringify(value ?? null)) changed[column] = value;
  }
  return changed;
}

/**
 * After the server confirms a save, drop those columns from the unsaved set,
 * unless the value changed again while the request was in flight.
 */
export function dropConfirmedUpdates(unsaved: DraftUpdates, confirmed: DraftUpdates): DraftUpdates {
  const remaining = { ...unsaved };
  for (const [column, value] of Object.entries(confirmed)) {
    if (remaining[column] === value) delete remaining[column];
  }
  return remaining;
}