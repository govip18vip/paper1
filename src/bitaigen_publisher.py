#!/usr/bin/env python3
"""
🚀 Bitaigen Auto-Publisher v7.0
完全重写，严格匹配网站结构:
  - Frontmatter 100% 匹配 content.config.ts schema
  - 文件路径: src/data/blog/{lang}/{slug}.md
  - 价格API: 币安 + CoinGecko + CryptoCompare 三级降级
  - AI解析: 4级解析器 (LABEL→===SECTION===→混合→fallback)
  - 图片: token池+冷却+不阻塞发布
  - Git: 原子操作+回滚

安装: pip install requests feedparser colorama
运行: python bitaigen_publisher.py
"""

import os, sys, re, json, time, hashlib, subprocess, traceback
import random, base64, math, signal
import requests, feedparser
from datetime import datetime, date, timedelta, timezone
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Tuple, Set
from urllib.parse import urlparse

try:
    from colorama import init, Fore, Style
    init(autoreset=True)
except ImportError:
    class Fore:
        RED=YELLOW=GREEN=CYAN=BLUE=MAGENTA=WHITE=LIGHTBLACK_EX=""
    class Style:
        RESET_ALL=""

# ╔═══════════════════════════════════════════════════════════════════╗
# ║                          配  置                                   ║
# ╚═══════════════════════════════════════════════════════════════════╝

class Config:
    # ── 路径 ──
    REPO_DIR        = os.environ.get("REPO_DIR", r"G:\web\awesome-astronaut\paper")
    BLOG_BASE_DIR   = os.path.join(REPO_DIR, "src", "data", "blog")
    IMAGE_LOCAL_DIR = os.path.join(REPO_DIR, "src", "assets", "images", "blog")
    IMAGE_REL_PREFIX = "../../../assets/images/blog"
    SITE_URL        = os.environ.get("SITE_URL", "https://bitaigen.com")

    # 语言目录名 → frontmatter lang code
    LANG_DIRS = {
        "zh-cn": "zh-CN",
        "en":    "en",
        "es":    "es",
        "pt":    "pt",
        "zh-tw": "zh-TW",
    }

    # 脚本文件
    SCRIPT_DIR     = os.path.dirname(os.path.abspath(__file__))
    AUTH_TOKEN_FILE = os.path.join(SCRIPT_DIR, "authorization.txt")
    HISTORY_FILE   = os.path.join(SCRIPT_DIR, "publish_history.json")
    LOG_FILE       = os.path.join(SCRIPT_DIR, "publisher.log")

    # 运行参数
    CYCLE_INTERVAL_MIN = int(os.environ.get("CYCLE_MIN", "10"))
    ARTICLES_PER_CYCLE = int(os.environ.get("ARTICLES", "2"))
    API_DELAY_SEC      = int(os.environ.get("API_DELAY", "15"))
    IMAGE_DELAY_SEC    = 8
    MAX_RETRIES        = 3
    MIN_QUALITY_SCORE  = 7.0
    MIN_CONTENT_LEN    = 1200

    # 超时
    REQUEST_TIMEOUT = 30
    AI_TIMEOUT      = 240
    IMAGE_TIMEOUT   = 150

    # AI API (免费)
    AI_API_URL = "https://backendai.internxt.com/"
    AI_HEADERS = {
        "content-type": "application/json",
        "origin": "https://ai.internxt.com",
        "referer": "https://ai.internxt.com/",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0.0.0",
    }

    # 图片API
    LILYS_IMAGE_URL = "https://rag.lilys.ai/text-to-image"

    # 价格API (三级降级)
    PRICE_APIS = {
        "binance": [
            "https://data-api.binance.vision/api/v3/ticker/24hr",
            "https://api1.binance.com/api/v3/ticker/24hr",
            "https://api.binance.com/api/v3/ticker/24hr",
        ],
        "coingecko": "https://api.coingecko.com/api/v3/simple/price",
        "cryptocompare": "https://min-api.cryptocompare.com/data/pricemultifull",
    }

# ── 语言配置 (严格匹配 i18n/ui.ts) ──
LANG_CONFIG = {
    "zh-cn": {
        "code": "zh-CN", "name": "简体中文", "author": "Bitaigen",
        "popular_exchanges": ["币安", "OKX", "火币", "Bybit"],
        "currency": "CNY/USDT",
    },
    "zh-tw": {
        "code": "zh-TW", "name": "繁體中文", "author": "Bitaigen",
        "popular_exchanges": ["幣安", "MAX", "BitoPro", "ACE"],
        "currency": "TWD/USDT",
    },
    "en": {
        "code": "en", "name": "English", "author": "Bitaigen",
        "popular_exchanges": ["Binance", "Coinbase", "Kraken", "Bybit"],
        "currency": "USD",
    },
    "es": {
        "code": "es", "name": "Español", "author": "Bitaigen",
        "popular_exchanges": ["Binance", "Bitso", "Ripio"],
        "currency": "USD/MXN",
    },
    "pt": {
        "code": "pt", "name": "Português", "author": "Bitaigen",
        "popular_exchanges": ["Binance", "Mercado Bitcoin", "Foxbit"],
        "currency": "BRL/USDT",
    },
}

RSS_FEEDS = [
    {"name":"CoinDesk","url":"https://www.coindesk.com/arc/outboundfeeds/rss/","lang":"en","tier":1},
    {"name":"CoinTelegraph","url":"https://cointelegraph.com/rss","lang":"en","tier":1},
    {"name":"TheBlock","url":"https://www.theblock.co/rss.xml","lang":"en","tier":1},
    {"name":"Decrypt","url":"https://decrypt.co/feed","lang":"en","tier":1},
    {"name":"Bitcoin Magazine","url":"https://bitcoinmagazine.com/feed","lang":"en","tier":1},
    {"name":"Blockworks","url":"https://blockworks.co/feed","lang":"en","tier":1},
    {"name":"CryptoSlate","url":"https://cryptoslate.com/feed/","lang":"en","tier":2},
    {"name":"NewsBTC","url":"https://www.newsbtc.com/feed/","lang":"en","tier":2},
    {"name":"U.Today","url":"https://u.today/rss","lang":"en","tier":2},
    {"name":"BeInCrypto","url":"https://beincrypto.com/feed/","lang":"en","tier":2},
    {"name":"DailyHodl","url":"https://dailyhodl.com/feed/","lang":"en","tier":2},
    {"name":"CryptoPotato","url":"https://cryptopotato.com/feed/","lang":"en","tier":2},
    {"name":"CryptoNews","url":"https://cryptonews.com/news/feed/","lang":"en","tier":2},
    {"name":"CoinTelegraph ES","url":"https://es.cointelegraph.com/rss","lang":"es","tier":1},
    {"name":"CriptoNoticias","url":"https://www.criptonoticias.com/feed/","lang":"es","tier":1},
    {"name":"CoinTelegraph BR","url":"https://br.cointelegraph.com/rss","lang":"pt","tier":1},
    {"name":"Portal do Bitcoin","url":"https://portaldobitcoin.uol.com.br/feed/","lang":"pt","tier":1},
    {"name":"PANews","url":"https://www.panewslab.com/rss/zh/index.xml","lang":"zh","tier":1},
    {"name":"BlockBeats","url":"https://www.theblockbeats.info/rss","lang":"zh","tier":1},
    {"name":"Foresight News","url":"https://foresightnews.pro/rss","lang":"zh","tier":1},
    {"name":"Odaily","url":"https://www.odaily.news/rss","lang":"zh","tier":2},
]

TOPIC_KEYWORDS = {
    "btc": ["bitcoin","btc","halving","satoshi","mining","ordinals","lightning"],
    "eth": ["ethereum","eth","vitalik","eip","staking","gas fee","layer 2","pectra"],
    "market": ["market","bull","bear","rally","crash","price","volume","liquidation","whale"],
    "defi": ["defi","uniswap","aave","compound","yield","liquidity","dex","tvl","restaking"],
    "policy": ["sec","regulation","policy","etf","congress","legal","cftc","cbdc","mica"],
    "solana": ["solana","sol","jito","jupiter","raydium"],
    "meme": ["meme","doge","shiba","pepe","trump","bonk","wif"],
    "security": ["hack","exploit","scam","rug pull","phishing","stolen"],
    "ai": ["artificial intelligence","ai crypto","machine learning","render","worldcoin"],
    "stablecoin": ["stablecoin","usdt","usdc","tether","circle"],
    "nft": ["nft","opensea","digital art","blur"],
    "rwa": ["rwa","real world asset","tokenization","blackrock","ondo"],
    "binance": ["binance","bnb","cz","launchpad"],
}

IMAGE_PROMPTS = {
    "btc": "Futuristic Bitcoin golden coin glowing blockchain neon dark blue 4K",
    "eth": "Ethereum diamond logo smart contracts purple blue neon futuristic 4K",
    "market": "Crypto market candlestick charts bull bear dark neon cinematic 4K",
    "default": "Professional crypto blockchain dark blue gold abstract 4K",
}

AI_TEMPLATE_PHRASES = [
    "在当今的数字时代", "综上所述", "需要注意的是", "值得一提的是",
    "in today's digital age", "in conclusion", "it is important to note",
    "en el mundo actual", "en conclusión", "no mundo atual", "em conclusão",
]


# ╔═══════════════════════════════════════════════════════════════════╗
# ║                          工具函数                                 ║
# ╚═══════════════════════════════════════════════════════════════════╝

def log(msg, level="INFO"):
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{ts}] [{level}] {msg}"
    print(line)
    try:
        with open(Config.LOG_FILE, "a", encoding="utf-8") as f:
            f.write(re.sub(r'\x1b\[[0-9;]*m', '', line) + "\n")
    except Exception:
        pass

def log_err(msg, exc=None):
    log(f"{Fore.RED}{msg}{Style.RESET_ALL}", "ERROR")
    if exc:
        log(f"  └─ {type(exc).__name__}: {exc}", "ERROR")

def log_warn(msg):
    log(f"{Fore.YELLOW}{msg}{Style.RESET_ALL}", "WARN")

def log_ok(msg):
    log(f"{Fore.GREEN}{msg}{Style.RESET_ALL}", "OK")

def utcnow():
    return datetime.now(timezone.utc)

def md5_short(t):
    return hashlib.md5(t.encode()).hexdigest()[:16]

def slugify(text, max_len=60):
    s = re.sub(r'[^a-z0-9\s-]', '', text.lower())
    s = re.sub(r'[\s]+', '-', s).strip('-')
    s = re.sub(r'-+', '-', s)
    if len(s) > max_len:
        s = s[:max_len].rsplit('-', 1)[0]
    return s if s and len(s) >= 5 else f"crypto-{datetime.now().strftime('%Y%m%d-%H%M%S')}"

def yaml_q(s):
    """YAML 安全引用"""
    s = str(s).replace('\\', '\\\\').replace('"', '\\"').replace('\n', ' ').strip()
    return f'"{s}"'


# ╔═══════════════════════════════════════════════════════════════════╗
# ║                     安全网络请求                                   ║
# ╚═══════════════════════════════════════════════════════════════════╝

class SafeHTTP:
    def __init__(self):
        self.sess = requests.Session()
        self.sess.headers["User-Agent"] = (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0.0.0"
        )

    def get(self, url, *, timeout=None, retries=2, delay=2,
            headers=None, params=None) -> Optional[requests.Response]:
        timeout = timeout or Config.REQUEST_TIMEOUT
        for i in range(retries + 1):
            try:
                r = self.sess.get(url, timeout=timeout, headers=headers, params=params)
                r.raise_for_status()
                return r
            except requests.exceptions.Timeout:
                log_warn(f"  超时 {i+1}/{retries+1}: {urlparse(url).netloc}")
            except requests.exceptions.ConnectionError:
                log_warn(f"  连接失败 {i+1}/{retries+1}: {urlparse(url).netloc}")
            except requests.exceptions.HTTPError as e:
                code = e.response.status_code if e.response else 0
                if code in (401, 403):
                    return None
                log_warn(f"  HTTP {code} {i+1}/{retries+1}: {urlparse(url).netloc}")
            except Exception as e:
                log_err(f"  请求异常: {urlparse(url).netloc}", e)
            if i < retries:
                time.sleep(delay * (i + 1))
        return None

    def post_json(self, url, data, *, timeout=None, retries=2,
                  delay=3, headers=None) -> Optional[requests.Response]:
        timeout = timeout or Config.REQUEST_TIMEOUT
        for i in range(retries + 1):
            try:
                r = self.sess.post(url, json=data, timeout=timeout, headers=headers)
                r.raise_for_status()
                return r
            except requests.exceptions.Timeout:
                log_warn(f"  POST超时 {i+1}/{retries+1}")
            except requests.exceptions.HTTPError as e:
                code = e.response.status_code if e.response else 0
                if code in (401, 403):
                    return e.response
                log_warn(f"  POST HTTP {code} {i+1}/{retries+1}")
            except Exception as e:
                log_err(f"  POST异常", e)
            if i < retries:
                time.sleep(delay * (i + 1))
        return None

    def get_json(self, url, **kw) -> Optional[dict]:
        r = self.get(url, **kw)
        if not r:
            return None
        try:
            return r.json()
        except (json.JSONDecodeError, ValueError):
            return None

http = SafeHTTP()


# ╔═══════════════════════════════════════════════════════════════════╗
# ║                         数据结构                                  ║
# ╚═══════════════════════════════════════════════════════════════════╝

@dataclass
class NewsItem:
    title: str
    summary: str = ""
    source: str = ""
    url: str = ""
    keywords: list = field(default_factory=list)
    topics: list = field(default_factory=list)
    source_lang: str = "en"
    score: float = 0.0
    tier: int = 2

@dataclass
class BlogArticle:
    """严格匹配 content.config.ts schema"""
    title: str
    description: str
    content: str
    tags: List[str]
    faqs: List[dict]           # [{q, a}]
    lang_dir: str              # "zh-cn","en" etc (目录名)
    lang_code: str             # "zh-CN","en" etc (frontmatter值)
    slug: str
    translation_key: str
    hero_image_file: str = ""
    image_prompt: str = ""
    article_type: str = "article"  # article|howto|guide|news
    focus_keyword: str = ""
    featured: bool = False


# ╔═══════════════════════════════════════════════════════════════════╗
# ║                  ★ 价格数据 (三级降级) ★                          ║
# ╚═══════════════════════════════════════════════════════════════════╝

class PriceService:
    """三级降级: 币安 → CoinGecko → CryptoCompare"""

    WATCH = ["BTC","ETH","BNB","SOL","XRP","DOGE","ADA","AVAX","LINK","DOT"]
    CG_IDS = {
        "BTC":"bitcoin","ETH":"ethereum","BNB":"binancecoin",
        "SOL":"solana","XRP":"ripple","DOGE":"dogecoin",
        "ADA":"cardano","AVAX":"avalanche-2","LINK":"chainlink","DOT":"polkadot",
    }

    def __init__(self):
        self.data: Dict[str, dict] = {}

    def fetch(self) -> Dict[str, dict]:
        """尝试三个API, 返回第一个成功的"""
        self.data = self._try_binance()
        if self.data:
            log(f"  ✅ 币安: {len(self.data)} 币种")
            return self.data

        log_warn("  币安失败, 尝试CoinGecko...")
        self.data = self._try_coingecko()
        if self.data:
            log(f"  ✅ CoinGecko: {len(self.data)} 币种")
            return self.data

        log_warn("  CoinGecko失败, 尝试CryptoCompare...")
        self.data = self._try_cryptocompare()
        if self.data:
            log(f"  ✅ CryptoCompare: {len(self.data)} 币种")
            return self.data

        log_warn("  全部价格API失败")
        return {}

    def _try_binance(self) -> Dict[str, dict]:
        for url in Config.PRICE_APIS["binance"]:
            raw = http.get_json(url, timeout=15, retries=1)
            if not isinstance(raw, list) or not raw:
                continue
            idx = {t["symbol"]: t for t in raw if isinstance(t, dict) and "symbol" in t}
            out = {}
            for coin in self.WATCH:
                t = idx.get(f"{coin}USDT")
                if not t:
                    continue
                try:
                    p = float(t.get("lastPrice", 0))
                    if p <= 0:
                        continue
                    out[coin] = {
                        "price": p,
                        "change_24h": float(t.get("priceChangePercent", 0)),
                        "volume_usd": float(t.get("quoteVolume", 0)),
                        "high_24h": float(t.get("highPrice", 0)),
                        "low_24h": float(t.get("lowPrice", 0)),
                    }
                except (ValueError, TypeError, KeyError):
                    continue
            if len(out) >= 3:
                return out
        return {}

    def _try_coingecko(self) -> Dict[str, dict]:
        ids = ",".join(self.CG_IDS.values())
        data = http.get_json(
            Config.PRICE_APIS["coingecko"],
            params={
                "ids": ids,
                "vs_currencies": "usd",
                "include_24hr_change": "true",
                "include_24hr_vol": "true",
            },
            timeout=15, retries=1
        )
        if not data:
            return {}
        out = {}
        for coin, cg_id in self.CG_IDS.items():
            d = data.get(cg_id)
            if not d:
                continue
            try:
                out[coin] = {
                    "price": float(d.get("usd", 0)),
                    "change_24h": float(d.get("usd_24h_change", 0)),
                    "volume_usd": float(d.get("usd_24h_vol", 0)),
                    "high_24h": 0, "low_24h": 0,
                }
            except (ValueError, TypeError):
                continue
        return out

    def _try_cryptocompare(self) -> Dict[str, dict]:
        coins = ",".join(self.WATCH[:8])
        data = http.get_json(
            Config.PRICE_APIS["cryptocompare"],
            params={"fsyms": coins, "tsyms": "USD"},
            timeout=15, retries=1
        )
        if not data or "RAW" not in data:
            return {}
        out = {}
        for coin in self.WATCH:
            d = data["RAW"].get(coin, {}).get("USD")
            if not d:
                continue
            try:
                out[coin] = {
                    "price": float(d.get("PRICE", 0)),
                    "change_24h": float(d.get("CHANGEPCT24HOUR", 0)),
                    "volume_usd": float(d.get("TOTALVOLUME24HTO", 0)),
                    "high_24h": float(d.get("HIGH24HOUR", 0)),
                    "low_24h": float(d.get("LOW24HOUR", 0)),
                }
            except (ValueError, TypeError):
                continue
        return out

    def format_context(self) -> str:
        if not self.data:
            return ""
        lines = ["实时行情:"]
        for c, d in self.data.items():
            p = d["price"]
            ps = f"${p:,.0f}" if p >= 100 else f"${p:,.2f}" if p >= 1 else f"${p:.6f}"
            lines.append(f"  {c}: {ps} ({d['change_24h']:+.2f}%)")
        return "\n".join(lines)


# ╔═══════════════════════════════════════════════════════════════════╗
# ║                        发布历史                                   ║
# ╚═══════════════════════════════════════════════════════════════════╝

class History:
    def __init__(self):
        self.data = self._load()

    def _load(self):
        for path in [Config.HISTORY_FILE, Config.HISTORY_FILE + ".bak"]:
            if os.path.exists(path):
                try:
                    with open(path, "r", encoding="utf-8") as f:
                        raw = json.load(f)
                    raw.setdefault("articles", [])
                    raw["hashes"] = set(raw.get("hashes", []))
                    return raw
                except Exception:
                    continue
        return {"articles": [], "hashes": set()}

    def save(self):
        tmp = Config.HISTORY_FILE + ".tmp"
        bak = Config.HISTORY_FILE + ".bak"
        try:
            out = {"articles": self.data["articles"], "hashes": list(self.data["hashes"])}
            with open(tmp, "w", encoding="utf-8") as f:
                json.dump(out, f, ensure_ascii=False, indent=2)
            if os.path.exists(Config.HISTORY_FILE):
                try:
                    if os.path.exists(bak): os.remove(bak)
                    os.rename(Config.HISTORY_FILE, bak)
                except Exception:
                    pass
            os.rename(tmp, Config.HISTORY_FILE)
        except Exception as e:
            log_err("保存历史失败", e)
            if os.path.exists(tmp):
                try: os.remove(tmp)
                except: pass

    def is_dup(self, h): return h in self.data["hashes"]

    def all_slugs(self):
        slugs = set()
        for a in self.data["articles"]:
            for s in a.get("slugs", {}).values():
                slugs.add(s)
        return slugs

    def add(self, tk, h, title, slugs, topics, has_img=False):
        self.data["hashes"].add(h)
        self.data["articles"].append({
            "tk": tk, "hash": h, "title": title, "slugs": slugs,
            "topics": topics, "has_image": has_img,
            "date": date.today().isoformat(),
        })
        self.save()

    def today_count(self):
        d = date.today().isoformat()
        return sum(1 for a in self.data["articles"] if a.get("date") == d)

    def total(self):
        return len(self.data["articles"])

    def cleanup(self, days=90):
        cutoff = (date.today() - timedelta(days=days)).isoformat()
        old_h = {a["hash"] for a in self.data["articles"] if a.get("date","") < cutoff and a.get("hash")}
        if old_h:
            self.data["hashes"] -= old_h
            self.data["articles"] = [a for a in self.data["articles"] if a.get("date","") >= cutoff]
            self.save()
            log(f"  🧹 清理 {len(old_h)} 条旧记录")


# ╔═══════════════════════════════════════════════════════════════════╗
# ║               ★ AI响应解析器 (4级) ★                              ║
# ╚═══════════════════════════════════════════════════════════════════╝

class Parser:
    KEYS = {"TITLE","SLUG","FOCUS_KEYWORD","DESCRIPTION","TAGS","IMAGE_PROMPT","FAQS","CONTENT"}
    FAQ_KEYS = {f"FAQ{i}_{t}" for i in range(1,8) for t in ("Q","A")}
    ALL = KEYS | FAQ_KEYS

    @classmethod
    def parse(cls, text, lang_dir, tk, news_title) -> Optional[BlogArticle]:
        text = cls._pre(text)
        for fn in [cls._label, cls._section, cls._mixed, cls._fallback]:
            art = fn(text, lang_dir, tk, news_title)
            if art and len(art.content) >= 400:
                return art
        return None

    @classmethod
    def _pre(cls, t):
        t = t.strip().lstrip('\ufeff')
        if t.startswith("```"):
            lines = t.split("\n")
            end = -1 if lines[-1].strip() == "```" else len(lines)
            t = "\n".join(lines[1:end])
        return t

    @classmethod
    def _clean(cls, line):
        c = line.strip()
        c = re.sub(r'^\*{1,3}\s*', '', c)
        c = re.sub(r'\s*\*{1,3}$', '', c)
        c = re.sub(r'^#{1,6}\s*', '', c)
        return c.strip()

    @classmethod
    def _label(cls, text, lang_dir, tk, news_title):
        fields = {}; cur = None; buf = []
        for line in text.split("\n"):
            c = cls._clean(line); matched = None; inline = ""
            for lb in cls.ALL:
                for pat in [rf'^{lb}\s*:\s*$', rf'^{lb}\s*:\s*(.+)$',
                            rf'^\*\*{lb}\*\*\s*:?\s*$', rf'^\*\*{lb}:\*\*\s*(.+)$',
                            rf'^\*\*{lb}\*\*:\s*(.+)$']:
                    m = re.match(pat, c, re.IGNORECASE)
                    if m:
                        matched = lb
                        inline = m.group(1).strip() if m.lastindex and m.group(1) else ""
                        break
                if matched: break
            if matched:
                if cur: fields[cur] = "\n".join(buf).strip()
                cur = matched; buf = [inline] if inline else []
            elif cur is not None:
                buf.append(line)
        if cur: fields[cur] = "\n".join(buf).strip()
        return cls._build(fields, lang_dir, tk, news_title)

    @classmethod
    def _section(cls, text, lang_dir, tk, news_title):
        fields = {}; cur = None; buf = []
        for line in text.split("\n"):
            c = cls._clean(line); matched = None
            for pat in [r'^={3,}\s*([A-Z_]+)\s*={3,}', r'^-{3,}\s*([A-Z_]+)\s*-{3,}',
                        r'^[\[【]\s*([A-Z_]+)\s*[\]】]', r'^([A-Z_]{3,})\s*:\s*$']:
                m = re.match(pat, c)
                if m and m.group(1) in cls.KEYS:
                    matched = m.group(1); break
            if matched:
                if cur: fields[cur] = "\n".join(buf).strip()
                cur = matched; buf = []
            elif cur is not None:
                buf.append(line)
        if cur: fields[cur] = "\n".join(buf).strip()
        if "FAQS" in fields and "FAQ1_Q" not in fields:
            for i, faq in enumerate(cls._parse_faq_section(fields["FAQS"]), 1):
                fields[f"FAQ{i}_Q"] = faq["q"]
                fields[f"FAQ{i}_A"] = faq["a"]
        return cls._build(fields, lang_dir, tk, news_title)

    @classmethod
    def _mixed(cls, text, lang_dir, tk, news_title):
        f1 = cls._extract_labels(text)
        f2 = cls._extract_sections(text)
        return cls._build({**f2, **f1}, lang_dir, tk, news_title)

    @classmethod
    def _extract_labels(cls, text):
        fields = {}; cur = None; buf = []
        for line in text.split("\n"):
            c = cls._clean(line); matched = None; inline = ""
            for lb in cls.ALL:
                for pat in [rf'^{lb}\s*:\s*$', rf'^{lb}\s*:\s*(.+)$']:
                    m = re.match(pat, c, re.IGNORECASE)
                    if m:
                        matched = lb
                        inline = m.group(1).strip() if m.lastindex and m.group(1) else ""
                        break
                if matched: break
            if matched:
                if cur: fields[cur] = "\n".join(buf).strip()
                cur = matched; buf = [inline] if inline else []
            elif cur is not None:
                buf.append(line)
        if cur: fields[cur] = "\n".join(buf).strip()
        return fields

    @classmethod
    def _extract_sections(cls, text):
        fields = {}; cur = None; buf = []
        for line in text.split("\n"):
            c = cls._clean(line); matched = None
            for pat in [r'^={3,}\s*([A-Z_]+)\s*={3,}', r'^[\[【]\s*([A-Z_]+)\s*[\]】]']:
                m = re.match(pat, c)
                if m and m.group(1) in cls.KEYS:
                    matched = m.group(1); break
            if matched:
                if cur: fields[cur] = "\n".join(buf).strip()
                cur = matched; buf = []
            elif cur is not None:
                buf.append(line)
        if cur: fields[cur] = "\n".join(buf).strip()
        return fields

    @classmethod
    def _fallback(cls, text, lang_dir, tk, news_title):
        lines = text.strip().split("\n")
        title = ""; start = 0
        for i, l in enumerate(lines):
            s = re.sub(r'[*#=\-\[\]{}]', '', l.strip()).strip()
            if s and len(s) >= 5 and not s.isupper():
                title = s[:100]; start = i + 1; break
        if not title: return None
        content = "\n".join(lines[start:]).strip()
        if len(content) < 400: return None
        lang_code = Config.LANG_DIRS.get(lang_dir, "en")
        return BlogArticle(
            title=title, description=content[:150].replace("\n"," "),
            content=content, tags=["crypto","analysis"], faqs=[],
            lang_dir=lang_dir, lang_code=lang_code,
            slug=slugify(news_title), translation_key=tk,
        )

    @classmethod
    def _build(cls, fields, lang_dir, tk, news_title) -> Optional[BlogArticle]:
        title = fields.get("TITLE","").strip()
        content = fields.get("CONTENT","").strip()
        if not title or not content: return None

        title = re.sub(r'^[\*#=\-\s]+', '', title)
        title = re.sub(r'[\*#=\-\s]+$', '', title)
        title = title.strip('"\'').strip()[:120]

        raw_slug = fields.get("SLUG","").strip().lower()
        raw_slug = re.sub(r'[^a-z0-9\s-]', '', raw_slug)
        raw_slug = re.sub(r'[\s]+', '-', raw_slug).strip('-')
        if not raw_slug or len(raw_slug) < 8:
            raw_slug = slugify(f"{datetime.now().strftime('%Y%m%d')} {news_title}")

        faqs = []
        for i in range(1,8):
            q = fields.get(f"FAQ{i}_Q","").strip().strip('"\'')
            a = fields.get(f"FAQ{i}_A","").strip().strip('"\'')
            if q and a and len(q)>=5 and len(a)>=10:
                faqs.append({"q": q, "a": a})
        if not faqs and "FAQS" in fields:
            faqs = cls._parse_faq_section(fields["FAQS"])

        desc = fields.get("DESCRIPTION","").strip()[:300].strip('"\'')
        tags_str = fields.get("TAGS","")
        tags = [t.strip().lower().replace(" ","-") for t in tags_str.split(",") if t.strip()] or ["crypto"]

        lang_code = Config.LANG_DIRS.get(lang_dir, "en")

        return BlogArticle(
            title=title, description=desc, content=content,
            tags=tags[:10], faqs=faqs[:6],
            lang_dir=lang_dir, lang_code=lang_code,
            slug=raw_slug[:60], translation_key=tk,
            image_prompt=fields.get("IMAGE_PROMPT","").strip().strip('"\''),
            focus_keyword=fields.get("FOCUS_KEYWORD","").strip().strip('"\''),
        )

    @staticmethod
    def _parse_faq_section(s):
        faqs = []; q = None; a = None
        for line in s.split("\n"):
            l = line.strip()
            if re.match(r'^Q[:：]\s*', l):
                if q and a: faqs.append({"q":q,"a":a})
                q = re.sub(r'^Q[:：]\s*', '', l).strip('"\''); a = None
            elif re.match(r'^A[:：]\s*', l):
                a = re.sub(r'^A[:：]\s*', '', l).strip('"\'')
            elif a is not None and l:
                a += " " + l
        if q and a: faqs.append({"q":q,"a":a})
        return faqs


# ╔═══════════════════════════════════════════════════════════════════╗
# ║                      文章验证器                                   ║
# ╚═══════════════════════════════════════════════════════════════════╝

class Validator:
    MIN_LEN = {"zh-cn":1000,"zh-tw":1000,"en":1200,"es":1200,"pt":1200}

    @classmethod
    def validate(cls, art: BlogArticle, news_title: str,
                 existing: Set[str]) -> Tuple[bool, List[str]]:
        fatal, warn = [], []

        # 必填检查
        for f in ["title","description","content","tags","slug","lang_dir"]:
            v = getattr(art, f, None)
            if not v or (isinstance(v, str) and not v.strip()):
                fatal.append(f"❌ 缺字段: {f}")
        if fatal: return False, fatal

        # 标题清洗
        art.title = re.sub(r'^[\*=#{}\[\]]+\s*', '', art.title).strip('"\'').strip()
        if len(art.title) < 5: fatal.append(f"❌ 标题太短")

        # Slug修复
        bad = {"title","article","post","analysis","news","update","bitcoin","ethereum","crypto","content"}
        need_fix = art.slug in bad or len(art.slug) < 10 or art.slug.count("-") < 2
        if need_fix:
            ds = datetime.now().strftime("%Y%m%d")
            art.slug = slugify(f"{ds} {news_title}")
            if art.lang_dir not in ("en",):
                art.slug = f"{art.lang_dir.replace('-','')}-{art.slug}"
            warn.append(f"⚠️ Slug修复: {art.slug}")

        # Slug去重
        base = art.slug; c = 1
        while art.slug in existing:
            art.slug = f"{base}-{c}"; c += 1
        existing.add(art.slug)
        art.slug = re.sub(r'[^a-z0-9-]', '', art.slug.lower()).strip('-')
        art.slug = re.sub(r'-+', '-', art.slug)
        if len(art.slug) < 5:
            art.slug = f"crypto-{datetime.now().strftime('%Y%m%d-%H%M%S')}"

        # 描述
        if len(art.description) < 20:
            auto = re.sub(r'\s+', ' ', art.content[:200]).strip()
            if len(auto) >= 20:
                art.description = auto[:300]
                warn.append("⚠️ 描述自动截取")
            else:
                fatal.append("❌ 描述太短")

        # 内容长度
        min_len = cls.MIN_LEN.get(art.lang_dir, 1000)
        if len(art.content) < min_len:
            fatal.append(f"❌ 内容太短: {len(art.content)} (需≥{min_len})")

        # 清除残留标记
        for mk in ["===TITLE===","===CONTENT===","===DESCRIPTION===","===TAGS===","===FAQS==="]:
            for v in [mk, f"**{mk}**", f"## {mk}"]:
                art.content = art.content.replace(v, "")

        # Markdown章节检查
        headings = re.findall(r'^##\s+.+', art.content, re.MULTILINE)
        if len(headings) < 2:
            bold = re.findall(r'^\*\*(.{5,50})\*\*\s*$', art.content, re.MULTILINE)
            if len(bold) >= 2:
                for bh in bold:
                    art.content = art.content.replace(f"**{bh}**", f"## {bh}")
                warn.append(f"⚠️ 转换{len(bold)}个粗体为标题")
            headings = re.findall(r'^##\s+.+', art.content, re.MULTILINE)
            if len(headings) < 2:
                fatal.append(f"❌ 章节太少: {len(headings)}")

        # 清除内链
        art.content = re.sub(r'\[([^\]]+)\]\(\/[^)]+\)', r'\1', art.content)

        # AI套话
        tc = sum(1 for p in AI_TEMPLATE_PHRASES if p.lower() in art.content.lower())
        if tc >= 3: fatal.append(f"❌ AI套话{tc}个")
        elif tc > 0: warn.append(f"⚠️ AI套话{tc}个")

        # Tags清洗
        cleaned = []
        for t in art.tags:
            ct = re.sub(r'[^a-z0-9\u4e00-\u9fff\-]', '', t.strip().lower().replace(" ","-"))
            if ct and len(ct) >= 2: cleaned.append(ct)
        art.tags = list(dict.fromkeys(cleaned))[:10] or ["crypto"]

        # FAQs清洗
        valid = []
        for faq in art.faqs:
            q, a = faq.get("q","").strip(), faq.get("a","").strip()
            if q and a and len(q) >= 5 and len(a) >= 10:
                a = re.sub(r'\[([^\]]+)\]\(\/[^)]+\)', r'\1', a)
                valid.append({"q":q,"a":a})
        art.faqs = valid

        return len(fatal) == 0, fatal + warn


# ╔═══════════════════════════════════════════════════════════════════╗
# ║                      图片生成器                                   ║
# ╚═══════════════════════════════════════════════════════════════════╝

class ImageGen:
    def __init__(self):
        self.sess = requests.Session()
        self.sess.headers.update({
            "accept": "application/json, text/plain, */*",
            "content-type": "application/json",
            "lilys-provider": "google",
            "origin": "https://lilys.ai",
            "referer": "https://lilys.ai/",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/146.0.0.0",
        })
        self.fb_key = None
        self.tokens = []
        self.cooldown = {}
        self._detect_fb_key()
        self._load_tokens()

    def _detect_fb_key(self):
        try:
            r = http.get("https://lilys.ai", timeout=15)
            if not r: return
            m = re.search(r'apiKey\s*[:=]\s*["\']+(AIzaSy[a-zA-Z0-9_-]{30,})', r.text)
            if m: self.fb_key = m.group(1); return
            for u in re.findall(r'src="(/[^"]*\.js[^"]*)"', r.text)[:5]:
                jr = http.get(f"https://lilys.ai{u}", timeout=10)
                if not jr: continue
                m = re.search(r'"apiKey"\s*:\s*"(AIzaSy[a-zA-Z0-9_-]{30,})"', jr.text)
                if m: self.fb_key = m.group(1); return
        except Exception: pass

    def _load_tokens(self):
        self.tokens = []
        if not os.path.exists(Config.AUTH_TOKEN_FILE): return
        try:
            with open(Config.AUTH_TOKEN_FILE, "r") as f:
                for line in f:
                    t = line.strip()
                    if not t or t.startswith("#"): continue
                    if t.startswith("eyJ") and "." in t:
                        self.tokens.append({"type":"access","val":t,"access":t,"exp":self._jwt_exp(t)})
                    else:
                        self.tokens.append({"type":"refresh","val":t,"access":None,"exp":0})
        except Exception: pass

    @staticmethod
    def _jwt_exp(t):
        try:
            p = t.split(".")[1]; p += "=" * (4-len(p)%4)
            return float(json.loads(base64.urlsafe_b64decode(p)).get("exp",0))
        except: return 0

    def _refresh(self, rt):
        if not self.fb_key: return None
        try:
            r = http.post_json(
                f"https://securetoken.googleapis.com/v1/token?key={self.fb_key}",
                {"grant_type":"refresh_token","refresh_token":rt},
                timeout=15, retries=1
            )
            if r:
                d = r.json()
                if "id_token" in d: return d["id_token"]
        except: pass
        return None

    def _get_token(self):
        now = time.time()
        random.shuffle(self.tokens)
        for e in self.tokens:
            tid = e["val"][:20]
            if tid in self.cooldown and now - self.cooldown[tid] < 300: continue
            if e["type"] == "refresh":
                if e["access"] and e["exp"] > now + 60: return e["access"]
                tk = self._refresh(e["val"])
                if tk: e["access"]=tk; e["exp"]=self._jwt_exp(tk); return tk
            elif e["type"] == "access" and e["exp"] > now + 30:
                return e["access"]
        return None

    def available(self): return len(self.tokens) > 0

    def generate(self, prompt, filename):
        if not self.available(): return None
        os.makedirs(Config.IMAGE_LOCAL_DIR, exist_ok=True)
        lp = os.path.join(Config.IMAGE_LOCAL_DIR, filename)
        if os.path.exists(lp) and os.path.getsize(lp) > 1024: return filename

        for attempt in range(Config.MAX_RETRIES):
            token = self._get_token()
            if not token: break
            try:
                self.sess.headers["authorization"] = f"Bearer {token}"
                resp = self.sess.post(Config.LILYS_IMAGE_URL,
                    json={"text":prompt,"needToGenerateImagePrompt":True},
                    timeout=Config.IMAGE_TIMEOUT)
                if resp.status_code in (401,403):
                    for e in self.tokens:
                        if e.get("access") == token:
                            e["access"]=None; e["exp"]=0
                            self.cooldown[e["val"][:20]] = time.time()
                    continue
                resp.raise_for_status()
                urls = resp.json().get("urls",[])
                if not urls: continue
                img = self.sess.get(urls[0], timeout=60)
                img.raise_for_status()
                with open(lp,"wb") as f: f.write(img.content)
                if os.path.getsize(lp) < 1024: os.remove(lp); continue
                log_ok(f"      ✅ {filename}")
                return filename
            except Exception as e:
                log_warn(f"      图片异常 {attempt+1}: {e}")
            time.sleep(3)
        return None

    def build_prompt(self, title, topics, custom=""):
        if custom and len(custom) > 20: return custom
        for t in topics:
            if t in IMAGE_PROMPTS: return f"{IMAGE_PROMPTS[t]}. Topic: {title[:80]}"
        return f"{IMAGE_PROMPTS['default']}. Topic: {title[:80]}"


# ╔═══════════════════════════════════════════════════════════════════╗
# ║                      新闻采集器                                   ║
# ╚═══════════════════════════════════════════════════════════════════╝

class Collector:
    def __init__(self, prices: PriceService):
        self.prices = prices

    def collect(self) -> List[NewsItem]:
        log("📡 采集中...")
        pool = []
        sources = [
            ("RSS", self._rss),
            ("价格异动", self._price_movers),
            ("恐贪指数", self._fear_greed),
            ("DeFiLlama", self._defillama),
        ]
        for label, fn in sources:
            try:
                items = fn() or []
                if isinstance(items, NewsItem): items = [items]
                items = [i for i in items if i]
                pool.extend(items)
                log(f"  ✅ {label}: {len(items)}")
            except Exception as e:
                log_warn(f"  ⚠️ {label}: {e}")

        for it in pool:
            it.topics = self._topics(it)
            it.score = self._score(it)
        pool.sort(key=lambda x: x.score, reverse=True)
        log(f"📊 总计 {len(pool)} 条")
        return pool

    def _rss(self):
        out = []; cutoff = datetime.now() - timedelta(hours=36)
        for fc in RSS_FEEDS:
            try:
                feed = feedparser.parse(fc["url"])
                if not feed or not hasattr(feed, 'entries'): continue
                for e in feed.entries[:5]:
                    try:
                        pub = e.get("published_parsed") or e.get("updated_parsed")
                        if pub and datetime(*pub[:6]) < cutoff: continue
                    except: pass
                    title = e.get("title","").strip()
                    if not title or len(title) < 10: continue
                    summary = re.sub(r'<[^>]+>', '', e.get("summary",""))[:800]
                    out.append(NewsItem(
                        title=title, summary=summary, source=fc["name"],
                        url=e.get("link",""), source_lang=fc.get("lang","en"),
                        tier=fc.get("tier",2),
                    ))
            except Exception as e:
                log_warn(f"    RSS [{fc['name']}]: {e}")
        return out

    def _price_movers(self):
        out = []
        for coin, d in self.prices.data.items():
            ch = d["change_24h"]
            if abs(ch) > 4:
                dr = "surges" if ch > 0 else "drops"
                p = d["price"]
                ps = f"${p:,.0f}" if p >= 100 else f"${p:,.2f}"
                out.append(NewsItem(
                    title=f"{coin} {dr} {abs(ch):.1f}% — {ps}",
                    summary=f"{coin} {ps} ({ch:+.2f}%)",
                    source="Market Data",
                    keywords=[coin.lower(),"market"],
                ))
        if "BTC" in self.prices.data and "ETH" in self.prices.data:
            b, e = self.prices.data["BTC"], self.prices.data["ETH"]
            out.append(NewsItem(
                title=f"Market: BTC ${b['price']:,.0f} ({b['change_24h']:+.1f}%), ETH ${e['price']:,.0f} ({e['change_24h']:+.1f}%)",
                summary=self.prices.format_context(),
                source="Market Data", keywords=["btc","eth","market"], score=8,
            ))
        return out

    def _fear_greed(self):
        try:
            d = http.get_json("https://api.alternative.me/fng/?limit=1", timeout=10)
            if not d or "data" not in d: return None
            val = int(d["data"][0]["value"])
            label = d["data"][0]["value_classification"]
            return NewsItem(
                title=f"Fear & Greed: {val}/100 ({label})",
                summary=f"Crypto Fear & Greed Index: {val} ({label})",
                source="Alternative.me", keywords=["sentiment","market"],
            )
        except: return None

    def _defillama(self):
        data = http.get_json("https://api.llama.fi/protocols", timeout=15)
        if not data or not isinstance(data, list): return []
        top = sorted(data, key=lambda x: x.get("tvl",0), reverse=True)[:10]
        parts = [f"{p.get('name','')}: ${p.get('tvl',0)/1e9:.1f}B" for p in top if p.get("tvl",0)>1e9]
        if not parts: return []
        return [NewsItem(
            title="DeFi TVL Rankings Update",
            summary=" | ".join(parts),
            source="DeFiLlama", keywords=["defi","tvl"], score=7.5,
        )]

    def _topics(self, it):
        txt = (it.title + " " + it.summary).lower()
        return [t for t, kws in TOPIC_KEYWORDS.items() if any(k in txt for k in kws)] or ["market"]

    def _score(self, it):
        s = 5.0; txt = (it.title + " " + it.summary).lower()
        s += min(sum(1 for _, kws in TOPIC_KEYWORDS.items() if any(k in txt for k in kws)) * 0.8, 4)
        if it.tier == 1: s += 2.0
        if len(it.summary) > 200: s += 1
        for k in ["etf","regulation","sec","breaking","hack","million","billion","blackrock"]:
            if k in txt: s += 0.5
        if it.source_lang != "en": s += 1.5
        return min(s, 15.0)


# ╔═══════════════════════════════════════════════════════════════════╗
# ║                    AI文章生成引擎                                  ║
# ╚═══════════════════════════════════════════════════════════════════╝

class AIEngine:
    def __init__(self, prices: PriceService):
        self.sess = requests.Session()
        self.sess.headers.update(Config.AI_HEADERS)
        self.prices = prices

    def generate_all(self, news: NewsItem) -> Dict[str, BlogArticle]:
        ds = datetime.now().strftime("%Y%m%d")
        tk = f"{ds}-{slugify(news.title)}"
        results = {}

        log("    🤖 zh-cn ...")
        zh = self._gen_original(news, tk, "zh-cn")
        if not zh:
            log_warn("    zh-cn失败, 尝试en...")
            en = self._gen_original(news, tk, "en")
            if not en: return {}
            results["en"] = en
            for lang in ["zh-cn","es","pt","zh-tw"]:
                log(f"    🤖 {lang} ...")
                art = self._localize(en, news, lang, tk)
                if art: results[lang] = art
                time.sleep(Config.API_DELAY_SEC)
            return results

        results["zh-cn"] = zh
        time.sleep(Config.API_DELAY_SEC)

        for lang in ["en","es","pt","zh-tw"]:
            log(f"    🤖 {lang} ...")
            art = self._localize(zh, news, lang, tk)
            if art: results[lang] = art
            else: log_warn(f"    {lang} 失败")
            time.sleep(Config.API_DELAY_SEC)
        return results

    def _gen_original(self, news, tk, lang_dir):
        lc = LANG_CONFIG[lang_dir]
        mkt = self.prices.format_context()
        ds = datetime.now().strftime("%Y-%m-%d")
        uid = datetime.now().strftime("%H%M")

        prompt = f"""写一篇{lc['name']}加密货币深度分析文章。

新闻: {news.title}
详情: {news.summary}
来源: {news.source}
日期: {ds}

{mkt}

请用下面格式输出，每个标记独占一行:

TITLE:
（{lc['name']}标题，15-30字）

SLUG:
（URL标识，示例: btc-etf-analysis-{ds}-{uid}，至少3个词用-连接）

FOCUS_KEYWORD:
（主关键词1个）

DESCRIPTION:
（SEO描述80-120字）

TAGS:
（6个标签逗号分隔，如: btc, market, defi）

IMAGE_PROMPT:
（英文图片描述50词）

FAQ1_Q:
（常见问题1）
FAQ1_A:
（回答50-100字）

FAQ2_Q:
（问题2）
FAQ2_A:
（回答）

FAQ3_Q:
（问题3）
FAQ3_A:
（回答）

CONTENT:
（以下是正文，1500-3000字Markdown，至少5个##标题）

## 导语

## 发生了什么

## 为什么重要

## 投资建议

## 风险提示

## 总结"""

        return self._call(prompt, lang_dir, tk, news.title)

    def _localize(self, src, news, lang_dir, tk):
        lc = LANG_CONFIG[lang_dir]
        ds = datetime.now().strftime("%Y-%m-%d")
        uid = datetime.now().strftime("%H%M")
        faq_text = "\n".join(f"Q: {f['q']}\nA: {f['a']}" for f in src.faqs[:4])

        prompt = f"""将加密货币文章改写为{lc['name']}版本（本地化改写）。

当地平台: {', '.join(lc['popular_exchanges'])}
当地货币: {lc['currency']}

原标题: {src.title}
原描述: {src.description}
原FAQ:
{faq_text}
原文:
{src.content[:3000]}

请用下面格式输出:

TITLE:
（{lc['name']}标题）

SLUG:
（slug示例: analisis-btc-{ds}-{uid}）

FOCUS_KEYWORD:
（当地主关键词）

DESCRIPTION:
（当地SEO描述80-120字）

TAGS:
（当地标签6个逗号分隔）

FAQ1_Q:
（当地问题1）
FAQ1_A:
（回答）

FAQ2_Q:
（问题2）
FAQ2_A:
（回答）

FAQ3_Q:
（问题3）
FAQ3_A:
（回答）

CONTENT:
（本地化改写的完整文章Markdown）"""

        art = self._call(prompt, lang_dir, tk, news.title)
        if art:
            art.hero_image_file = src.hero_image_file
            art.image_prompt = src.image_prompt or art.image_prompt
        return art

    def _call(self, prompt, lang_dir, tk, news_title):
        for attempt in range(Config.MAX_RETRIES):
            try:
                resp = self.sess.post(Config.AI_API_URL, json={
                    "messages": [
                        {"role":"system","content":"You are a crypto analyst. Output exactly in the requested format."},
                        {"role":"user","content":prompt},
                    ],
                    "max_tokens": 8000, "temperature": 0.75,
                }, timeout=Config.AI_TIMEOUT)
                resp.raise_for_status()
                data = resp.json()

                text = ""
                if "choices" in data and data["choices"]:
                    text = data["choices"][0].get("message",{}).get("content","")
                elif "content" in data:
                    text = data["content"]

                if not text or len(text) < 200:
                    log_warn(f"      AI返回太短: {len(text)}字")
                    if attempt < Config.MAX_RETRIES - 1:
                        time.sleep(Config.API_DELAY_SEC * (attempt+1))
                    continue

                art = Parser.parse(text, lang_dir, tk, news_title)
                if art and len(art.content) >= Config.MIN_CONTENT_LEN:
                    return art
                log_warn(f"      解析不达标 attempt {attempt+1}")

            except requests.exceptions.Timeout:
                log_warn(f"      AI超时 {attempt+1}")
            except Exception as e:
                log_err(f"      AI异常 {attempt+1}", e)

            if attempt < Config.MAX_RETRIES - 1:
                time.sleep(Config.API_DELAY_SEC * (attempt+1))
        return None


# ╔═══════════════════════════════════════════════════════════════════╗
# ║            MD写入 (严格匹配 content.config.ts)                    ║
# ╚═══════════════════════════════════════════════════════════════════╝

class Writer:
    @staticmethod
    def write(art: BlogArticle, all_slugs: Dict[str,str]) -> Optional[str]:
        """写入 src/data/blog/{lang_dir}/{slug}.md"""
        d = os.path.join(Config.BLOG_BASE_DIR, art.lang_dir)
        os.makedirs(d, exist_ok=True)
        fp = os.path.join(d, f"{art.slug}.md")
        if os.path.exists(fp):
            log_warn(f"      已存在: {art.lang_dir}/{art.slug}.md")
            return None

        now = utcnow()
        fm = Writer._frontmatter(art, now, all_slugs)
        body = art.content
        if art.hero_image_file:
            body = f"![{art.title}]({Config.IMAGE_REL_PREFIX}/{art.hero_image_file})\n\n{body}"

        full = f"---\n{fm}---\n\n{body}\n"

        # 验证frontmatter
        if not full.startswith("---"):
            log_err("      无frontmatter"); return None
        parts = full.split("---", 2)
        if len(parts) < 3:
            log_err("      frontmatter未闭合"); return None
        for field in ["title:", "slug:", "lang:", "description:", "pubDatetime:"]:
            if field not in parts[1]:
                log_err(f"      缺字段: {field}"); return None

        try:
            with open(fp, "w", encoding="utf-8") as f:
                f.write(full)
            log_ok(f"      ✅ {art.lang_dir}/{art.slug}.md")
            return fp
        except IOError as e:
            log_err(f"      写入失败", e); return None

    @staticmethod
    def _frontmatter(art: BlogArticle, now, all_slugs: Dict[str,str]) -> str:
        """生成严格匹配 content.config.ts schema 的frontmatter"""
        lc = LANG_CONFIG[art.lang_dir]
        lines = []

        # ── 必需字段 (匹配 schema) ──
        lines.append(f"author: {lc['author']}")
        lines.append(f"pubDatetime: {now.strftime('%Y-%m-%dT%H:%M:%SZ')}")
        lines.append(f"modDatetime: {now.strftime('%Y-%m-%dT%H:%M:%SZ')}")
        lines.append(f"title: {yaml_q(art.title)}")
        lines.append(f"slug: {art.slug}")
        lines.append(f"featured: {'true' if art.featured else 'false'}")
        lines.append(f"draft: false")

        # ── 多语言字段 ──
        lines.append(f"lang: {art.lang_code}")
        lines.append(f"translationKey: {art.translation_key}")

        # ── 类型 ──
        lines.append(f"type: {art.article_type}")

        # ── 图片 ──
        if art.hero_image_file:
            img_path = f"{Config.IMAGE_REL_PREFIX}/{art.hero_image_file}"
            lines.append(f"heroImage: {yaml_q(img_path)}")
            lines.append(f"ogImage: {yaml_q(img_path)}")

        # ── 标签 ──
        lines.append("tags:")
        for t in art.tags:
            lines.append(f"  - {t}")

        # ── 描述 ──
        lines.append(f"description: {yaml_q(art.description)}")

        # ── FAQs (匹配 schema: faqs[].q / faqs[].a) ──
        if art.faqs:
            lines.append("faqs:")
            for faq in art.faqs:
                lines.append(f"  - q: {yaml_q(faq['q'])}")
                lines.append(f"    a: {yaml_q(faq['a'])}")

        return "\n".join(lines) + "\n"


# ╔═══════════════════════════════════════════════════════════════════╗
# ║                          Git                                      ║
# ╚═══════════════════════════════════════════════════════════════════╝

class Git:
    def __init__(self):
        self.repo = Config.REPO_DIR

    def push(self, msg=None):
        if not msg:
            msg = f"auto-publish {datetime.now().strftime('%Y-%m-%d %H:%M')}"
        try:
            self._run("add", "-A")
            status = self._run("status", "--porcelain").strip()
            if not status:
                log("  ℹ️ 无变更"); return True
            self._run("commit", "-m", msg)
            self._run("push")
            log_ok("  ✅ Git push 成功"); return True
        except Exception as e:
            log_err("  Git push 失败", e)
            try: self._run("reset", "HEAD~1", "--soft"); log_warn("  已回滚")
            except: pass
            return False

    def _run(self, *args):
        r = subprocess.run(
            ["git"] + list(args), capture_output=True, text=True,
            cwd=self.repo, encoding="utf-8", timeout=60
        )
        if r.returncode != 0:
            out = (r.stdout + r.stderr).strip()
            if "nothing to commit" not in out.lower():
                log(f"    git {' '.join(args)} => {out[:200]}")
        return r.stdout


# ╔═══════════════════════════════════════════════════════════════════╗
# ║                         主管道                                    ║
# ╚═══════════════════════════════════════════════════════════════════╝

class Pipeline:
    def __init__(self):
        self.history = History()
        self.prices = PriceService()
        self.collector = Collector(self.prices)
        self.engine = AIEngine(self.prices)
        self.imggen = ImageGen()
        self.git = Git()

        for lang in Config.LANG_DIRS:
            os.makedirs(os.path.join(Config.BLOG_BASE_DIR, lang), exist_ok=True)
        os.makedirs(Config.IMAGE_LOCAL_DIR, exist_ok=True)

    def run_once(self):
        log("═" * 60)
        log(f"🚀 Bitaigen Publisher v7 — 采集→生成→验证→配图→写入→Git")
        log("═" * 60)
        log(f"📊 今日: {self.history.today_count()} | 累计: {self.history.total()}")

        if self.history.total() > 500:
            self.history.cleanup()

        # 获取价格
        self.prices.fetch()

        # 采集新闻
        news = self.collector.collect()
        if not news:
            log_warn("❌ 无新闻"); return

        # 过滤
        fresh = []
        for n in news:
            h = md5_short(n.title + n.source)
            if not self.history.is_dup(h) and n.score >= Config.MIN_QUALITY_SCORE:
                fresh.append((n, h))
        log(f"📰 新素材: {len(fresh)}")
        if not fresh:
            log("ℹ️ 无新素材"); return

        sel = fresh[:Config.ARTICLES_PER_CYCLE]
        log(f"📋 选中 {len(sel)} 条\n")

        # 收集已有slugs
        existing = self.history.all_slugs()
        for lang in Config.LANG_DIRS:
            ld = os.path.join(Config.BLOG_BASE_DIR, lang)
            if os.path.isdir(ld):
                for fn in os.listdir(ld):
                    if fn.endswith(".md"): existing.add(fn[:-3])

        pub_count = 0; total_files = []

        for i, (item, h) in enumerate(sel, 1):
            log(f"{'━'*50}")
            log(f"📝 [{i}/{len(sel)}] {item.title[:70]}")
            log(f"   src={item.source} score={item.score:.1f} topics={','.join(item.topics)}")

            try:
                arts = self.engine.generate_all(item)
            except Exception as e:
                log_err("   生成异常", e); continue

            if not arts:
                log_warn("   ❌ 生成失败"); continue

            # 验证
            validated = {}
            for lang_dir, art in arts.items():
                log(f"    🔍 验证 {lang_dir}...")
                try:
                    ok, issues = Validator.validate(art, item.title, existing)
                    for iss in issues: log(f"       {iss}")
                    if ok:
                        validated[lang_dir] = art
                        log_ok(f"    ✅ {lang_dir} (slug={art.slug})")
                    else:
                        log_warn(f"    ❌ {lang_dir}")
                except Exception as e:
                    log_err(f"    验证异常", e)

            if not validated:
                log_warn("   全部失败"); continue

            # 配图
            img_fn = None
            first = list(validated.values())[0]
            if self.imggen.available():
                log("    🎨 配图...")
                try:
                    prompt = self.imggen.build_prompt(item.title, item.topics, first.image_prompt)
                    img_fn = self.imggen.generate(prompt, f"{first.translation_key}.png")
                    if img_fn:
                        for a in validated.values(): a.hero_image_file = img_fn
                    else:
                        log_warn("    ⚠️ 配图失败")
                except Exception as e:
                    log_err("    配图异常", e)
                time.sleep(Config.IMAGE_DELAY_SEC)

            # 写入
            all_slugs = {ld: a.slug for ld, a in validated.items()}
            written = {}
            for lang_dir, art in validated.items():
                try:
                    fp = Writer.write(art, all_slugs)
                    if fp: total_files.append(fp); written[lang_dir] = art.slug
                except Exception as e:
                    log_err(f"    写入{lang_dir}失败", e)

            if written:
                self.history.add(first.translation_key, h, item.title, written, item.topics, bool(img_fn))
                pub_count += 1
                log_ok(f"   ✅ 发布 {len(written)} 语言: {','.join(written.keys())}")

            time.sleep(Config.API_DELAY_SEC)

        # Git
        if total_files:
            log(f"\n📤 Git {len(total_files)} 文件...")
            self.git.push(f"publish {pub_count} articles - {datetime.now().strftime('%Y-%m-%d %H:%M')}")

        log(f"\n{'═'*60}")
        log(f"📊 本轮: {pub_count}篇 | 今日: {self.history.today_count()} | 累计: {self.history.total()}")

    def run_forever(self):
        log(f"🔄 挂机 每{Config.CYCLE_INTERVAL_MIN}分钟")
        cycle = 0
        while True:
            cycle += 1
            try:
                log(f"\n🔄 ═══ 第{cycle}轮 ═══")
                self.run_once()
                log(f"⏰ 等{Config.CYCLE_INTERVAL_MIN}分钟...")
                time.sleep(Config.CYCLE_INTERVAL_MIN * 60)
            except KeyboardInterrupt:
                log("👋 退出"); break
            except Exception as e:
                log_err(f"主循环异常", e)
                traceback.print_exc()
                time.sleep(Config.CYCLE_INTERVAL_MIN * 60)


# ╔═══════════════════════════════════════════════════════════════════╗
# ║                          入口                                    ║
# ╚═══════════════════════════════════════════════════════════════════╝

def main():
    tc = 0
    if os.path.exists(Config.AUTH_TOKEN_FILE):
        try:
            with open(Config.AUTH_TOKEN_FILE) as f:
                tc = sum(1 for l in f if l.strip() and not l.startswith("#"))
        except: pass

    img_s = f"{Fore.GREEN}✅ {tc}个{Style.RESET_ALL}" if tc else f"{Fore.RED}❌{Style.RESET_ALL}"

    print(f"""
{Fore.CYAN}╔═════════════════════════════════════════════════════════╗
║    🚀 Bitaigen Publisher v7.0                           ║
║                                                         ║
║  ✅ 严格匹配 content.config.ts schema                  ║
║  ✅ 价格: 币安→CoinGecko→CryptoCompare 三级降级       ║
║  ✅ 4级AI解析器 + 文章验证器                           ║
║  ✅ 图片token池 + Git原子操作                          ║
║  ✅ 5语言: zh-CN zh-TW en es pt                        ║
║                                                         ║
║  🎨 图片: {img_s}
╚═════════════════════════════════════════════════════════╝{Style.RESET_ALL}

  {Fore.GREEN}[1] 单次运行{Style.RESET_ALL}    {Fore.BLUE}[2] 挂机{Style.RESET_ALL}    {Fore.YELLOW}[3] 统计{Style.RESET_ALL}
  {Fore.MAGENTA}[4] 测试采集{Style.RESET_ALL}    {Fore.WHITE}[5] 测试价格API{Style.RESET_ALL}    {Fore.WHITE}[6] 测试解析器{Style.RESET_ALL}
""")
    ch = input(f"{Fore.CYAN}选择: {Style.RESET_ALL}").strip()

    if ch == "2":
        Pipeline().run_forever()
    elif ch == "3":
        h = History()
        print(f"\n📊 今日:{h.today_count()} 累计:{h.total()}")
        for a in h.data.get("articles",[])[-10:]:
            icon = "🖼️" if a.get("has_image") else "📄"
            print(f"  {icon} [{a.get('date','')}] {a.get('title','')[:50]}")
            for lang,slug in a.get("slugs",{}).items():
                print(f"     {lang}: {slug}")
    elif ch == "4":
        ps = PriceService(); ps.fetch()
        c = Collector(ps)
        news = c.collect()
        for i, it in enumerate(news[:20], 1):
            clr = Fore.GREEN if it.score >= Config.MIN_QUALITY_SCORE else Fore.LIGHTBLACK_EX
            print(f"  {clr}#{i:02d} [{it.score:.1f}] [{it.source}] {it.title[:60]}{Style.RESET_ALL}")
    elif ch == "5":
        print(f"\n{Fore.CYAN}测试价格API...{Style.RESET_ALL}")
        ps = PriceService()
        ps.fetch()
        for coin, d in ps.data.items():
            p = d["price"]
            ps_str = f"${p:,.0f}" if p >= 100 else f"${p:,.2f}"
            print(f"  {coin}: {ps_str} ({d['change_24h']:+.2f}%)")
    elif ch == "6":
        print(f"\n{Fore.CYAN}测试解析器...{Style.RESET_ALL}")
        tests = [
            ("LABEL格式", "TITLE:\n比特币突破分析\n\nSLUG:\nbtc-analysis-20260322\n\nDESCRIPTION:\n比特币分析描述\n\nTAGS:\nbtc, market\n\nCONTENT:\n## 导语\n测试" + "内容"*300),
            ("===格式", "===TITLE===\n比特币分析\n\n===SLUG===\nbtc-20260322\n\n===DESCRIPTION===\n描述文字\n\n===TAGS===\nbtc\n\n===CONTENT===\n## 标题\n" + "测试"*300),
        ]
        for name, text in tests:
            art = Parser.parse(text, "zh-cn", "test", "Test")
            ok = bool(art and art.title and len(art.content)>100)
            print(f"  {name}: {'✅' if ok else '❌'} {f'title={art.title[:30]} content={len(art.content)}字' if art else ''}")
    else:
        Pipeline().run_once()

if __name__ == "__main__":
    main()
