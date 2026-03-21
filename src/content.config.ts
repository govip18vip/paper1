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
      description: z.string(),
      canonicalURL: z.string().optional(),
      hideEditPost: z.boolean().optional(),
      timezone: z.string().optional(),

      // ── Multi-language fields ──────────────────────────────
      lang: z
        .enum(Object.keys(LANGUAGES) as [string, ...string[]])
        .optional(),
      translationKey: z.string().optional(),

      // ── SEO / Schema fields ────────────────────────────────
      // type 决定注入哪种 Schema：
      //   "article"  → Article schema（默认，适用普通资讯）
      //   "howto"    → HowTo schema（适用教程类，展示步骤富片段）
      //   "guide"    → Article schema + FAQPage（适用深度指南）
      //   "news"     → Article + SpecialAnnouncement（适用快讯）
      type: z
        .enum(["article", "howto", "guide", "news"])
        .default("article"),

      // faqs：注入 FAQPage schema，Google"人们还问"富片段
      // 每篇文章建议 3~8 个问答对
      // 示例：
      //   faqs:
      //     - q: "币安注册需要实名吗？"
      //       a: "是的，需完成KYC才能使用完整功能。"
      faqs: z
        .array(
          z.object({
            q: z.string(),
            a: z.string(),
          })
        )
        .optional(),
    }),
});

export const collections = { blog };
