import type { MetadataRoute } from "next";
import { PAGES, SITE_URL } from "@/lib/seo";

/* Sitemap without changefreq (search engines ignore it) and without lastmod:
   every file gets the same build date, and an identical lastmod is worse than
   none. Each page links to itself as the US English version and the default. */
export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.map((path) => {
    const url = `${SITE_URL}${path === "/" ? "" : path}`;
    return {
      url,
      priority: path === "/" ? 1 : path === "/privacy" ? 0.2 : 0.8,
      alternates: { languages: { "en-US": url, "x-default": url } },
    };
  });
}
