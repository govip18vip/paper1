export const SITE = {
  website: "https://bitaigen.com/",
  author: "Bitaigen",
  profile: "https://bitaigen.com/about",
  desc: "Professional blockchain news platform — Bitcoin price analysis, exchange tutorials, crypto wallet security guides, DeFi protocol deep dives. 专业区块链资讯平台。",
  title: "Bitaigen",
  ogImage: "og-crypto.jpg",
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
  // Google Analytics: set measurement ID to enable (e.g., "G-XXXXXXXXXX")
  googleAnalyticsId: "",

  // ── Search Engine Verification ─────────────────────────
  // Paste the content attribute value from the verification meta tag
  googleSiteVerification: "",
  bingSiteVerification: "",
  baiduSiteVerification: "",
  yandexSiteVerification: "",
} as const;
