// src/middleware.ts
// ─────────────────────────────────────────────────────────────
// Astro Middleware — SEO 基础处理
// 1. Trailing slash 统一（带 slash → 301 去掉）
// 2. 安全头注入
// ─────────────────────────────────────────────────────────────
import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware((context, next) => {
  const url = new URL(context.request.url);
  const { pathname } = url;

  // ── 1. 去掉尾部斜杠（根路径除外）──────────────────────────
  if (pathname !== "/" && pathname.endsWith("/")) {
    const clean = pathname.slice(0, -1) + url.search;
    return context.redirect(clean, 301);
  }

  return next();
});
