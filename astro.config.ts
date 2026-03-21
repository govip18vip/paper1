import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import remarkToc from "remark-toc";
import remarkCollapse from "remark-collapse";
import { SITE } from "./src/config";
import { transformerFileName } from "./src/utils/transformers/fileName.js";
import {
  transformerNotationDiff,
  transformerNotationHighlightWord,
  transformerNotationFocus,
} from "@shikijs/transformers";

export default defineConfig({
  site: SITE.website,

  integrations: [
    sitemap({
      filter: page => SITE.showArchives || !page.endsWith("/archives"),

      // ✅ Fix: removed unused `isArchive`, cast changefreq as `any`
      serialize(item) {
        const url = item.url;

        let changefreq: any = "monthly";
        if (url === SITE.website || url === SITE.website + "/") {
          changefreq = "daily";
        } else if (
          url.includes("/posts/") ||
          url.includes("/tags/")
        ) {
          changefreq = "weekly";
        }

        return {
          ...item,
          changefreq,
          priority:
            url === SITE.website || url === SITE.website + "/"
              ? 1.0
              : url.includes("/posts/")
              ? 0.8
              : 0.6,
          lastmod: new Date(
            item.lastmod ?? Date.now()
          ).toISOString(),
        };
      },

      i18n: {
        defaultLocale: "zh-CN",
        locales: {
          "zh-CN": "zh-CN",
          "zh-tw": "zh-TW",
          "en":    "en",
          "es":    "es",
          "pt":    "pt-BR",
        },
      },
    }),
  ],

  markdown: {
    remarkPlugins: [
      remarkToc,
      [
        remarkCollapse,
        {
          test: "Table of contents",
        },
      ],
    ],
    shikiConfig: {
      // https://shiki.style/themes
      themes: { light: "min-light", dark: "night-owl" },
      transformers: [
        transformerFileName(),
        transformerNotationDiff(),
        transformerNotationHighlightWord(),
        transformerNotationFocus(),
      ],
    },
  },

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      exclude: ["@resvg/resvg-js"],
    },
  },

  image: {
    experimentalLayout: "responsive",
  },

  experimental: {
    svg: true,
    responsiveImages: true,
    contentIntellisense: true,
  },
});
