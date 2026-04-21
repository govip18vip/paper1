// src/pages/sanity-sitemap-[n].xml.ts
// ─────────────────────────────────────────────────────────────
// Paginated URL sitemap for Sanity btgPost documents.
// Called by /sanity-sitemap.xml (the index) as:
//   /sanity-sitemap-0.xml  → posts  0 … 39 999
//   /sanity-sitemap-1.xml  → posts 40 000 … 79 999
//   … and so on
//
// Astro resolves [n] from the URL:  /sanity-sitemap-5.xml → n = "5"
// ─────────────────────────────────────────────────────────────
export const prerender = false;

import type { APIRoute } from "astro";
import { sanityClient } from "@/utils/sanity";
import { SITE } from "@/config";
import { LANG_TO_PATH, type Lang } from "@/i18n/ui";

type SanityRow = {
  slug: { current: string } | string;
  lang?: string;
  pubDatetime: string;
  modDatetime?: string;
};

const URLS_PER_PAGE = 40_000;

function postUrl(siteBase: string, lang: Lang, slug: string): string {
  const lp = LANG_TO_PATH[lang] ?? "";
  return lp ? `${siteBase}/${lp}/news/${slug}` : `${siteBase}/news/${slug}`;
}

export const GET: APIRoute = async ({ params, site }) => {
  const siteBase = (site?.href ?? SITE.website).replace(/\/$/, "");

  const page = parseInt(params.n ?? "0", 10);
  if (isNaN(page) || page < 0 || page > 999) {
    return new Response("Not Found", { status: 404 });
  }

  const start = page * URLS_PER_PAGE;
  const end   = start + URLS_PER_PAGE;

  const rows = await sanityClient
    .fetch<SanityRow[]>(
      `*[_type == "btgPost" && draft != true]
        | order(pubDatetime desc) [${start}...${end}] {
          slug, lang, pubDatetime, modDatetime
        }`,
    )
    .catch(() => [] as SanityRow[]);

  // Return 404 for out-of-range pages (except page 0 which can legitimately be empty)
  if (rows.length === 0 && page > 0) {
    return new Response("Not Found", { status: 404 });
  }

  const urlEntries = rows
    .map(r => {
      const slug = typeof r.slug === "string" ? r.slug : r.slug?.current ?? "";
      if (!slug) return "";
      const lang = (r.lang ?? "zh-CN") as Lang;
      const loc  = postUrl(siteBase, lang, slug);
      const lastmod = new Date(r.modDatetime ?? r.pubDatetime)
        .toISOString()
        .split("T")[0];
      return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    })
    .filter(Boolean);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries.join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      // Cache 1 hour on CDN; Vercel ISR will background-refresh
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
};
