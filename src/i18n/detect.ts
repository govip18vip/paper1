// src/i18n/detect.ts
// ─────────────────────────────────────────────────────────────
// Client-side language engine.
// Import this ONCE in Layout.astro as a deferred script.
//
// What it does:
//  1. Detects language from: URL ?hl= → localStorage → navigator.language
//  2. Updates document.documentElement.lang
//  3. Replaces all [data-i18n="key"] element text content
//  4. Replaces all [data-i18n-attr="key|attr"] attributes
//  5. Marks the active lang button in the sidebar
//  6. Persists choice to localStorage
//  7. Runs on every astro:after-swap (view transitions)
// ─────────────────────────────────────────────────────────────

import { UI, BROWSER_LANG_MAP, HTML_LANG, DEFAULT_LANG, LANGUAGES } from "./ui";
import type { Lang } from "./ui";

// ── Detect language ───────────────────────────────────────────
function detectLang(): Lang {
  // 1. URL param (highest priority — user clicked a lang button)
  const urlLang = new URLSearchParams(window.location.search).get("hl");
  if (urlLang && urlLang in LANGUAGES) return urlLang as Lang;

  // 2. localStorage (returning user with saved preference)
  const stored = localStorage.getItem("cn-lang");
  if (stored && stored in LANGUAGES) return stored as Lang;

  // 3. Browser language (first-time visitor auto-detect)
  const nav = navigator.language || (navigator as any).userLanguage || "";
  // Try exact match first, then prefix match
  if (BROWSER_LANG_MAP[nav]) return BROWSER_LANG_MAP[nav];
  const prefix = nav.split("-")[0];
  if (BROWSER_LANG_MAP[prefix]) return BROWSER_LANG_MAP[prefix];

  return DEFAULT_LANG;
}

// ── Apply language to DOM ─────────────────────────────────────
function applyLang(lang: Lang): void {
  const dict = UI[lang] ?? UI[DEFAULT_LANG];

  // 1. Update <html lang="...">
  document.documentElement.lang = HTML_LANG[lang];

  // 2. Update <meta name="description"> if it has data-i18n
  const metaDesc = document.querySelector<HTMLMetaElement>('meta[name="description"][data-i18n]');
  if (metaDesc) {
    const k = metaDesc.getAttribute("data-i18n")!;
    metaDesc.content = dict[k] ?? metaDesc.content;
  }

  // 3. Replace text content of all [data-i18n] elements
  document.querySelectorAll<HTMLElement>("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n")!;
    const text = dict[key];
    if (text !== undefined) el.textContent = text;
  });

  // 4. Replace attributes [data-i18n-attr="key|attrName"]
  document.querySelectorAll<HTMLElement>("[data-i18n-attr]").forEach(el => {
    const val = el.getAttribute("data-i18n-attr")!;
    const [key, attr] = val.split("|");
    const text = dict[key];
    if (text !== undefined && attr) el.setAttribute(attr, text);
  });

  // 5. Update lang switcher button states
  document.querySelectorAll<HTMLButtonElement>("[data-lang-btn]").forEach(btn => {
    const btnLang = btn.getAttribute("data-lang-btn");
    btn.setAttribute("aria-pressed", btnLang === lang ? "true" : "false");
    btn.classList.toggle("active", btnLang === lang);
  });

  // 6. Store to localStorage
  localStorage.setItem("cn-lang", lang);

  // 7. Update URL ?hl= param without page reload (for bookmarking)
  const url = new URL(window.location.href);
  if (lang === DEFAULT_LANG) {
    url.searchParams.delete("hl");
  } else {
    url.searchParams.set("hl", lang);
  }
  history.replaceState(null, "", url.toString());

  // 8. Dispatch custom event so other components can react
  window.dispatchEvent(new CustomEvent("langchange", { detail: { lang } }));
}

// ── Public API ────────────────────────────────────────────────
export function switchLang(lang: Lang): void {
  applyLang(lang);
}

// ── Init ─────────────────────────────────────────────────────
function init(): void {
  const lang = detectLang();
  applyLang(lang);
}

// Run on first load
init();

// Run on every Astro view transition
document.addEventListener("astro:after-swap", init);

// Make switchLang globally accessible for inline onclick handlers
(window as any).__switchLang = switchLang;
