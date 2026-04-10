import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { SITE } from "./src/config";
import { transformerFileName } from "./src/utils/transformers/fileName.js";
import {
  transformerNotationDiff,
  transformerNotationWordHighlight,
  transformerNotationFocus,
} from "@shikijs/transformers";

// ─────────────────────────────────────────────────────────────
// Astro 5.x Config
//
// output: "static" — 默认静态生成，个别页面通过 prerender = false 启用 SSR
// ─────────────────────────────────────────────────────────────

export default defineConfig({
  site: SITE.website,

  output: "static",
  trailingSlash: "never",

  prefetch: {
    prefetchAll: false,
    defaultStrategy: "hover",
  },

  adapter: vercel({
    // Vercel ISR：SSR 页面缓存 5 分钟，过期后台刷新
    isr: {
      expiration: 300,
    },
  }),

  integrations: [
    sitemap({
      filter: page =>
        (SITE.showArchives || !page.endsWith("/archives")) &&
        !page.includes("/go/") &&
        !page.includes("/404"),
      serialize(item) {
        const url = item.url;
        let changefreq: any = "monthly";
        let priority = 0.6;
        if (url === SITE.website || url === SITE.website + "/") {
          changefreq = "daily";
          priority = 1.0;
        } else if (url.includes("/price/")) {
          changefreq = "hourly";
          priority = 0.9;
        } else if (
          url.includes("/posts/") &&
          !url.match(/\/posts\/\d+\/?$/)
        ) {
          changefreq = "weekly";
          priority = 0.8;
        } else if (url.includes("/tags/")) {
          changefreq = "weekly";
          priority = 0.7;
        } else if (url.match(/\/(en|zh-tw|es|pt)\/?$/)) {
          changefreq = "daily";
          priority = 0.9;
        }
        return {
          ...item,
          changefreq,
          priority,
          lastmod: item.lastmod ? new Date(item.lastmod).toISOString() : undefined,
        };
      },
      i18n: {
        defaultLocale: "zh-CN",
        locales: {
          "zh-CN": "zh-CN",
          "zh-tw": "zh-TW",
          en: "en",
          es: "es",
          pt: "pt-BR",
        },
      },
    }),
  ],

  markdown: {
    remarkPlugins: [],
    shikiConfig: {
      themes: { light: "min-light", dark: "night-owl" },
      transformers: [
        transformerFileName(),
        transformerNotationDiff(),
        transformerNotationWordHighlight(),
        transformerNotationFocus(),
      ],
    },
  },

  vite: {
    plugins: [tailwindcss() as any],
    optimizeDeps: { exclude: ["@resvg/resvg-js"] },
  },

  image: { layout: "constrained" },
});
