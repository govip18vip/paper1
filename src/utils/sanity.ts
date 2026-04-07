// src/utils/sanity.ts
// ─────────────────────────────────────────────────────────────
// Sanity CMS 客户端工具函数
// 供 Astro 页面/API 路由调用，拉取 Bitaigen CMS 内容
// ─────────────────────────────────────────────────────────────

import { createClient } from "@sanity/client";

// ── 客户端实例 ────────────────────────────────────────────────
export const sanityClient = createClient({
  projectId:  import.meta.env.PUBLIC_SANITY_PROJECT_ID  ?? "jnjofxo7",
  dataset:    import.meta.env.PUBLIC_SANITY_DATASET      ?? "production",
  apiVersion: import.meta.env.PUBLIC_SANITY_API_VERSION  ?? "2025-04-07",
  useCdn:     false, // 关闭CDN缓存，保证内容实时性（ISR模式下Vercel自己做缓存）
  token:      import.meta.env.SANITY_READ_TOKEN,
});

// ── 类型定义 ──────────────────────────────────────────────────

export interface SanityImageRef {
  _type: "image";
  asset: { _ref: string; _type: "reference" };
  alt?: string;
  caption?: string;
}

export interface SanitySlug {
  current: string;
}

export interface SanityAuthor {
  _id: string;
  name: string;
  slug: SanitySlug;
  avatar?: SanityImageRef;
  bio?: string;
  twitter?: string;
  isAI?: boolean;
}

export interface SanityCategory {
  _id: string;
  title: string;
  slug: SanitySlug;
  color?: string;
}

export interface SanityPost {
  _id: string;
  _createdAt: string;
  title: string;
  slug: SanitySlug;
  lang: string;
  articleType: "news" | "article" | "market" | "howto" | "guide";
  description: string;
  coverImage?: SanityImageRef;
  body?: any[];
  categories?: SanityCategory[];
  author?: SanityAuthor;
  pubDatetime: string;
  modDatetime?: string;
  featured?: boolean;
  draft?: boolean;
  translationKey?: string;
  sourceUrl?: string;
  sourceName?: string;
  aiGenerated?: boolean;
  tags?: string[];
  faqs?: { q: string; a: string }[];
  readTime?: number;
}

export interface SanityFlash {
  _id: string;
  title: string;
  slug: SanitySlug;
  content: string;
  lang: string;
  importance: "high" | "medium" | "low";
  tags?: string[];
  sourceUrl?: string;
  sourceName?: string;
  pubDatetime: string;
  aiGenerated?: boolean;
  draft?: boolean;
}

export interface SanityTutorial {
  _id: string;
  title: string;
  slug: SanitySlug;
  lang: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  description: string;
  coverImage?: SanityImageRef;
  estimatedTime?: number;
  steps?: {
    stepTitle: string;
    stepBody?: any[];
    tip?: string;
  }[];
  tags?: string[];
  author?: SanityAuthor;
  pubDatetime: string;
  translationKey?: string;
  faqs?: { q: string; a: string }[];
  aiGenerated?: boolean;
  draft?: boolean;
  featured?: boolean;
}

// ── Sanity 图片 URL 生成 ──────────────────────────────────────
const PROJECT_ID = "jnjofxo7";
const DATASET    = "production";

export function sanityImageUrl(
  ref: string,
  options: { width?: number; height?: number; format?: "webp" | "jpg" | "png" } = {}
): string {
  // ref format: image-{hash}-{w}x{h}-{ext}
  const [, hash, dims, ext] = ref.match(/^image-([a-f0-9]+)-(\d+x\d+)-(\w+)$/) ?? [];
  if (!hash) return "";
  const base = `https://cdn.sanity.io/images/${PROJECT_ID}/${DATASET}/${hash}-${dims}.${ext}`;
  const params: string[] = [];
  if (options.width)  params.push(`w=${options.width}`);
  if (options.height) params.push(`h=${options.height}`);
  if (options.format) params.push(`fm=${options.format}`);
  params.push("fit=max", "auto=format");
  return `${base}?${params.join("&")}`;
}

// ── 查询函数 ──────────────────────────────────────────────────

/** 获取最新文章列表 */
export async function getSanityPosts(options: {
  lang?: string;
  limit?: number;
  tags?: string[];
  featured?: boolean;
  articleType?: string;
} = {}): Promise<SanityPost[]> {
  const conditions: string[] = ['_type == "btgPost"', 'draft != true'];
  if (options.lang)        conditions.push(`lang == "${options.lang}"`);
  if (options.featured)    conditions.push('featured == true');
  if (options.articleType) conditions.push(`articleType == "${options.articleType}"`);
  if (options.tags?.length) {
    const tagList = options.tags.map(t => `"${t}"`).join(", ");
    conditions.push(`count((tags[])[@ in [${tagList}]]) > 0`);
  }

  const filter = conditions.join(" && ");
  const limit  = options.limit ?? 20;

  return sanityClient.fetch<SanityPost[]>(`
    *[${filter}] | order(pubDatetime desc) [0...${limit}] {
      _id, _createdAt, title, slug, lang, articleType,
      description, coverImage, pubDatetime, modDatetime,
      featured, draft, translationKey, sourceUrl, sourceName,
      aiGenerated, tags, readTime,
      "author": author->{ _id, name, slug, avatar, isAI },
      "categories": categories[]->{ _id, title, slug, color }
    }
  `);
}

/** 获取单篇文章完整内容（含正文） */
export async function getSanityPostBySlug(slug: string): Promise<SanityPost | null> {
  return sanityClient.fetch<SanityPost | null>(`
    *[_type == "btgPost" && slug.current == $slug && draft != true][0] {
      _id, _createdAt, title, slug, lang, articleType,
      description, coverImage, body, pubDatetime, modDatetime,
      featured, translationKey, sourceUrl, sourceName,
      aiGenerated, tags, faqs, readTime,
      "author": author->{ _id, name, slug, avatar, bio, twitter, isAI },
      "categories": categories[]->{ _id, title, slug, color }
    }
  `, { slug });
}

/** 获取最新快讯 */
export async function getSanityFlashes(options: {
  lang?: string;
  limit?: number;
  importance?: "high" | "medium" | "low";
} = {}): Promise<SanityFlash[]> {
  const conditions: string[] = ['_type == "btgFlash"', 'draft != true'];
  if (options.lang)       conditions.push(`lang == "${options.lang}"`);
  if (options.importance) conditions.push(`importance == "${options.importance}"`);

  const filter = conditions.join(" && ");
  const limit  = options.limit ?? 10;

  return sanityClient.fetch<SanityFlash[]>(`
    *[${filter}] | order(pubDatetime desc) [0...${limit}] {
      _id, title, slug, content, lang, importance,
      tags, sourceUrl, sourceName, pubDatetime, aiGenerated
    }
  `);
}

/** 获取教程列表 */
export async function getSanityTutorials(options: {
  lang?: string;
  limit?: number;
  difficulty?: string;
  featured?: boolean;
} = {}): Promise<SanityTutorial[]> {
  const conditions: string[] = ['_type == "btgTutorial"', 'draft != true'];
  if (options.lang)       conditions.push(`lang == "${options.lang}"`);
  if (options.difficulty) conditions.push(`difficulty == "${options.difficulty}"`);
  if (options.featured)   conditions.push('featured == true');

  const filter = conditions.join(" && ");
  const limit  = options.limit ?? 10;

  return sanityClient.fetch<SanityTutorial[]>(`
    *[${filter}] | order(pubDatetime desc) [0...${limit}] {
      _id, title, slug, lang, difficulty, description,
      coverImage, estimatedTime, tags, pubDatetime,
      translationKey, aiGenerated, featured,
      "author": author->{ _id, name, slug, avatar }
    }
  `);
}

/** 获取所有分类 */
export async function getSanityCategories(): Promise<SanityCategory[]> {
  return sanityClient.fetch<SanityCategory[]>(`
    *[_type == "btgCategory"] | order(title asc) {
      _id, title, slug, color,
      titleEn, titleTw, titleEs, titlePt, description
    }
  `);
}

/** 根据 translationKey 获取同一文章的所有语言版本 */
export async function getSanityTranslations(translationKey: string): Promise<
  { lang: string; slug: string; title: string }[]
> {
  return sanityClient.fetch(`
    *[_type in ["btgPost", "btgTutorial"] && translationKey == $key && draft != true] {
      lang, "slug": slug.current, title
    }
  `, { key: translationKey });
}
