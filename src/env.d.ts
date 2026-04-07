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

  // ── Sanity CMS ────────────────────────────────────
  /** Sanity project ID — public, safe for client */
  readonly PUBLIC_SANITY_PROJECT_ID: string;
  /** Sanity dataset name, e.g. "production" */
  readonly PUBLIC_SANITY_DATASET: string;
  /** Sanity API version string, e.g. "2025-04-07" */
  readonly PUBLIC_SANITY_API_VERSION: string;
  /** Sanity read-only token — used during build for draft content */
  readonly SANITY_READ_TOKEN?: string;
  /** Sanity write token — server-side Python automation ONLY, never expose */
  readonly SANITY_WRITE_TOKEN?: string;

  // ── Email Subscription (Resend) ───────────────────
  /** Resend API secret key — server-side only, never expose to client */
  readonly RESEND_API_KEY?: string;
  /** Resend Audience ID for subscriber list management */
  readonly RESEND_AUDIENCE_ID?: string;
  /** Verified sender email address (requires domain verification in Resend) */
  readonly RESEND_FROM_EMAIL?: string;
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
