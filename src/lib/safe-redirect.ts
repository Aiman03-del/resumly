/**
 * Only allow same-site relative paths after login.
 * Blocks "//evil.com", "/\evil.com" and paths with control characters
 * (browsers strip tabs/newlines, so "/\t/evil.com" becomes "//evil.com").
 */
export function safeRedirect(value: string | null | undefined, fallback = "/dashboard"): string {
  if (!value || !value.startsWith("/")) return fallback;
  if (value.startsWith("//")) return fallback;
  if (/[\\\u0000-\u001f\u007f]/.test(value)) return fallback;
  return value;
}
