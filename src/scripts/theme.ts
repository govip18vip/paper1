// src/scripts/theme.ts
// 健壮的主题切换：始终从 DOM 读取当前 data-theme，不依赖闭包变量
// 兼容：首次加载、Astro View Transitions、系统偏好变化

const THEME = "theme";
const LIGHT = "light";
const DARK = "dark";

function getCurrentTheme(): string {
  // 优先从 DOM 读（保证与已应用的 CSS 一致）
  const root = document.documentElement;
  const fromDom = root.getAttribute("data-theme");
  if (fromDom === LIGHT || fromDom === DARK) return fromDom;

  // 回退：localStorage
  try {
    const stored = localStorage.getItem(THEME);
    if (stored === LIGHT || stored === DARK) return stored;
  } catch {}

  // 兜底：系统偏好
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? DARK : LIGHT;
}

function applyTheme(theme: string): void {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);

  try {
    localStorage.setItem(THEME, theme);
  } catch {}

  // 同步 window.theme
  if (!window.theme) (window as any).theme = {};
  window.theme.themeValue = theme;

  // 同步 button aria
  const btn = document.querySelector<HTMLElement>("#theme-btn");
  if (btn) btn.setAttribute("aria-label", theme);

  // 同步 meta theme-color（移动端浏览器顶栏颜色）
  try {
    const computed = window.getComputedStyle(document.body);
    const bg = computed.backgroundColor;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", bg);
  } catch {}
}

function toggleTheme(): void {
  const next = getCurrentTheme() === DARK ? LIGHT : DARK;
  applyTheme(next);
}

// 用 document 级事件代理，按钮在 DOM 何时出现都能命中（防 ClientRouter 时序问题）
function onDocumentClick(ev: Event): void {
  const target = ev.target as HTMLElement | null;
  if (!target) return;
  // 命中 #theme-btn 或它的子元素（svg/span 等）
  const btn = target.closest("#theme-btn");
  if (btn) {
    ev.preventDefault();
    toggleTheme();
  }
}

// 暴露给外部（兼容旧 API）
(window as any).theme = {
  ...(window as any).theme,
  themeValue: getCurrentTheme(),
  getTheme: getCurrentTheme,
  setTheme: applyTheme,
  setPreference: () => applyTheme(getCurrentTheme()),
  reflectPreference: () => applyTheme(getCurrentTheme()),
  toggle: toggleTheme,
};

// 初次和每次视图过渡都同步一次（保证 data-theme 与 localStorage 一致）
function syncOnNavigation(): void {
  // 视图过渡后重新读 DOM；如果没有 data-theme 属性（罕见），按当前 localStorage 应用
  const current = document.documentElement.getAttribute("data-theme");
  if (current !== LIGHT && current !== DARK) {
    applyTheme(getCurrentTheme());
  }
}

// 全局只绑定一次（document 上的代理点击不需要重新绑定）
if (!(window as any).__themeClickBound) {
  document.addEventListener("click", onDocumentClick, { capture: true });
  (window as any).__themeClickBound = true;
}

syncOnNavigation();
document.addEventListener("astro:after-swap", syncOnNavigation);

// 跟随系统主题变化（仅当用户没显式选择过）
const mq = window.matchMedia("(prefers-color-scheme: dark)");
const onSystemChange = (e: MediaQueryListEvent | MediaQueryList) => {
  let stored: string | null = null;
  try { stored = localStorage.getItem(THEME); } catch {}
  // 用户已显式选过就不动
  if (stored === LIGHT || stored === DARK) return;
  applyTheme(e.matches ? DARK : LIGHT);
};
if (mq.addEventListener) {
  mq.addEventListener("change", onSystemChange);
} else if ((mq as any).addListener) {
  // Safari < 14
  (mq as any).addListener(onSystemChange);
}

// View transition 之前保留 theme-color，避免 Android 浏览器顶栏闪烁
document.addEventListener("astro:before-swap", (event: any) => {
  try {
    const bg = document.querySelector('meta[name="theme-color"]')?.getAttribute("content");
    if (bg && event.newDocument) {
      event.newDocument
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute("content", bg);
    }
  } catch {}
});
