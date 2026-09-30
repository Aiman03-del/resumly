/** Joins non-empty contact parts so hidden or missing details leave no dangling separator. */
export function joinContact(parts: Array<string | null | undefined>, separator = " · "): string {
  return parts
    .map((part) => (typeof part === "string" ? part.trim() : ""))
    .filter(Boolean)
    .join(separator);
}