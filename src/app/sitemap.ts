import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-config";

/**
 * Only public, non-personalized marketing pages belong here.
 * Everything under auth-gated routes (dashboard, builder, account, preview)
 * or per-user share links (/r/[shareId]) is intentionally left out and
 * disallowed in robots.ts — a resume owner controls whether their shared
 * link is discoverable, not a sitemap.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/about", "/pricing", "/features", "/templates"];

  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}