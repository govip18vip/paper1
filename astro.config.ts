import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import remarkToc from "remark-toc";
import remarkCollapse from "remark-collapse";
import { SITE } from "./src/config";
import { transformerFileName } from "./src/utils/transformers/fileName.js";
import {
  transformerNotationDiff,
  transformerNotationWordHighlight,
  transformerNotationFocus,
} from "@shikijs/transformers";

export default defineConfig({
  site: SITE.website,

  // ★ hybrid = 默认静态，文章页走 SSR
  output: "static",
  adapter: vercel({
    // Vercel ISR：SSR页面缓存5分钟，过期后台刷新
    // 用户永远秒开（读缓存），Ghost发布后最多5分钟生效
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
          changefreq = "daily"; priority = 1.0;
        } else if (url.includes("/price/")) {
          changefreq = "hourly"; priority = 0.9;
        } else if (url.includes("/posts/") && !url.match(/\/posts\/\d+\/?$/)) {
          changefreq = "weekly"; priority = 0.8;
        } else if (url.includes("/tags/")) {
          changefreq = "weekly"; priority = 0.7;
        } else if (url.match(/\/(en|zh-tw|es|pt)\/?$/)) {
          changefreq = "daily"; priority = 0.9;
        }
        return { ...item, changefreq, priority, lastmod: new Date(item.lastmod ?? Date.now()).toISOString() };
      },
      i18n: {
        defaultLocale: "zh-CN",
        locales: { "zh-CN": "zh-CN", "zh-tw": "zh-TW", "en": "en", "es": "es", "pt": "pt-BR" },
      },
    }),
  ],

  markdown: {
    remarkPlugins: [remarkToc, [remarkCollapse, { test: "Table of contents" }]],
    shikiConfig: {
      themes: { light: "min-light", dark: "night-owl" },
      transformers: [transformerFileName(), transformerNotationDiff(), transformerNotationWordHighlight(), transformerNotationFocus()],
    },
  },

  vite: {
    plugins: [tailwindcss() as any],
    optimizeDeps: { exclude: ["@resvg/resvg-js"] },
  },

  image: { layout: "constrained" },
});
