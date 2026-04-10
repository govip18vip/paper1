// src/pages/robots.txt.ts
import type { APIRoute } from "astro";

const getRobotsTxt = (sitemapURL: URL, siteUrl: string) => `
# ── Blocked crawlers (must appear BEFORE wildcard rules) ──
User-agent: MJ12bot
Disallow: /

User-agent: AhrefsBot
Disallow: /

User-agent: SemrushBot
Disallow: /

User-agent: DotBot
Disallow: /

# ── Default rules for all crawlers ──────────────────────
User-agent: *
Allow: /
Disallow: /api/
Disallow: /_astro/
Disallow: /go/
Disallow: /404
Crawl-delay: 1

# ── Traditional search engines ───────────────────────────
User-agent: Googlebot
Allow: /
Disallow: /api/
Disallow: /_astro/
Disallow: /go/

User-agent: Bingbot
Allow: /
Crawl-delay: 1

User-agent: Baiduspider
Allow: /
Crawl-delay: 1

User-agent: Yandex
Allow: /
Crawl-delay: 1

User-agent: Slurp
Allow: /

User-agent: DuckDuckBot
Allow: /

# ── AI search engine crawlers (explicit permission for GEO) ─
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Googlebot-Extended
Allow: /

User-agent: Applebot
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: FacebookBot
Allow: /

User-agent: cohere-ai
Allow: /

User-agent: Diffbot
Allow: /

User-agent: CCBot
Allow: /

User-agent: Bytespider
Allow: /

# ── Sitemap & LLMs.txt ─────────────────────────────────
Sitemap: ${sitemapURL.href}
Sitemap: ${siteUrl}news-sitemap.xml

# LLMs.txt: ${siteUrl}/llms.txt
`.trim();

export const GET: APIRoute = ({ site }) => {
  const sitemapURL = new URL("sitemap-index.xml", site);
  const siteUrl = site?.href.replace(/\/$/, "") ?? "https://bitaigen.com";
  return new Response(getRobotsTxt(sitemapURL, siteUrl), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
};
