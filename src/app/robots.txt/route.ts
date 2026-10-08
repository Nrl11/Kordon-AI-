import { SITE_URL } from "@/lib/seo";

/* robots.txt по образцу технического аудита: служебные пути закрыты,
   для Яндекса — склейка меток (Clean-param), ИИ-краулеры — на выбор.
   Скрипты /_next/static/ не закрываем: без них Google не отрисует страницу. */
export const dynamic = "force-static";

export function GET() {
  const body = `User-Agent: *
Allow: /
Disallow: /_next/data/
Disallow: /api/
Disallow: /*?utm_
Disallow: /*?fbclid=
Disallow: /*?gclid=

User-Agent: Yandex
Allow: /
Disallow: /_next/data/
Disallow: /api/
Clean-param: ysclid
Clean-param: yclid
Clean-param: utm_source&utm_medium&utm_campaign&utm_content&utm_term
Clean-param: _openstat
Clean-param: from
Clean-param: gclid

# AI crawlers used to train LLMs
# Uncomment the blocks below to opt out of AI training on your content
# User-Agent: GPTBot
# Disallow: /

# User-Agent: ClaudeBot
# Disallow: /

# User-Agent: PerplexityBot
# Disallow: /

# User-Agent: CCBot
# Disallow: /

# User-Agent: Google-Extended
# Disallow: /

# User-Agent: YandexGPT
# Disallow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
