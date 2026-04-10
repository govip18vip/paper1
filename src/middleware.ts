// src/middleware.ts
// ─────────────────────────────────────────────────────────────
// Astro Middleware — SEO 基础处理 + API 速率限制
// 1. Trailing slash 统一（带 slash → 301 去掉）
// 2. API 速率限制（/api/* 端点）
// 3. 安全头注入
// ─────────────────────────────────────────────────────────────
import { defineMiddleware } from "astro:middleware";

// ── Simple in-memory rate limiter for API routes ──────────────
const apiRateMap = new Map<string, { count: number; reset: number }>();
const API_RATE_LIMIT = 30;       // 30 requests
const API_RATE_WINDOW = 60_000;  // per 1 minute

function isApiRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = apiRateMap.get(ip);
  if (!entry || now > entry.reset) {
    apiRateMap.set(ip, { count: 1, reset: now + API_RATE_WINDOW });
    return false;
  }
  entry.count++;
  return entry.count > API_RATE_LIMIT;
}

// Periodic cleanup to prevent memory leak (every 5 min)
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of apiRateMap) {
    if (now > val.reset) apiRateMap.delete(key);
  }
}, 5 * 60_000);

export const onRequest = defineMiddleware((context, next) => {
  const url = new URL(context.request.url);
  const { pathname } = url;

  // ── 1. 去掉尾部斜杠（根路径除外）──────────────────────────
  if (pathname !== "/" && pathname.endsWith("/")) {
    const clean = pathname.slice(0, -1) + url.search;
    return context.redirect(clean, 301);
  }

  // ── 2. API 速率限制 ────────────────────────────────────────
  if (pathname.startsWith("/api/")) {
    const ip = context.clientAddress || context.request.headers.get("x-forwarded-for") || "unknown";
    if (isApiRateLimited(ip)) {
      return new Response(JSON.stringify({ error: "rate_limited" }), {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": "60",
        },
      });
    }
  }

  return next();
});
