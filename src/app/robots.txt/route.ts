import { SITE_URL } from "@/lib/seo";

/* robots.txt: service paths are closed, tracking parameters aren't crawled,
   blocking AI crawlers is optional. /_next/static/ scripts stay open: without
   them Google can't render the page. */
export const dynamic = "force-static";

export function GET() {
  const body = `User-Agent: *
Allow: /
Disallow: /_next/data/
Disallow: /api/
Disallow: /*?utm_
Disallow: /*?fbclid=
Disallow: /*?gclid=

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

Sitemap: ${SITE_URL}/sitemap.xml
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
