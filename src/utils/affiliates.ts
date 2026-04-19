// src/utils/affiliates.ts
// ═══════════════════════════════════════════════════════════════
// 广告/邀请码中央解析器
//   - 按用户语言路由到正确的 Binance / OKX 本地化域名
//   - 中国大陆（zh-CN）优先大陆 APK 直链，绕过应用商店限制
//   - 支持币种深链（/trade/BTC_USDT）自动拼 ref
//   - 本地化 CTA 文案（5 语言 native 翻译，不是谷歌翻译腔）
// ═══════════════════════════════════════════════════════════════

import type { Lang } from "@/i18n/ui";

const BINANCE_REF = "B2345";
const OKX_REF = "B2345";

// ── 大陆 APK 下载直链（无需翻墙） ───────────────────────
export const BINANCE_APK_CN = "https://basebiance.com/binanceapkcn";
export const BINANCE_APK_INTL = "https://basebiance.com/binanceapken/";
export const BINANCE_LOGO = "https://basebiance.com/content/images/2025/04/1HH5201407.png";

// ── Binance 本地化注册路径（官方域名按语言分发） ─────────
// Binance 接受这些 locale 路径段
const BINANCE_LOCALE: Record<Lang, string> = {
  "zh-CN": "zh-CN",
  "zh-TW": "zh-TC", // Binance 台湾繁体用 zh-TC
  "en": "en",
  "es": "es-LA",    // 拉美西语（非欧洲 es-ES）
  "pt": "pt-BR",    // 巴西葡语
};

// ── OKX 本地化注册路径 ─────────────────────────────────
const OKX_LOCALE: Record<Lang, string> = {
  "zh-CN": "cn",    // OKX 大陆用 /cn/join/
  "zh-TW": "zh-hant",
  "en": "en",
  "es": "es",
  "pt": "pt-br",
};

// ═══════════════════════════════════════════════════════════════
// Binance 链接生成器
// ═══════════════════════════════════════════════════════════════

/** 注册链接（首选） */
export function binanceRegister(lang: Lang): string {
  const locale = BINANCE_LOCALE[lang] ?? "en";
  return `https://www.binance.com/${locale}/register?ref=${BINANCE_REF}`;
}

/** 交易深链（落某个币对的盘口页） */
export function binanceTrade(symbol: string, lang: Lang = "en"): string {
  const sym = symbol.toUpperCase();
  // 交易页不走 locale 路径（Binance 会自动按 cookie 切换），保留参数即可
  return `https://www.binance.com/trade/${sym}_USDT?layout=pro&ref=${BINANCE_REF}&type=spot`;
}

/** APK 下载链接：中文用户得到大陆版/国际版二选一，其他语言只返回国际 Play Store */
export function binanceDownload(lang: Lang): { primary: string; secondary?: string; label: string } {
  if (lang === "zh-CN") {
    return {
      primary: BINANCE_APK_CN,
      secondary: BINANCE_APK_INTL,
      label: "download_cn",
    };
  }
  if (lang === "zh-TW") {
    return {
      primary: BINANCE_APK_INTL,
      label: "download_intl",
    };
  }
  // es / pt / en → 官方下载页（让 Binance 按地区分发 Play/App Store）
  return {
    primary: `https://www.binance.com/${BINANCE_LOCALE[lang]}/download`,
    label: "download_official",
  };
}

/** 本站 /go/binance 短链（内部转跳页，埋点） */
export function binanceLanding(lang: Lang): string {
  // zh-CN 走中文落地页；其他语言走英文落地页（复用 /go/binance 同一文件，客户端脚本识别）
  return `/go/binance${lang !== "zh-CN" && lang !== undefined ? `?lang=${lang}` : ""}`;
}

// ═══════════════════════════════════════════════════════════════
// OKX 链接生成器
// ═══════════════════════════════════════════════════════════════

export function okxRegister(lang: Lang): string {
  const locale = OKX_LOCALE[lang] ?? "en";
  return `https://www.okx.com/${locale}/join/${OKX_REF}`;
}

export function okxTrade(symbol: string, lang: Lang = "en"): string {
  const sym = symbol.toUpperCase();
  const locale = OKX_LOCALE[lang] ?? "en";
  return `https://www.okx.com/${locale}/trade-spot/${sym.toLowerCase()}-usdt?channelId=${OKX_REF}`;
}

export function okxLanding(_lang: Lang): string {
  return "/go/okx";
}

// ═══════════════════════════════════════════════════════════════
// 5 语言本地化 CTA 文案（native 母语翻译，不是机翻）
// ═══════════════════════════════════════════════════════════════

type CTAText = {
  trade_btc: string;           // "在币安交易 BTC"
  trade_coin: string;          // "在币安交易 {coin}"（{coin} 占位）
  register_binance: string;    // "注册币安"
  register_okx: string;        // "注册 OKX"
  referral_hint: string;       // "邀请码 B2345 享最高折扣"
  download_cn: string;         // "大陆版 APK 直接下载"
  download_intl: string;       // "下载国际版 APP"
  download_official: string;   // "Download official app"
  learn_more: string;          // "了解更多 →"
  disclaimer: string;          // 本站合作关系说明
  cta_headline_tutorial: string;// 教程文顶部 CTA 标题
  cta_headline_market: string;  // 行情文 CTA 标题
  cta_headline_news: string;    // 新闻文 CTA 标题
};

export const AFFILIATE_TEXT: Record<Lang, CTAText> = {
  "zh-CN": {
    trade_btc: "在币安交易比特币",
    trade_coin: "在币安交易 {coin}",
    register_binance: "注册币安账户",
    register_okx: "注册 OKX 账户",
    referral_hint: "邀请码 B2345，享平台最高手续费折扣",
    download_cn: "大陆版 APK · 免翻墙直接下载",
    download_intl: "下载国际版 App",
    download_official: "下载官方 App",
    learn_more: "查看详情 →",
    disclaimer: "本站与币安、OKX 存在推广合作，投资有风险请自行决策。",
    cta_headline_tutorial: "跟着教程一起动手？先开好账户",
    cta_headline_market: "想交易本文提到的币种？",
    cta_headline_news: "想第一时间交易相关币种？",
  },
  "zh-TW": {
    trade_btc: "在幣安交易比特幣",
    trade_coin: "在幣安交易 {coin}",
    register_binance: "註冊幣安帳戶",
    register_okx: "註冊 OKX 帳戶",
    referral_hint: "邀請碼 B2345，享平台最高手續費折扣",
    download_cn: "APK 直接下載",
    download_intl: "下載國際版 App",
    download_official: "下載官方 App",
    learn_more: "查看詳情 →",
    disclaimer: "本站與幣安、OKX 存在推廣合作，投資有風險請自行決策。",
    cta_headline_tutorial: "跟著教學一起動手？先開好帳戶",
    cta_headline_market: "想交易本文提到的幣種？",
    cta_headline_news: "想第一時間交易相關幣種？",
  },
  "en": {
    trade_btc: "Trade Bitcoin on Binance",
    trade_coin: "Trade {coin} on Binance",
    register_binance: "Open a Binance account",
    register_okx: "Open an OKX account",
    referral_hint: "Use code B2345 to lock in the maximum fee discount",
    download_cn: "Download APK (CN)",
    download_intl: "Download the mobile app",
    download_official: "Download the official app",
    learn_more: "See details →",
    disclaimer: "This site has referral partnerships with Binance and OKX. Crypto trading is risky; do your own research.",
    cta_headline_tutorial: "Ready to follow along? Open an account first",
    cta_headline_market: "Want to trade the coins mentioned here?",
    cta_headline_news: "Trade the assets covered in this story",
  },
  "es": {
    trade_btc: "Opera Bitcoin en Binance",
    trade_coin: "Opera {coin} en Binance",
    register_binance: "Abrir cuenta en Binance",
    register_okx: "Abrir cuenta en OKX",
    referral_hint: "Código B2345 — máximo descuento en comisiones",
    download_cn: "Descargar APK",
    download_intl: "Descargar la app móvil",
    download_official: "Descargar la app oficial",
    learn_more: "Ver más →",
    disclaimer: "Este sitio tiene acuerdos de referido con Binance y OKX. Invertir en cripto conlleva riesgo; haz tu propia investigación.",
    cta_headline_tutorial: "¿Listo para seguir la guía? Abre tu cuenta",
    cta_headline_market: "¿Quieres operar las monedas que mencionamos?",
    cta_headline_news: "Opera los activos de esta noticia",
  },
  "pt": {
    trade_btc: "Negocie Bitcoin na Binance",
    trade_coin: "Negocie {coin} na Binance",
    register_binance: "Abrir conta na Binance",
    register_okx: "Abrir conta na OKX",
    referral_hint: "Código B2345 — desconto máximo em taxas",
    download_cn: "Baixar APK",
    download_intl: "Baixar o app móvel",
    download_official: "Baixar o app oficial",
    learn_more: "Ver detalhes →",
    disclaimer: "Este site possui parcerias de indicação com Binance e OKX. Investir em cripto envolve risco; faça sua própria pesquisa.",
    cta_headline_tutorial: "Pronto para colocar em prática? Abra sua conta",
    cta_headline_market: "Quer negociar as moedas citadas?",
    cta_headline_news: "Negocie os ativos desta matéria",
  },
};

// ═══════════════════════════════════════════════════════════════
// 主入口：按文章上下文生成 CTA 数据
// ═══════════════════════════════════════════════════════════════

export type ArticleType = "tutorial" | "market" | "news" | "analysis" | "glossary" | "default";

export interface AffiliateCTAData {
  headline: string;
  hint: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
  tertiary?: { label: string; href: string };
  disclaimer: string;
  logo: string;
}

/**
 * 根据（语言 × 文章类型 × 币种）生成最匹配的软广告数据
 * @param lang    页面语言
 * @param type    文章类型
 * @param coin    文章主要币种（可选，大写 symbol 如 "BTC"）
 */
export function buildAffiliateCTA(
  lang: Lang,
  type: ArticleType = "default",
  coin?: string,
): AffiliateCTAData {
  const t = AFFILIATE_TEXT[lang] ?? AFFILIATE_TEXT["en"];

  // Headline
  let headline = t.cta_headline_news;
  if (type === "tutorial") headline = t.cta_headline_tutorial;
  else if (type === "market" || type === "analysis") headline = t.cta_headline_market;

  // 主 CTA：若有具体币 → 币安深链；否则 → 注册
  let primary: AffiliateCTAData["primary"];
  if (coin) {
    const coinLabel = t.trade_coin.replace("{coin}", coin.toUpperCase());
    primary = { label: coinLabel, href: binanceTrade(coin, lang) };
  } else {
    primary = { label: t.register_binance, href: binanceRegister(lang) };
  }

  // 次 CTA：APK 下载（中文）/ 官方下载（其他）
  const dl = binanceDownload(lang);
  const secondary = {
    label:
      dl.label === "download_cn" ? t.download_cn :
      dl.label === "download_intl" ? t.download_intl :
      t.download_official,
    href: dl.primary,
  };

  // 三级 CTA：OKX 作为对手选项（分散来源）
  const tertiary = { label: t.register_okx, href: okxRegister(lang) };

  return {
    headline,
    hint: t.referral_hint,
    primary,
    secondary,
    tertiary,
    disclaimer: t.disclaimer,
    logo: BINANCE_LOGO,
  };
}
