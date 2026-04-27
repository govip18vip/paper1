// src/utils/btgPostDetail.ts
// 共享：按 category + slug + lang 加载 btgPost 详情 + 渲染 + 相关
// 给 6 个分类详情路由复用，避免重复代码

import { toHTML } from "@portabletext/to-html";
import { sanityClient, sanityImageUrl } from "@/utils/sanity";
import { injectGlossaryLinks } from "@/utils/glossaryLinker";
import { LANG_TO_PATH, type Lang } from "@/i18n/ui";
import {
  buildBtgPostHref,
  isValidBtgCategory,
  articleTypeToCategoryFallback,
  type BtgCategory,
} from "@/utils/btgPostRoute";

export interface LoadedBtgPost {
  redirectTo?: string;
  notFound?: boolean;
  post?: any;
  bodyHtml?: string;
  related?: any[];
  category?: BtgCategory;
}

/**
 * 加载并渲染指定分类下的文章。
 *
 * 主要逻辑：
 * 1. 查 slug 对应文档（要求 draft != true）
 * 2. 校验文档的 category 字段（或 articleType 推断）匹配 URL 分类
 *    若不匹配 → 301 重定向到正确的分类 URL（防 URL hijacking + 一致性）
 * 3. 校验 lang 对应（多语言路由会传 lang，找不到 redirect 默认）
 * 4. 渲染 Portable Text → HTML + 加 glossary 链接
 * 5. 拉取相关文章（同语言、tag 重叠）
 */
export async function loadBtgPostDetail(opts: {
  slug: string;
  expectedCategory: BtgCategory;
  expectedLang?: Lang;        // 缺省 zh-CN
}): Promise<LoadedBtgPost> {
  const { slug } = opts;
  const expectedLang: Lang = opts.expectedLang || "zh-CN";

  if (!slug) return { notFound: true };

  // 1. 查文档
  const post = await sanityClient.fetch(
    `*[_type == "btgPost" && slug.current == $slug && draft != true][0] {
      _id, title, slug, lang, articleType, description,
      coverImage, body, pubDatetime, modDatetime,
      tags, faqs, steps, sourceUrl, sourceName,
      category, translationKey,
      "author": author->{ name, bio, avatar, twitter }
    }`,
    { slug },
  );

  if (!post) return { notFound: true };

  // 2. 校验语言：若 URL lang 与文档 lang 不一致 → 重定向到正确语言版本
  if (post.lang && post.lang !== expectedLang) {
    const correctHref = buildBtgPostHref(
      post.lang,
      post.category,
      slug,
      post.articleType,
    );
    return { redirectTo: correctHref };
  }

  // 3. 校验分类：若 URL 分类与文档 category 不一致 → 重定向
  const docCategory = isValidBtgCategory(post.category)
    ? (post.category as BtgCategory)
    : articleTypeToCategoryFallback(post.articleType);
  if (docCategory !== opts.expectedCategory) {
    const correctHref = buildBtgPostHref(
      post.lang || "zh-CN",
      docCategory,
      slug,
      post.articleType,
    );
    return { redirectTo: correctHref };
  }

  // 4. 渲染 body
  const rawHtml = post.body
    ? toHTML(post.body, {
        components: {
          marks: {
            link: ({ children, value }: any) => {
              const href = value?.href || "#";
              const isExternal = /^https?:\/\//i.test(href);
              const target = isExternal ? ' target="_blank" rel="noopener nofollow"' : "";
              return `<a href="${href}"${target}>${children}</a>`;
            },
          },
          types: {
            image: ({ value }: any) => {
              // 优先 Sanity asset._ref，否则用外链 url
              const url = value?.asset?._ref
                ? sanityImageUrl(value.asset._ref, { width: 800 })
                : (value?.url || "");
              const alt = value?.alt || post.title;
              return url
                ? `<figure><img src="${url}" alt="${alt}" loading="lazy" decoding="async" /></figure>`
                : "";
            },
          },
        },
      })
    : "";
  const bodyHtml = injectGlossaryLinks(rawHtml);

  // 5. 相关文章
  const tagList = Array.isArray(post.tags) ? post.tags : [];
  const related = tagList.length > 0
    ? await sanityClient.fetch(
        `*[_type == "btgPost" && draft != true && lang == $lang
           && slug.current != $slug
           && count((tags[])[@ in $tags]) > 0
         ] | order(pubDatetime desc) [0...4] {
          _id, title, slug, lang, description, coverImage,
          pubDatetime, tags, category, articleType
        }`,
        { lang: post.lang ?? expectedLang, slug, tags: tagList },
      )
    : [];

  return { post, bodyHtml, related, category: docCategory };
}
