/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly GHOST_URL: string;
  readonly GHOST_CONTENT_KEY: string;
  readonly GHOST_ADMIN_KEY?: string;

  // ── Analytics & SEO ──────────────────────────────
  /** Google Analytics 4 Measurement ID, e.g. G-XXXXXXXXXX */
  readonly PUBLIC_GA_ID?: string;
  /** Google Search Console meta verification value */
  readonly PUBLIC_GOOGLE_SITE_VERIFICATION?: string;
  /** Bing Webmaster Tools meta verification value */
  readonly PUBLIC_BING_SITE_VERIFICATION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  theme?: {
    themeValue: string;
    setPreference: () => void;
    reflectPreference: () => void;
    getTheme: () => string;
    setTheme: (val: string) => void;
  };
  __i18nDict?: Record<string, Record<string, string>>;
  __i18nDefault?: string;
  __switchLang?: (lang: string) => void;
}
