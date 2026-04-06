// src/utils/mergedPosts.ts
// ─────────────────────────────────────────────────────────────
// 合并本地 Markdown 文章和 Ghost CMS 文章，统一格式
// 用于首页和列表页展示
// ─────────────────────────────────────────────────────────────

import type { CollectionEntry } from "astro:content";
import { getPosts, type GhostPost } from "./ghost";
import type { Lang } from "@/i18n/ui";

// 统一的文章格式（兼容 Card 组件所需字段）
export interface UnifiedPost {
  // 来源标识
  source: "local" | "ghost";

  // Card 组件需要的核心字段
  id: string;
  title: string;
  description: string;
  pubDatetime: Date;
  modDatetime: Date | null;
  tags: string[];
  ogImage: string;
  author: string;
  featured: boolean;
  lang: string;

  // 链接
  href: string;

  // 原始数据（可选，调试用）
  _localPost?: CollectionEntry<"blog">;
  _ghostPost?: GhostPost;
}

/**
 * 将本地 Markdown 文章转换为统一格式
 */
export function localToUnified(
  post: CollectionEntry<"blog">,
  href: string
): UnifiedPost {
  const img = post.data.ogImage;
  const ogSrc = typeof img === "string" ? img : (img as any)?.src ?? "";

  return {
    source: "local",
    id: post.id,
    title: post.data.title,
    description: post.data.description,
    pubDatetime: new Date(post.data.pubDatetime),
    modDatetime: post.data.modDatetime ? new Date(post.data.modDatetime) : null,
    tags: post.data.tags || [],
    ogImage: ogSrc,
    author: post.data.author,
    featured: post.data.featured || false,
    lang: (post.data as any).lang || "zh-CN",
    href,
    _localPost: post,
  };
}

/**
 * 将 Ghost 文章转换为统一格式
 */
export function ghostToUnified(post: GhostPost): UnifiedPost {
  const publicTags = (post.tags || [])
    .filter(t => t.visibility === "public")
    .map(t => t.name);

  return {
    source: "ghost",
    id: `ghost-${post.id}`,
    title: post.title,
    description: post.custom_excerpt || post.excerpt || "",
    pubDatetime: new Date(post.published_at),
    modDatetime: new Date(post.updated_at),
    tags: publicTags,
    ogImage: post.feature_image || "",
    author: post.primary_author?.name || "Bitaigen",
    featured: post.featured,
    lang: post.lang || "zh-CN",
    href: `/archives/${post.slug}`,
    _ghostPost: post,
  };
}

/**
 * 从 Ghost 获取文章并转为统一格式
 */
export async function fetchGhostUnified(options?: {
  lang?: Lang;
  limit?: number;
}): Promise<UnifiedPost[]> {
  const { lang, limit = 20 } = options || {};
  try {
    const { posts } = await getPosts({ lang, limit, order: "published_at desc" });
    return posts.map(ghostToUnified);
  } catch (e) {
    console.error("[mergedPosts] Ghost fetch failed:", e);
    return [];
  }
}

/**
 * 按语言过滤统一格式文章
 */
export function filterUnifiedByLang(
  posts: UnifiedPost[],
  lang: Lang
): UnifiedPost[] {
  return posts.filter(p => {
    if (lang === "zh-CN") {
      return !p.lang || p.lang === "zh-CN";
    }
    return p.lang === lang;
  });
}

/**
 * 合并本地和 Ghost 文章，按时间倒序排列
 */
export function mergePosts(
  localPosts: UnifiedPost[],
  ghostPosts: UnifiedPost[]
): UnifiedPost[] {
  const all = [...localPosts, ...ghostPosts];

  // 按发布时间倒序
  all.sort((a, b) => b.pubDatetime.getTime() - a.pubDatetime.getTime());

  // 去重（如果同一篇文章同时存在于本地和 Ghost，保留本地版）
  // 使用 id 作为主键，title+lang 作为 fallback 防止跨源重复
  const seenIds = new Set<string>();
  const seenTitleLang = new Set<string>();
  return all.filter(p => {
    if (seenIds.has(p.id)) return false;
    seenIds.add(p.id);

    const titleKey = `${p.lang}:${p.title.toLowerCase().trim()}`;
    if (seenTitleLang.has(titleKey)) return false;
    seenTitleLang.add(titleKey);

    return true;
  });
}
