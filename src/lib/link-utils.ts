/** "github.com/x" -> "https://github.com/x". Unsafe schemes are dropped. */
export function toHref(raw?: string | null): string {
  const value = (raw ?? "").trim();
  if (!value) return "";
  if (/^(javascript|data|vbscript):/i.test(value)) return "";
  if (/^(https?:|mailto:|tel:)/i.test(value)) return value;
  return `https://${value}`;
}

/** Text shown on the resume: no protocol, no trailing slash. */
export function displayUrl(raw: string): string {
  return raw.trim().replace(/^https?:\/\//i, "").replace(/\/$/, "");
}