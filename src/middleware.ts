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

  // Trailing slash 由 astro.config.ts trailingSlash: "never" 原生处理
  // 不在 middleware 做 301 重定向，避免预渲染时把页面变成空 redirect

  // ── API 速率限制 ────────────────────────────────────────
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
