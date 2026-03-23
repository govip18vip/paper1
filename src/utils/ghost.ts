// src/utils/ghost.ts
// ─────────────────────────────────────────────────────────────
// Ghost Content API 客户端（只读）— 生产环境加固版
//
// 工作流：Ghost 后台写文章 → 发布 → 网站自动显示
//
// Ghost 多语言约定：
//   在 Ghost 编辑器的标签栏输入 #lang-en（# 开头 = internal tag）
//   无语言标签的文章默认 zh-CN
//   翻译关联：给同一组文章加相同的 #tk-xxx 标签
// ─────────────────────────────────────────────────────────────

import type { Lang } from "@/i18n/ui";

// ── 配置（从环境变量读取，Vercel Dashboard 中设置）─────────
const GHOST_URL = import.meta.env.GHOST_URL || "https://coin.ghost.io";
const CONTENT_KEY = import.meta.env.GHOST_CONTENT_KEY || "9269336edff13b5664c35c8706";
const API_VERSION = "v5.0";
const CONTENT_API = `${GHOST_URL}/ghost/api/content`;

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
  // 运行时附加
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
  "en": "hash-lang-en",
  "es": "hash-lang-es",
  "pt": "hash-lang-pt",
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
  const match = (post.codeinjection_head || "").match(/<!--\s*translationKey:\s*(.+?)\s*-->/);
  return match?.[1]?.trim();
}

function enrichPost(post: GhostPost): GhostPost {
  post.lang = extractLang(post);
  post.translationKey = extractTranslationKey(post);
  return post;
}

// ── API 请求（带重试和超时）──────────────────────────────

function buildUrl(endpoint: string, params: Record<string, string> = {}): string {
  const url = new URL(`${CONTENT_API}${endpoint}`);
  url.searchParams.set("key", CONTENT_KEY);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  return url.toString();
}

async function ghostFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = buildUrl(endpoint, params);

  // 重试机制：最多重试 2 次
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(attempt === 0 ? 10000 : 15000),
        headers: { Accept: "application/json" },
      });

      if (!res.ok) {
        if (res.status === 404) {
          throw new GhostNotFoundError(`Ghost 404: ${endpoint}`);
        }
        throw new Error(`Ghost API ${res.status}: ${endpoint}`);
      }
      return await res.json();
    } catch (e: any) {
      lastError = e;
      if (e instanceof GhostNotFoundError) throw e; // 404 不重试
      if (attempt < 2) {
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1))); // 退避
      }
    }
  }
  throw lastError || new Error(`Ghost API failed: ${endpoint}`);
}

// 自定义 404 错误
class GhostNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GhostNotFoundError";
  }
}

// ── 空结果常量（Ghost 不可用时返回）────────────────────────
const EMPTY_PAGINATION: GhostPagination = {
  page: 1, limit: 20, pages: 1, total: 0, next: null, prev: null,
};

// ── 公开方法 ──────────────────────────────────────────────

/**
 * 文章列表（分页 + 语言/标签过滤）
 * 如果 Ghost 不可用，返回空列表而不是抛出错误
 */
export async function getPosts(options: {
  page?: number;
  limit?: number;
  lang?: Lang;
  tag?: string;
  featured?: boolean;
  order?: string;
} = {}): Promise<{ posts: GhostPost[]; pagination: GhostPagination }> {
  const {
    page = 1, limit = 15, lang, tag, featured,
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
    return { posts: [], pagination: EMPTY_PAGINATION };
  }
}

/**
 * 单篇文章（by slug）— 返回 null 而非抛错
 */
export async function getPostBySlug(slug: string): Promise<GhostPost | null> {
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
export async function getTranslationSiblings(translationKey: string): Promise<GhostPost[]> {
  if (!translationKey) return [];
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
 * 相关文章（同标签 + 同语言）
 */
export async function getRelatedPosts(post: GhostPost, limit = 6): Promise<GhostPost[]> {
  const tag = post.primary_tag?.slug;
  if (!tag) return [];
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
 * 检查 Ghost API 是否可用（用于健康检查）
 */
export async function isGhostAvailable(): Promise<boolean> {
  try {
    const url = buildUrl("/posts/", { limit: "1", fields: "id" });
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    return res.ok;
  } catch {
    return false;
  }
}
