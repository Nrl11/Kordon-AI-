import type { MetadataRoute } from "next";
import { PAGES, SITE_URL } from "@/lib/seo";

/* Карта сайта без changefreq (поисковики её не читают) и без lastmod:
   на сборке у всех файлов одна дата, а одинаковый lastmod хуже, чем никакой.
   У каждой страницы — ссылка на себя как русскую версию и версию по умолчанию. */
export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.map((path) => {
    const url = `${SITE_URL}${path === "/" ? "" : path}`;
    return {
      url,
      priority: path === "/" ? 1 : path === "/privacy" ? 0.2 : 0.8,
      alternates: { languages: { ru: url, "x-default": url } },
    };
  });
}
