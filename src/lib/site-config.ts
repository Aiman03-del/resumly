/**
 * Central place for the site's public base URL.
 * Set NEXT_PUBLIC_SITE_URL in production (e.g. https://resumly.app) so
 * metadata, Open Graph tags, and the sitemap/robots files emit absolute,
 * correct URLs instead of falling back to localhost.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
export const SITE_NAME = "Resumly";
export const SITE_DESCRIPTION =
  "Build a polished, ATS-friendly resume in minutes with Resumly — AI-assisted writing, professional templates, and instant PDF export.";