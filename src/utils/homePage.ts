// src/utils/homePage.ts
// ─────────────────────────────────────────────────────────────
// 首页数据准备工具：按语言过滤文章，返回首页所需的各种文章列表。
// 被 index.astro 和 [lang]/index.astro 共同使用。
// ─────────────────────────────────────────────────────────────

import type { CollectionEntry } from "astro:content";
import getSortedPosts from "./getSortedPosts";
import { DEFAULT_LANG, type Lang } from "@/i18n/ui";

/**
 * 按语言过滤文章：
 * - 默认语言（zh-CN）：显示无 lang 字段的文章 + lang=zh-CN 的文章
 * - 其他语言：仅显示 lang=xx 的文章
 */
export function filterPostsByLang(
  posts: CollectionEntry<"blog">[],
  lang: Lang
): CollectionEntry<"blog">[] {
  return getSortedPosts(posts).filter(p => {
    const postLang = (p.data as any).lang as string | undefined;
    if (lang === DEFAULT_LANG) {
      return !postLang || postLang === DEFAULT_LANG;
    }
    return postLang === lang;
  });
}

export const TUTORIAL_TAGS = ["docs", "教程", "tutorial", "beginner", "新手", "新手入门"];

export interface HomePageData {
  hero: CollectionEntry<"blog"> | undefined;
  thumbPosts: CollectionEntry<"blog">[];
  listPosts: CollectionEntry<"blog">[];
  newsPosts: CollectionEntry<"blog">[];
  hotPosts: CollectionEntry<"blog">[];
  tutorialPosts: CollectionEntry<"blog">[];
  total: number;
}

export function buildHomePageData(
  allPosts: CollectionEntry<"blog">[],
  lang: Lang
): HomePageData {
  const posts = filterPostsByLang(allPosts, lang);

  const featured = posts.filter(p => p.data.featured);
  const [hero, ...restFeatured] = featured.length > 0 ? featured : posts;
  const thumbPosts = (
    restFeatured.length >= 4 ? restFeatured : posts.filter(p => p !== hero)
  ).slice(0, 4);
  const listPosts = posts
    .filter(p => p !== hero && !thumbPosts.includes(p))
    .slice(0, 12);
  const mainShown = new Set([hero, ...thumbPosts, ...listPosts].filter(Boolean));
  const newsPosts = posts.filter(p => !mainShown.has(p)).slice(0, 8);
  const hotPosts = posts
    .filter(p => !mainShown.has(p) && !newsPosts.includes(p))
    .slice(0, 7);
  const tutorialPosts = posts
    .filter(p =>
      p.data.tags?.some(t =>
        TUTORIAL_TAGS.includes(t.toLowerCase())
      )
    )
    .slice(0, 5);

  return { hero, thumbPosts, listPosts, newsPosts, hotPosts, tutorialPosts, total: posts.length };
}
