export const SITE = {
  website: "https://bitaigen.com/",
  author: "Bitaigen",
  profile: "https://bitaigen.com/about",
  desc: "Professional blockchain news platform — Bitcoin price analysis, exchange tutorials, crypto wallet security guides, DeFi protocol deep dives. 专业区块链资讯平台。",
  title: "Bitaigen",
  ogImage: "astropaper-og.jpg",
  lightAndDarkMode: true,
  postPerIndex: 9,
  postPerPage: 12,
  scheduledPostMargin: 15 * 60 * 1000,
  showArchives: true,
  showBackButton: true,
  editPost: {
    enabled: false,
    text: "建议修改",
    url: "https://github.com/your-repo/edit/main/",
  },
  dynamicOgImage: true,
  dir: "ltr",
  lang: "zh-CN",
  timezone: "Asia/Shanghai",

  // ── Social / Contact ──────────────────────────────────
  telegram: "https://t.me/AllenAmbrose",
  twitter: "https://x.com/tanfyoo",

  // ── Analytics ──────────────────────────────────────────
  // Plausible: set domain to enable (e.g., "bitaigen.com")
  plausibleDomain: "",
  // Google Analytics 4: 读取环境变量 PUBLIC_GA_ID（Vercel Dashboard 中配置）
  googleAnalyticsId: import.meta.env.PUBLIC_GA_ID ?? "",

  // ── Search Engine Verification ─────────────────────────
  // 读取环境变量；在 Vercel Dashboard → Settings → Environment Variables 中配置
  googleSiteVerification: import.meta.env.PUBLIC_GOOGLE_SITE_VERIFICATION ?? "",
  bingSiteVerification:   import.meta.env.PUBLIC_BING_SITE_VERIFICATION ?? "",
  baiduSiteVerification: "",
  yandexSiteVerification: import.meta.env.PUBLIC_YANDEX_SITE_VERIFICATION ?? "",
} as const;
