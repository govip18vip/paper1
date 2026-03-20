// src/utils/getTranslations.ts
// ─────────────────────────────────────────────────────────────
// Finds all language versions of a post by its `translationKey`
// frontmatter field.
//
// Usage in PostDetails.astro:
//   const translations = await getTranslations(post, allPosts);
// ─────────────────────────────────────────────────────────────

import type { CollectionEntry } from "astro:content";
import { getPath } from "./getPath";
import { LANGUAGES } from "@/i18n/ui";
import type { Lang } from "@/i18n/ui";

export interface TranslationEntry {
  lang: Lang;
  langLabel: string;
  title: string;
  slug: string;
  href: string;
  isCurrent: boolean;
}

/**
 * Given a post and the full list of posts,
 * returns all language versions of that post.
 *
 * Matching logic (in order):
 *  1. Exact `translationKey` frontmatter field match
 *  2. Slug prefix match (e.g. "bitcoin-guide-en", "bitcoin-guide-zh-cn"
 *     both share prefix "bitcoin-guide")
 */
export async function getTranslations(
  currentPost: CollectionEntry<"blog">,
  allPosts: CollectionEntry<"blog">[]
): Promise<TranslationEntry[]> {
  const currentKey = (currentPost.data as any).translationKey as string | undefined;
  const currentLang = (currentPost.data as any).lang as Lang | undefined;

  if (!currentKey && !currentLang) return [];

  // Find siblings
  const siblings = allPosts.filter(p => {
    if (p.id === currentPost.id) return false;
    const k = (p.data as any).translationKey as string | undefined;
    const l = (p.data as any).lang as string | undefined;

    // Must have a language set
    if (!l || !(l in LANGUAGES)) return false;

    // Match by translationKey if available
    if (currentKey && k) return k === currentKey;

    return false;
  });

  if (siblings.length === 0) return [];

  // Build result including current post
  const allVersions = [currentPost, ...siblings].map(p => {
    const lang = ((p.data as any).lang as Lang) ?? "zh-CN";
    return {
      lang,
      langLabel: LANGUAGES[lang] ?? lang,
      title: p.data.title,
      slug: p.id,
      href: getPath(p.id, p.filePath),
      isCurrent: p.id === currentPost.id,
    } satisfies TranslationEntry;
  });

  // Sort by canonical order
  const order: Lang[] = ["zh-CN", "zh-TW", "en", "es", "pt"];
  allVersions.sort((a, b) => order.indexOf(a.lang) - order.indexOf(b.lang));

  return allVersions;
}
