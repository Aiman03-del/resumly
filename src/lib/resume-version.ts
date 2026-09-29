import type { SupabaseClient } from "@supabase/supabase-js";

export const DEFAULT_TITLE = "Untitled Resume";
export const MAX_TITLE_LENGTH = 80;
export const MAX_RESUMES_PER_USER = 30;

/**
 * Columns copied into a new version. This is an allow-list on purpose:
 * id, created_at, updated_at, is_public and share_id must never be copied,
 * otherwise a private copy could inherit a public share link.
 */
const COPIED_COLUMNS = [
  "personal_info",
  "summary",
  "experience",
  "education",
  "skills",
  "projects",
  "certifications",
  "languages",
  "achievements",
  "awards",
  "publications",
  "courses",
  "template_id",
  "accent_color",
  "theme_color",
  "section_order",
] as const;

export function cleanTitle(input: string): string {
  return input.replace(/\s+/g, " ").trim().slice(0, MAX_TITLE_LENGTH);
}

/** The name shown on a resume card: the saved title, or the person's name for untitled resumes. */
export function versionLabel(title: unknown, fullName: unknown): string {
  const savedTitle = typeof title === "string" ? title.trim() : "";
  if (savedTitle && savedTitle !== DEFAULT_TITLE) return savedTitle;
  const name = typeof fullName === "string" ? fullName.trim() : "";
  return name || DEFAULT_TITLE;
}

export function suggestCopyTitle(label: string): string {
  const suffix = " (copy)";
  return label.slice(0, MAX_TITLE_LENGTH - suffix.length).trimEnd() + suffix;
}

/** Builds the row to insert for a new version. Only columns that exist on the source row are copied. */
export function buildVersionInsert(
  source: Record<string, unknown>,
  userId: string,
  title: string,
): Record<string, unknown> {
  const insert: Record<string, unknown> = {
    user_id: userId,
    title: cleanTitle(title) || DEFAULT_TITLE,
  };
  for (const column of COPIED_COLUMNS) {
    if (column in source && source[column] !== undefined) insert[column] = source[column];
  }
  return insert;
}

/** Copies a resume into a new row with its own title. Returns the new resume id. */
export async function duplicateResume(
  supabase: SupabaseClient,
  sourceId: string,
  title: string,
): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You need to be logged in.");

  const { count, error: countError } = await supabase
    .from("resumes")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .is("deleted_at", null);
  if (countError) throw new Error(countError.message);
  if ((count ?? 0) >= MAX_RESUMES_PER_USER) {
    throw new Error(`You've reached the limit of ${MAX_RESUMES_PER_USER} resumes. Delete one to create another.`);
  }

  const { data: source, error: loadError } = await supabase
    .from("resumes")
    .select("*")
    .eq("id", sourceId)
    .eq("user_id", user.id)
    .single();
  if (loadError || !source) throw new Error(loadError?.message ?? "Resume not found.");

  const { data, error } = await supabase
    .from("resumes")
    .insert(buildVersionInsert(source as Record<string, unknown>, user.id, title))
    .select("id")
    .single();
  if (error || !data) throw new Error(error?.message ?? "Could not create the new version.");

  return data.id as string;
}

/** Renames a resume version. Returns the cleaned title that was saved. */
export async function renameResume(
  supabase: SupabaseClient,
  id: string,
  title: string,
): Promise<string> {
  const clean = cleanTitle(title);
  if (!clean) throw new Error("Enter a name for this version.");

  const { error } = await supabase.from("resumes").update({ title: clean }).eq("id", id);
  if (error) throw new Error(error.message);
  return clean;
}