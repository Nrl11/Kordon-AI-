import type { Metadata } from "next";

/* Basic SEO: one site address, canonical links, link previews.
   The production domain comes from NEXT_PUBLIC_SITE_URL at build time
   (see docs/deploy.md). */

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://kordon-ai.vercel.app").replace(/\/+$/, "");
export const SITE_NAME = "Kordon AI";

type Page = {
  /** page path: «/», «/pricing» */
  path: string;
  /** tab and snippet title (the template adds «· Kordon AI») */
  title: string;
  /** 140–170 characters, unique per page */
  description: string;
  /** preview image name in public/og */
  og: string;
  /** link-preview title, if different */
  ogTitle?: string;
  index?: boolean;
};

export function pageMeta({ path, title, description, og, ogTitle, index = true }: Page): Metadata {
  const image = { url: `/og/${og}.png`, width: 1200, height: 630, alt: ogTitle ?? title };
  return {
    title: path === "/" ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    robots: index ? undefined : { index: false, follow: true },
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: SITE_NAME,
      url: path,
      title: ogTitle ?? title,
      description,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle ?? title,
      description,
      images: [image.url],
    },
  };
}

/* site pages — for the sitemap */
export const PAGES = [
  "/",
  "/security",
  "/solutions",
  "/solutions/it",
  "/solutions/infosec",
  "/solutions/finance",
  "/pricing",
  "/start",
  "/privacy",
] as const;
