// src/utils/ghost.ts
// ─────────────────────────────────────────────────────────────
// Ghost Content API 客户端（只读）— 生产级加固版
//
// 关键改进：
//   1. 所有公开方法永远不抛异常，返回空数据
//   2. 构建时如果 Ghost 不可用不会导致构建失败
//   3. 重试带指数退避
//   4. 环境变量缺失时静默降级
// ─────────────────────────────────────────────────────────────

import type { Lang } from "@/i18n/ui";

// ── 配置（从环境变量读取）───────────────────────────────
const GHOST_URL = (
  import.meta.env.GHOST_URL || ""
).replace(/\/$/, "");
const CONTENT_KEY = import.meta.env.GHOST_CONTENT_KEY || "";
const API_VERSION = "v5.0";

// 如果没有配置 Ghost，所有方法直接返回空数据
const GHOST_ENABLED = !!(GHOST_URL && CONTENT_KEY);

if (!GHOST_ENABLED) {
  console.warn(
    "[Ghost] GHOST_URL or GHOST_CONTENT_KEY not set. Ghost CMS integration disabled."
  );
}

const CONTENT_API = GHOST_ENABLED
  ? `${GHOST_URL}/ghost/api/content`
  : "";

// ── 类型 ──────────────────────────────────────────────────

export interface GhostPost {
  id: string;
  slug: string;
  title: string;
  html: string;
  excerpt: string;
  feature_image: string | null;
  featured: boolean;
  published_at: string;
  updated_at: string;
  reading_time: number;
  tags: GhostTag[];
  authors: GhostAuthor[];
  primary_tag: GhostTag | null;
  primary_author: GhostAuthor | null;
  meta_title: string | null;
  meta_description: string | null;
  og_image: string | null;
  custom_excerpt: string | null;
  codeinjection_head: string | null;
  url: string;
  lang?: Lang;
  translationKey?: string;
}

export interface GhostTag {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  visibility: "public" | "internal";
}

export interface GhostAuthor {
  id: string;
  name: string;
  slug: string;
  profile_image: string | null;
  bio: string | null;
}

export interface GhostPagination {
  page: number;
  limit: number;
  pages: number;
  total: number;
  next: number | null;
  prev: number | null;
}

// ── 语言 ↔ Ghost tag 映射 ────────────────────────────────

const LANG_SLUG_MAP: Record<string, Lang> = {
  "hash-lang-zh-cn": "zh-CN",
  "hash-lang-zh-tw": "zh-TW",
  "hash-lang-en": "en",
  "hash-lang-es": "es",
  "hash-lang-pt": "pt",
};

const LANG_TO_SLUG: Record<Lang, string> = {
  "zh-CN": "hash-lang-zh-cn",
  "zh-TW": "hash-lang-zh-tw",
  en: "hash-lang-en",
  es: "hash-lang-es",
  pt: "hash-lang-pt",
};

function extractLang(post: GhostPost): Lang {
  for (const tag of post.tags || []) {
    const mapped = LANG_SLUG_MAP[tag.slug];
    if (mapped) return mapped;
  }
  return "zh-CN";
}

function extractTranslationKey(post: GhostPost): string | undefined {
  for (const tag of post.tags || []) {
    if (tag.slug.startsWith("hash-tk-")) {
      return tag.slug.replace("hash-tk-", "");
    }
  }
  const match = (post.codeinjection_head || "").match(
    /<!--\s*translationKey:\s*(.+?)\s*-->/
  );
  return match?.[1]?.trim();
}

function enrichPost(post: GhostPost): GhostPost {
  post.lang = extractLang(post);
  post.translationKey = extractTranslationKey(post);
  return post;
}

// ── 空结果常量 ───────────────────────────────────────────
const EMPTY_PAGINATION: GhostPagination = {
  page: 1,
  limit: 20,
  pages: 1,
  total: 0,
  next: null,
  prev: null,
};

const EMPTY_RESULT = {
  posts: [] as GhostPost[],
  pagination: EMPTY_PAGINATION,
};

// ── API 请求（带重试和超时）──────────────────────────────

function buildUrl(
  endpoint: string,
  params: Record<string, string> = {}
): string {
  const url = new URL(`${CONTENT_API}${endpoint}`);
  url.searchParams.set("key", CONTENT_KEY);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  return url.toString();
}

class GhostNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GhostNotFoundError";
  }
}

async function ghostFetch<T>(
  endpoint: string,
  params: Record<string, string> = {}
): Promise<T> {
  if (!GHOST_ENABLED) {
    throw new Error("Ghost CMS not configured");
  }

  const url = buildUrl(endpoint, params);
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const timeoutMs = attempt === 0 ? 8000 : 12000;
      const res = await fetch(url, {
        signal: AbortSignal.timeout(timeoutMs),
        headers: { Accept: "application/json" },
      });

      if (!res.ok) {
        if (res.status === 404) {
          throw new GhostNotFoundError(`Ghost 404: ${endpoint}`);
        }
        throw new Error(`Ghost API ${res.status}: ${endpoint}`);
      }
      return (await res.json()) as T;
    } catch (e: any) {
      lastError = e;
      if (e instanceof GhostNotFoundError) throw e;
      if (attempt < 2) {
        // 指数退避：1s, 2s
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
      }
    }
  }
  throw lastError || new Error(`Ghost API failed: ${endpoint}`);
}

// ── 公开方法（全部不抛异常）──────────────────────────────

/**
 * 文章列表 — Ghost 不可用时返回空列表
 */
export async function getPosts(
  options: {
    page?: number;
    limit?: number;
    lang?: Lang;
    tag?: string;
    featured?: boolean;
    order?: string;
  } = {}
): Promise<{ posts: GhostPost[]; pagination: GhostPagination }> {
  if (!GHOST_ENABLED) return EMPTY_RESULT;

  const {
    page = 1,
    limit = 15,
    lang,
    tag,
    featured,
    order = "published_at desc",
  } = options;

  const filters: string[] = [];
  if (lang) filters.push(`tag:${LANG_TO_SLUG[lang]}`);
  if (tag) filters.push(`tag:${tag}`);
  if (featured !== undefined) filters.push(`featured:${featured}`);

  const params: Record<string, string> = {
    page: String(page),
    limit: String(limit),
    order,
    include: "tags,authors",
  };
  if (filters.length > 0) params.filter = filters.join("+");

  try {
    const data = await ghostFetch<{
      posts: GhostPost[];
      meta: { pagination: GhostPagination };
    }>("/posts/", params);

    return {
      posts: data.posts.map(enrichPost),
      pagination: data.meta.pagination,
    };
  } catch (e) {
    console.error("[Ghost] getPosts failed:", e);
    return EMPTY_RESULT;
  }
}

/**
 * 单篇文章 — 返回 null 而非抛错
 */
export async function getPostBySlug(
  slug: string
): Promise<GhostPost | null> {
  if (!GHOST_ENABLED) return null;

  try {
    const data = await ghostFetch<{ posts: GhostPost[] }>(
      `/posts/slug/${slug}/`,
      { include: "tags,authors" }
    );
    return data.posts?.[0] ? enrichPost(data.posts[0]) : null;
  } catch (e: any) {
    if (e instanceof GhostNotFoundError) return null;
    console.error("[Ghost] getPostBySlug failed:", slug, e);
    return null;
  }
}

/**
 * 所有公开标签
 */
export async function getTags(limit = 100): Promise<GhostTag[]> {
  if (!GHOST_ENABLED) return [];

  try {
    const data = await ghostFetch<{ tags: GhostTag[] }>("/tags/", {
      limit: String(limit),
      order: "count.posts desc",
      filter: "visibility:public",
    });
    return data.tags;
  } catch (e) {
    console.error("[Ghost] getTags failed:", e);
    return [];
  }
}

/**
 * 同一翻译组的所有语言版本
 */
export async function getTranslationSiblings(
  translationKey: string
): Promise<GhostPost[]> {
  if (!translationKey || !GHOST_ENABLED) return [];
  try {
    const { posts } = await getPosts({
      tag: `hash-tk-${translationKey}`,
      limit: 10,
    });
    return posts;
  } catch {
    return [];
  }
}

/**
 * 相关文章
 */
export async function getRelatedPosts(
  post: GhostPost,
  limit = 6
): Promise<GhostPost[]> {
  const tag = post.primary_tag?.slug;
  if (!tag || !GHOST_ENABLED) return [];
  try {
    const { posts } = await getPosts({
      tag,
      lang: post.lang,
      limit: limit + 1,
    });
    return posts.filter(p => p.id !== post.id).slice(0, limit);
  } catch {
    return [];
  }
}

/**
 * 健康检查
 */
export async function isGhostAvailable(): Promise<boolean> {
  if (!GHOST_ENABLED) return false;
  try {
    const url = buildUrl("/posts/", { limit: "1", fields: "id" });
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    return res.ok;
  } catch {
    return false;
  }
}
