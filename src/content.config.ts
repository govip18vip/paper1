// src/content.config.ts
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
      description: z.string().min(10).max(300),
      canonicalURL: z.string().optional(),
      hideEditPost: z.boolean().optional(),
      timezone: z.string().optional(),

      // ── Multi-language fields ──────────────────────────────
      lang: z
        .enum(Object.keys(LANGUAGES) as [string, ...string[]])
        .optional(),
      translationKey: z.string().optional(),

      // ── Visual ─────────────────────────────────────────────
      // heroImage: used in frontmatter for the main article banner.
      // Accepts both local image() refs and external URL strings.
      heroImage: image().or(z.string()).optional(),

      // ── GEO / AI search optimization ─────────────────────
      keyTakeaways: z.array(z.string()).optional(),
      keywords: z.string().optional(),

      // ── SEO / Schema fields ────────────────────────────────
      type: z
        .enum(["article", "howto", "guide", "news"])
        .default("article"),

      faqs: z
        .array(
          z.object({
            q: z.string(),
            a: z.string(),
          })
        )
        .optional(),

      // ── HowTo steps（用于 type: howto 的文章）──────────────────
      steps: z
        .array(
          z.object({
            name: z.string(),
            text: z.string(),
            url: z.string().optional(),
          })
        )
        .optional(),
    }),
});

export const collections = { blog };
