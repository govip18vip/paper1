// src/content.config.ts
// ─────────────────────────────────────────────────────────────
// Updated schema: adds `lang` and `translationKey` fields
// needed for the multi-language system.
// ─────────────────────────────────────────────────────────────

import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { SITE } from "@/config";
import { LANGUAGES } from "@/i18n/ui";

export const BLOG_PATH = "src/data/blog";

const blog = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: `./${BLOG_PATH}` }),
  schema: ({ image }) =>
    z.object({
      author: z.string().default(SITE.author),
      pubDatetime: z.date(),
      modDatetime: z.date().optional().nullable(),
      title: z.string(),
      featured: z.boolean().optional(),
      draft: z.boolean().optional(),
      tags: z.array(z.string()).default(["others"]),
      ogImage: image().or(z.string()).optional(),
      description: z.string(),
      canonicalURL: z.string().optional(),
      hideEditPost: z.boolean().optional(),
      timezone: z.string().optional(),

      // ── Multi-language fields ──────────────────────────────
      // lang: ISO language code of this specific post
      // e.g. "zh-CN" | "zh-TW" | "en" | "es" | "pt"
      lang: z
        .enum(Object.keys(LANGUAGES) as [string, ...string[]])
        .optional(),

      // translationKey: shared key across all language versions
      // of the same article. Used to link translations together.
      // Example: all 5 language versions of the BTC guide share
      //   translationKey: "bitcoin-btc-complete-guide"
      translationKey: z.string().optional(),
    }),
});

export const collections = { blog };
