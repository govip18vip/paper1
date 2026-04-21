// src/pages/sanity-sitemap.xml.ts
// ─────────────────────────────────────────────────────────────
// Sitemap INDEX for ALL Sanity `btgPost` documents.
//
// With 362K+ posts a single sitemap would exceed Google's 50 MB / 50K URL
// limits, so this file acts as a sitemap index that lists paginated
// sub-sitemaps at /sanity-sitemap-0.xml, /sanity-sitemap-1.xml, …
//
// Each sub-sitemap (sanity-sitemap-[n].xml.ts) fetches its own slice of
// 40 K posts from Sanity and returns a standard <urlset>.
//
// Also includes static /news list-page URLs directly (only a handful).
// ─────────────────────────────────────────────────────────────
export const prerender = false;

import type { APIRoute } from "astro";
import { sanityClient } from "@/utils/sanity";
import { SITE } from "@/config";

const URLS_PER_PAGE = 40_000; // safely under Google's 50K URL limit

// Static /news listing pages that are SSR (not in auto-generated sitemap)
const NEWS_LIST_PAGES = [
  "/news",
  "/zh-tw/news",
  "/en/news",
  "/es/news",
  "/pt/news",
];

export const GET: APIRoute = async ({ site }) => {
  const siteBase = (site?.href ?? SITE.website).replace(/\/$/, "");
  const today = new Date().toISOString().split("T")[0];

  // Count all published posts to know how many sub-sitemaps we need
  const total = await sanityClient
    .fetch<number>('count(*[_type == "btgPost" && draft != true])')
    .catch(() => 0);

  const pageCount = Math.max(1, Math.ceil(total / URLS_PER_PAGE));

  // News list pages as individual <sitemap> entries (or inline <url> — use
  // a nested sitemap for cleanliness so this file stays a pure index)
  const staticEntries = NEWS_LIST_PAGES.map(
    path =>
      `  <sitemap>\n    <loc>${siteBase}${path}</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>`,
  );

  // Paginated post sitemaps
  const pageEntries = Array.from({ length: pageCount }, (_, i) =>
    `  <sitemap>\n    <loc>${siteBase}/sanity-sitemap-${i}.xml</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>`,
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticEntries, ...pageEntries].join("\n")}
</sitemapindex>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
};
