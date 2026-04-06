// src/i18n/detect.ts
// ─────────────────────────────────────────────────────────────
// 客户端语言引擎（精简版）
//
// 改动点：
//  • 语言切换 = 导航到 /en/ 、/zh-tw/ 等真实 URL（全页刷新）
//  • 不再需要客户端文章过滤（服务端静态页面已按语言渲染）
//  • 仍然负责：UI 文字替换 / lang 按钮高亮 / localStorage 记忆
// ─────────────────────────────────────────────────────────────

import { UI, BROWSER_LANG_MAP, HTML_LANG, DEFAULT_LANG, LANGUAGES,
         LANG_PATH_MAP, LANG_TO_PATH, LANG_PATH_SEGMENTS } from "./ui";
import type { Lang } from "./ui";

// ── 从 URL 路径检测语言 ────────────────────────────────────────
function detectLangFromPath(): Lang {
  const firstSeg = window.location.pathname.split("/").filter(Boolean)[0] ?? "";
  if (firstSeg in LANG_PATH_MAP) return LANG_PATH_MAP[firstSeg];
  // 无语言前缀 = 默认语言（zh-CN），路径即语言，不应被浏览器语言覆盖
  return DEFAULT_LANG;
}

function detectLang(): Lang {
  // URL 路径前缀决定语言（根路径 = zh-CN）
  return detectLangFromPath();
}

// ── 切换语言（导航到对应静态页面）────────────────────────────
export function switchLang(targetLang: Lang): void {
  // 记住偏好
  localStorage.setItem("cn-lang", targetLang);

  // 计算目标路径：去掉当前路径里的语言前缀，加上新的
  const currentPath = window.location.pathname;
  let cleanPath = currentPath;
  for (const seg of LANG_PATH_SEGMENTS) {
    if (currentPath === `/${seg}` || currentPath.startsWith(`/${seg}/`)) {
      cleanPath = currentPath.slice(seg.length + 1) || "/";
      break;
    }
  }

  // 如果当前在文章详情页（/posts/...），切语言去该语言首页
  // 因为文章 URL 含语言目录（/posts/en/slug/），需要特殊处理
  if (cleanPath.startsWith("/posts/")) {
    // 检查 /posts/ 下第一段是否是语言目录
    const postParts = cleanPath.replace(/^\/posts\//, "").split("/");
    if (postParts[0] in LANG_PATH_MAP) {
      // 是带语言目录的文章，切到目标语言首页
      const targetPathSeg = LANG_TO_PATH[targetLang];
      window.location.href = targetPathSeg ? `/${targetPathSeg}/` : "/";
      return;
    }
  }

  const targetPathSeg = LANG_TO_PATH[targetLang];
  const newPath = targetPathSeg
    ? `/${targetPathSeg}${cleanPath === "/" ? "" : cleanPath}`
    : cleanPath;

  window.location.href = newPath || "/";
}

// ── 更新 DOM 文字 ─────────────────────────────────────────────
function applyLang(lang: Lang): void {
  const dict = UI[lang] ?? UI[DEFAULT_LANG];

  // 1. <html lang="">
  document.documentElement.lang = HTML_LANG[lang];

  // 2. <meta name="description" data-i18n>
  const metaDesc = document.querySelector<HTMLMetaElement>('meta[name="description"][data-i18n]');
  if (metaDesc) {
    const k = metaDesc.getAttribute("data-i18n")!;
    metaDesc.content = dict[k] ?? metaDesc.content;
  }

  // 3. [data-i18n] 元素文字
  document.querySelectorAll<HTMLElement>("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n")!;
    const text = dict[key];
    if (text !== undefined) el.textContent = text;
  });

  // 4. [data-i18n-attr="key|attr"] 属性
  document.querySelectorAll<HTMLElement>("[data-i18n-attr]").forEach(el => {
    const [key, attr] = (el.getAttribute("data-i18n-attr") ?? "").split("|");
    const text = dict[key];
    if (text !== undefined && attr) el.setAttribute(attr, text);
  });

  // 5. 高亮当前语言按钮
  document.querySelectorAll<HTMLElement>("[data-lang-btn]").forEach(btn => {
    const btnLang = btn.getAttribute("data-lang-btn");
    btn.setAttribute("aria-pressed", btnLang === lang ? "true" : "false");
    btn.classList.toggle("active", btnLang === lang);
  });

  // 6. 派发事件
  window.dispatchEvent(new CustomEvent("langchange", { detail: { lang } }));
}

// ── 初始化 ───────────────────────────────────────────────────
function init(): void {
  const lang = detectLang();
  applyLang(lang);
}

init();
document.addEventListener("astro:after-swap", init);

// 全局暴露（给内联 onclick 使用，但 LeftSidebar 已改为 <a> 标签，此处保留兼容）
(window as any).__switchLang = switchLang;
