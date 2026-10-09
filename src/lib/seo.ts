import type { Metadata } from "next";

/* Базовое SEO: один адрес сайта, канонические ссылки, превью для мессенджеров.
   Боевой домен задаётся переменной NEXT_PUBLIC_SITE_URL при сборке
   (см. docs/deploy.md). */

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://kordon-ai.vercel.app").replace(/\/+$/, "");
export const SITE_NAME = "Кордон AI";

type Page = {
  /** путь страницы: «/», «/pricing» */
  path: string;
  /** заголовок вкладки и сниппета (без «· Кордон AI» — добавит шаблон) */
  title: string;
  /** 140–170 символов, свой для каждой страницы */
  description: string;
  /** имя картинки превью в public/og */
  og: string;
  /** заголовок на превью в мессенджерах, если отличается */
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
      locale: "ru_RU",
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

/* страницы сайта — для карты сайта */
export const PAGES = [
  "/",
  "/security",
  "/solutions",
  "/solutions/it",
  "/solutions/infosec",
  "/solutions/finance",
  "/pricing",
  "/start",
  "/about",
  "/contacts",
  "/privacy",
] as const;
