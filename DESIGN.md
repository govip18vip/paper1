# Bitaigen Design System

> **For AI agents**: Use this file as the single source of truth before writing any UI code for bitaigen.com. Every color token, spacing rule, component pattern, and layout convention is defined here. Do not invent values — reference this document first.

---

## 1. Visual Theme & Atmosphere

Bitaigen is a professional multi-language crypto news portal built in the spirit of Chinese media heavyweights like 36kr and Huxiu — a 3-column editorial layout with a dark topbar, live price ticker, sticky left navigation, dense article feeds, and a curated right sidebar. The experience reads as Bloomberg-for-crypto: information-rich, fast, and visually disciplined.

The defining visual anchor is **Bitcoin Orange** (`#f7931a`). This is not a decorative choice — it is the brand. Every interactive element, every active state, every accent bar, every CTA traces back to this single color. On dark backgrounds it glows like live price data; on light backgrounds it reads as authoritative and warm. The system deliberately avoids diluting this with a second brand color at equal weight. Orange is always the hierarchy signal.

The light theme uses a **slightly cool off-white page background** (`#f0f1f5`) that separates the page from pure-white cards and sidebars, creating implicit depth without shadows. The dark theme inverts this into a **deep space navy** (`#0d0e14`) with near-black cards (`#13151e`), giving the site a Bloomberg Terminal aesthetic when dark mode is active.

Typography is **Chinese-first, Latin-compatible**. The primary font stack is `Google Sans Code → PingFang SC → Microsoft YaHei → sans-serif`. Chinese characters receive optical priority — comfortable at 13–15px for article feeds, with precise line-height 1.5–1.6 for CJK readability. English text inherits the same stack and benefits from Google Sans Code's geometric, clean forms.

The layout enforces strict information hierarchy through **section-head left bars**: every content section opens with a 3px × 16–18px vertical bar in Bitcoin Orange, immediately signaling a named region. This pattern recurs so consistently that users learn it as visual grammar — "orange bar = new topic."

**Key Characteristics:**
- Bitcoin Orange (`#f7931a`) as the sole brand accent — no dilution with secondary brand colors
- 36kr-style 3-column layout: 200px left nav + fluid center + 280px right sidebar
- Chinese-first font stack: Google Sans Code → PingFang SC → Microsoft YaHei
- Off-white page background in light mode (`#f0f1f5`) to create depth via contrast against white cards
- Deep space dark mode (`#0d0e14`) with near-black card surfaces — Bloomberg Terminal aesthetic
- Section heading left bars (3px wide, Bitcoin Orange) as the universal content region signal
- Dark topbar (`#1a1b1f` / `#090a0f`) with live emerald ticker strip below — always dark regardless of theme
- Conservative border-radius throughout: 3–6px for cards, 4–5px for buttons — nothing pill-shaped
- Multi-color category tag system: orange (news), blue (analysis), green (DeFi/success), red (market/alert)
- Affiliate-first monetization: exchange banners embedded naturally in article flow, never as banner ads

---

## 2. Color Palette & Roles

### Brand

| Name | Hex | Role |
|------|-----|------|
| **Bitcoin Orange** | `#f7931a` | Primary accent, CTAs, active nav, section bars, links, tag badges |
| **Orange Dark (light mode hover)** | `#e07800` | Hover state on orange elements in light mode |
| **Orange Dark (dark mode hover)** | `#ffa733` | Hover state on orange elements in dark mode |
| **Tag Orange BG** | `rgba(247,147,26,0.10)` light / `rgba(247,147,26,0.13)` dark | Orange category badge fill |

### Page Backgrounds

| Token | Light | Dark | Role |
|-------|-------|------|------|
| `--bg-page` | `#f0f1f5` | `#0d0e14` | Outermost page background — intentionally not pure white/black |
| `--bg-sidebar` | `#ffffff` | `#12141c` | Left and right sidebar fills |
| `--bg-card` | `#ffffff` | `#13151e` | Article cards, content containers |
| `--bg-elevated` | `#f8f9fb` | `#1a1d28` | Hover states, sub-menus, secondary surfaces |
| `--bg-topbar` | `#1a1b1f` | `#090a0f` | Global top utility bar — **always dark** regardless of theme |
| `--ticker-bg` | `#080c16` | `#080c16` | Live price ticker — **always near-black** |

### Foreground / Text

| Token | Light | Dark | Role |
|-------|-------|------|------|
| `--fg` | `#1a1a1a` | `#e4e6f0` | Primary body text, headings |
| `--fg-muted` | `#666677` | `#8b8fa8` | Secondary text, metadata, descriptions |
| `--fg-light` | `#999aaa` | `#5a5e74` | Timestamps, tertiary labels, placeholders |

### Semantic Accents

| Token | Light | Dark | Role |
|-------|-------|------|------|
| `--accent-green` | `#00a878` | `#00c896` | Price up, success, DeFi content |
| `--accent-red` | `#e53935` | `#f04747` | Price down, alert, danger |
| `--accent-blue` | `#1677ff` | `#4da6ff` | Analysis/market type badges, info |

### Borders

| Token | Light | Dark | Role |
|-------|-------|------|------|
| `--border` | `#e8e9ef` | `#23263a` | Standard dividers, card outlines, input borders |
| `--border-subtle` | `#f0f1f5` | `#1a1d28` | Intra-card row separators |

### Category Tag System

Every article has a type badge. Use these exact bg/text pairs — do not invent new tag colors.

| Type | BG (light/dark) | Text (light) | Text (dark) |
|------|-----------------|--------------|-------------|
| `news` / default | `rgba(247,147,26,0.10/0.13)` | `#f7931a` | `#f7931a` |
| `market` / red | `rgba(229,57,53,0.10/0.13)` | `#e53935` | `#f04747` |
| `article` / blue | `rgba(22,119,255,0.10/0.13)` | `#1677ff` | `#4da6ff` |
| `howto` / green | `rgba(0,168,120,0.10/0.13)` | `#00a878` | `#00c896` |
| `guide` / amber | `rgba(245,158,11,0.10/0.13)` | `#d97706` | `#fbbf24` |

### Shadows

| Name | Value | Role |
|------|-------|------|
| `--shadow-card` (light) | `0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)` | Default card elevation |
| `--shadow-card` (dark) | `0 1px 4px rgba(0,0,0,0.40)` | Default card elevation dark |
| `--shadow-hover` (light) | `0 4px 12px rgba(0,0,0,0.10)` | Lifted card on hover |
| `--shadow-hover` (dark) | `0 4px 20px rgba(0,0,0,0.50), 0 0 0 1px rgba(247,147,26,0.12)` | Hover dark — faint orange halo |

---

## 3. Typography Rules

### Font Stack

```css
font-family: 'Google Sans Code', -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif;
```

- **Google Sans Code**: Primary typeface. Geometric, clean, slightly technical — suits crypto's data-heavy content.
- **PingFang SC**: macOS/iOS CJK fallback. Modern, Apple-grade Chinese rendering.
- **Microsoft YaHei**: Windows CJK fallback. Default for mainland China Windows users.
- **Monospace**: System `monospace` for code — no custom monospace font.

### Type Scale

| Role | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|--------|-------------|----------------|-------|
| Page title / H1 | 24–28px | 700–800 | 1.30 | −0.02em | Homepage section titles, hero headlines |
| Article detail H1 | 20–22px | 700 | 1.40 | −0.01em | Post/news article page title |
| Article list title | 15–16px | 600 | 1.50 | normal | `.alist-title` — feed card titles |
| Section heading | 16px | 700 | 1.40 | normal | `.sec-head-title` — always paired with left bar |
| Nav item | 15px | 500–600 | 1.40 | normal | Left sidebar nav links |
| Body / Description | 13–14px | 400 | 1.50–1.60 | normal | Article descriptions, card subtitles |
| Meta / Label | 12px | 400–500 | 1.40 | normal | Dates, sources, reading time |
| Tag / Badge | 10–11px | 600–700 | 1.00 | 0.03em | Category badges — compact, high-weight |
| Sidebar item | 13px | 500 | 1.50 | normal | Right sidebar quick-news titles |
| Ticker | 12px | 500 | 1.00 | normal | Live price strip |
| Topbar | 12–12.5px | 400–600 | 1.00 | normal | Utility bar links |
| Button | 12.5–14px | 600 | 1.00 | normal | Action buttons |
| Sub-nav | 13px | 400–500 | 1.40 | normal | Left sidebar collapsed sub-menu links |

### Typographic Principles

- **Chinese readability first**: Line-height 1.5–1.6 for body text. CJK characters are denser than Latin — never drop below 1.4.
- **Clamp titles ruthlessly**: Article list titles always `line-clamp: 2`. Descriptions clamp to 1 line. This creates scannable, uniform feeds.
- **Numbers are data**: All prices, percentages, and market caps use `font-variant-numeric: tabular-nums` to prevent layout jitter when values update.
- **Weight signals hierarchy**: 700–800 headings → 600 card titles/active nav → 500 secondary nav → 400 body. Never use weight 300 — this is a data platform, not a luxury brand.
- **No italic in CJK context**: `font-style: italic` applies only to English prose `<h3>` tags inside `.app-prose`. Avoid in feed UI.

---

## 4. Component Stylings

### Section Heading (`.sec-head`)

The most distinctive recurring pattern. Every named content region opens with this component.

```
[▌] Section Title                          More →
```

- Container: `display: flex; justify-content: space-between; align-items: center; padding: 0 16px 10px`
- **Left bar**: `width: 3px; height: 18px; background: #f7931a; border-radius: 2px; flex-shrink: 0`
- Title: 16px, weight 700, `var(--fg)`, gap `8px` from bar via flex
- "More →" link: 12.5px, `var(--fg-muted)` → hover `#f7931a`, flex row with chevron

**Compact variant** (`.sec-hd`): Same left bar at 14px tall, no "more" link, `padding-bottom: 8px`, `border-bottom: 1px solid var(--border)`. Used inside post detail sidebars and widget headers.

---

### Left Navigation Sidebar (`.lsidebar`)

- Width: `200px`, sticky `top: 0`, `height: 100vh`, hidden at ≤768px (hamburger)
- Background: `var(--bg-sidebar)`, `border-right: 1px solid var(--border)`
- Scrollable with 3px-wide scrollbar

**Logo** (`.lsidebar-logo`):
- Icon: `34×34px`, `border-radius: 8px`, `background: #f7931a`, white "B" at 18px/900
- Wordmark: 18px, weight 900, letter-spacing `−0.02em`
- Separated from nav by `border-bottom: 1px solid var(--border)`

**Nav Item** (`.lnav-item`):
- Padding: `8px 16px`, font 15px weight 500
- `border-left: 3px solid transparent` — active: `border-left-color: #f7931a`
- Active/hover bg: `rgba(247,147,26,0.06–0.08)`, text: `#f7931a`, weight 600
- Transition: `background 0.12s, color 0.12s`

**Sub-menu** (`.lnav-sub`):
- 2-column grid `grid-template-columns: 1fr 1fr`, background `var(--bg-elevated)`
- Links: 13px, `var(--fg-muted)` → hover `#f7931a`, 4px radius, `padding: 5px 8px`

**Bottom Buttons** (`.lnav-btn`):
- Full-width, `border: 1px solid var(--border)`, radius 5px, 12.5px weight 600
- Background `var(--bg-elevated)` → hover: border `#f7931a`, text `#f7931a`, bg `rgba(247,147,26,0.10)`

---

### Article List Row (`.alist-item`)

Primary content display unit for article feeds.

```
[ THUMBNAIL 160×100 ]  [TAG]  TITLE TITLE TITLE TITLE
                              Description — one line max
                              Apr 17, 2026  ·  Source Name
```

- Container: `display: flex; gap: 14px; padding: 14px 16px`
- Background `var(--bg-card)` → hover `var(--bg-elevated)`, transition 0.12s
- Row separator: `border-bottom: 1px solid var(--border-subtle)` (except last)
- Outer wrapper (`.alist`): `margin: 0 16px 16px`, radius 6px, `border: 1px solid var(--border)`

**Thumbnail**: `160×100px` (→ `110×72px` tablet → `90×60px` mobile), radius 4px, hover `scale(1.04)` 0.25s
**Title**: 15px weight 600, `line-clamp: 2`, hover `color: #f7931a` 0.12s
**Description**: 13px `var(--fg-muted)`, `line-clamp: 1`, hidden at ≤500px
**Meta**: 12px `var(--fg-light)`, flex gap 8px, source name in `#f7931a`

---

### Hero Section (`.hero-section`)

Top-of-feed featured zone: 1 large card + 2×2 thumbnail grid.

- 2-column grid: `grid-template-columns: 1fr 280px`, gap 10px, `padding: 16px`
- Collapses to 1-column and hides thumb grid at ≤768px

**Main Hero** (`.hero-main`): 16/9 aspect, full-bleed image, gradient overlay `linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.75) 100%)`, title 18px/700/white bottom-positioned, hover image `scale(1.03)` 0.35s

**Thumbnails** (`.hero-thumb`): 2×2 grid, 16/9 each, 5px radius, title 12px/600/white absolute-bottom, hover `scale(1.05)` 0.3s

---

### Category Tag (`.ctag`)

- `padding: 2px 8px`, `border-radius: 3px`, 11px, weight 700, letter-spacing 0.03em
- `.ctag` default (orange): bg `rgba(247,147,26,0.10)`, text `#f7931a`
- `.ctag-blue`: bg `rgba(22,119,255,0.10)`, text `#1677ff`
- `.ctag-green`: bg `rgba(0,168,120,0.10)`, text `#00a878`
- `.ctag-red`: bg `rgba(229,57,53,0.10)`, text `#e53935`

---

### Generic Card (`.c-card`)

Used for grid-based content (coin cards, tool cards, related posts).

- Background `var(--bg-card)`, `border: 1px solid var(--border)`, radius 6px
- Shadow `var(--shadow-card)`, hover: `translateY(-2px)`, shadow intensifies, border-color `rgba(247,147,26,0.25)`
- Transition: `transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease`
- Image area: 16/9, `object-fit: cover`, hover `scale(1.04)` 0.3s

---

### Right Sidebar (`.rsidebar`)

- Width: `280px`, `border-left: 1px solid var(--border)`, `padding: 16px 0`, hidden at ≤1100px
- Each section (`.rsidebar-section`): `padding: 0 16px 16px`, `border-bottom: 1px solid var(--border-subtle)`
- Section head (`.rsidebar-head`): Same 3px orange bar pattern, 15px/700, `border-bottom: 1px solid var(--border)`

**Quick News Item** (`.qnews-item`):
- `display: flex; gap: 10px; padding: 9px 0`
- Left dot: 8px circle, default `#f7931a` (`.blue` = `#1677ff`, `.green` = `#00a878`, `.gray` = `var(--fg-light)`)
- Title: 13px weight 500, `line-clamp: 2`, hover `#f7931a`
- Time: 11.5px `var(--fg-light)` block below title

**Hot Rank** (`.hot-rank`): 15px weight 800, tabular-nums. Positions 1–3: `#f7931a`. Positions 4+: `var(--border)` (gray).

---

### Buttons

**Primary (Orange)**
- bg `#f7931a`, text white weight 600, `padding: 7px 16px`, radius 5px
- Hover bg `#e07800` (light) / `#ffa733` (dark)
- Use: "注册赚返佣", "立即注册", "Subscribe", primary CTAs

**Ghost / Outline**
- bg `var(--bg-elevated)`, text `var(--fg-muted)`, `border: 1px solid var(--border)`, radius 5px, 12.5px weight 600
- Hover: border `#f7931a`, text `#f7931a`, bg `rgba(247,147,26,0.10)`
- Use: secondary actions, nav action buttons

**More / Text Link**
- No bg, no border. Text `var(--fg-muted)` → hover `#f7931a`
- Bordered full-width variant (`.more-btn`): `border: 1px solid var(--border)`, radius 4px, 8px padding, 13px

---

### Language Switcher (`.lang-btn`)

- `padding: 2px 7px`, radius 3px, `border: 1px solid var(--border)`, 11px weight 600
- Default: transparent bg, `var(--fg-muted)` text
- Active: bg `#f7931a`, white text, border `#f7931a`
- Hover (inactive): text and border `#f7931a`

---

### Topbar + Live Ticker

**Topbar** (`.topbar`): Always dark (`#1a1b1f`), 12.5px text `#9a9baa`. Links hover `#ffffff`. Highlight pill: bg `#f7931a`, white text, `padding: 2px 10px`, radius 2px, weight 600.

**Ticker** (`.ticker-wrap`): Always near-black (`#080c16`). Left "LIVE" badge: `#3ecf8e`, 9px, weight 800, 1.6px letter-spacing. Pulsing dot: 5px, `#3ecf8e`, `box-shadow: 0 0 7px #3ecf8e`, 1.8s animation. Ticker text: 12px `#9ba3bc` weight 500. Scrolls `translateX(-50%)` over 45s linear, pauses on hover.

---

### Article Body Prose (`.app-prose` / `.nd-prose`)

- Text: `var(--fg)`. H1–H4: `var(--fg)`. H3 italic.
- Links: `var(--accent)`, dashed underline, `underline-offset: 4px`
- Blockquote: `border-left: 3px solid rgba(247,147,26,0.80)`, opacity 0.8
- Inline code: bg `var(--bg-elevated)`, radius 3px, `padding: 1px 5px`
- Images: `border: 1px solid var(--border)`, radius 4px
- **Glossary links** (`.glossary-link`): `color: inherit`, no underline, `border-bottom: 1px dashed var(--border)`, hover: border and text `#f7931a`

---

### Subscribe Form

- Input: `border: 1px solid var(--border)`, radius 5px, focus ring `#f7931a`
- CTA: Orange primary button
- States: Success (green check), Pending double-opt-in (amber "请查收确认邮件"), Rate-limited (muted "请稍后再试")

---

### Affiliate Banners

Style as trusted recommendations inside article flow — never as banner ads.

- Card bg `var(--bg-card)`, `border-left: 3px solid #f7931a`, standard card radius/shadow
- Never use fake urgency, countdown timers, or animated badges
- Include one-line risk disclaimer in 11px `var(--fg-light)` below every exchange CTA
- **Variants**: `mid` (after para 2), `article` (article end), `sidebar` (right sidebar compact), `floating` (bottom-right dismissible pill)

---

## 5. Layout Principles

### Spacing System

- Base unit: **8px**
- Scale: 4, 6, 8, 10, 12, 14, 16, 20, 24, 32, 48px
- Page gutter: `16px` (all content sections)
- Card stacking gap: `16px`
- Article row internal gap: `14px` (thumb ↔ body)
- Section head bottom gap: `10px`

### Grid Structure

```
┌──────────────────────────────────────────────────────────────┐
│  TOPBAR  (always dark, full-width, ~32px)                    │
│  TICKER  (always dark, full-width, ~30px)                    │
├──────────┬──────────────────────────────────────┬────────────┤
│          │                                      │            │
│  LEFT    │         MAIN CONTENT                 │  RIGHT     │
│  NAV     │         (fluid, min-width: 0)        │  SIDEBAR   │
│  200px   │         bg: var(--bg-page)           │  280px     │
│  sticky  │                                      │  sticky    │
│          │                                      │            │
└──────────┴──────────────────────────────────────┴────────────┘
```

- Max-width: `1400px` centered, `border-left/right: 1px solid var(--border)` on outer container
- Left sidebar hidden at ≤768px (hamburger), right sidebar hidden at ≤1100px
- Main column always visible, fluid

### Content Zones (Main Column, top to bottom)

1. **Hero Section** — featured article (large + 2×2 thumbs), `padding: 16px`
2. **Section Blocks** — each with `.sec-head` + article list or card grid
3. **Mid-feed Affiliate** — native-looking exchange banner
4. **Pagination bar** — `← Prev | Page X/N | Next →`

### Article Detail Layout

```
HEADER (sticky)
├── LEFT NAV (200px, sticky)
├── MAIN ARTICLE BODY
│   ├── Breadcrumb
│   ├── Hero image (1200×630, eager load)
│   ├── Type badge + tags
│   ├── H1 title
│   ├── Meta row (avatar · author · date · read time)
│   ├── Description (left accent border)
│   ├── Article body
│   ├── [MID AFFILIATE BANNER]
│   ├── FAQ section (Schema.org FAQPage)
│   ├── Source citation
│   ├── Author bio card
│   ├── [END AFFILIATE BANNER]
│   ├── Subscribe form
│   └── Related posts grid (2-col)
└── RIGHT SIDEBAR (240px, sticky)
    ├── ExchangeCTA
    └── CoinOrbit widget
```

- Article reading width: ~720px within main column
- Reading progress bar: 2px fixed top, `#f7931a`, `z-index: 100`
- Right sidebar stacks at ≤1024px

### Responsive Breakpoints

| Breakpoint | Change |
|------------|--------|
| `≤1400px` | Outer border removed, full-bleed layout |
| `≤1100px` | Right sidebar hidden |
| `≤768px` | Left sidebar collapses to mobile hamburger top bar |
| `≤500px` | Article descriptions hidden in list; thumbnails `90×60px`; hero grid hidden |

---

## 6. Iconography & Visual Signals

- **Icons**: Inline SVG for all critical UI icons. Emoji for section labels (📰 📊 🔥). No icon fonts.
- **Price direction**: `▲` green `var(--accent-green)` / `▼` red `var(--accent-red)`, always with `tabular-nums`
- **Live badge**: Pulsing emerald dot (`#3ecf8e`) — reserved exclusively for real-time data
- **Hot rank**: 1–3 in `#f7931a`, 4+ in `var(--border)` gray — natural eye pull to top items
- **Reading progress**: 2px fixed top, `#f7931a`, appears on scroll
- **Back-to-top**: Bottom-right circle, orange bg, appears after 300px scroll

---

## 7. Motion & Animation

All motion is **functional, not decorative**. Nothing moves without purpose.

| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Card hover | `translateY(-2px)` | 200ms | ease |
| Image zoom on hover | `scale(1.03–1.05)` | 250–350ms | ease |
| Nav bg/color | transition | 120ms | linear |
| Ticker scroll | `translateX(-50%)` | 45s | linear infinite |
| Live dot pulse | opacity + scale | 1.8s | ease-in-out infinite |
| Skeleton shimmer | bg-position sweep | 1.5s | linear infinite |
| Page sections fade | `opacity 0→1, translateY 10→0` | 300ms | ease, 50ms stagger |
| Scroll-subscribe overlay | slide-up | 300ms | ease |

**Rules:**
- UI hover transitions: ≤ 200ms. Decorative image zooms: ≤ 350ms.
- Skeleton shimmer on every async-loaded content region before data arrives
- Ticker pauses on hover (`animation-play-state: paused`) — user control always wins
- No entrance animations on text — only on cards and media elements

---

## 8. Dark / Light Mode

Theme applied via `data-theme="light"` / `data-theme="dark"` on `<html>`.

**Invariant (always dark, theme-independent):**
- Topbar: `#1a1b1f` / `#090a0f`
- Ticker: `#080c16`
- Bitcoin Orange: `#f7931a` — same in both modes

**Switching:**
- User preference stored in `localStorage` as `theme`
- `prefers-color-scheme` used as initial default
- Inline script in `<head>` applies theme before first paint — no flash
- Dark mode card hover gains orange halo shadow: `0 0 0 1px rgba(247,147,26,0.12)`

---

## 9. Monetization Surfaces

First-class design elements — style as trusted recommendations, never intrusive ads.

| Surface | Placement | Behavior |
|---------|-----------|----------|
| `BinanceBanner variant="mid"` | After article body, before FAQ | Orange-bordered card, native-looking |
| `BinanceBanner variant="article"` | Article end, before subscribe | Larger, referral code chip visible |
| `ExchangeCTA variant="sidebar"` | Right sidebar sticky | Compact vertical card |
| `BinanceFloating` | Fixed bottom-right | 48px pill, dismissible, orange bg |
| `ScrollSubscribe` | Triggered at 60% scroll depth | Slide-up overlay |
| `CoinOrbit widget` | Article right sidebar | `data-mode="hooks" data-sidebar="true"` |
| `SubscribeForm` | Article end + news list page 1 | Full-width, orange accent |

**Design contract:**
1. Match site visual language: `var(--bg-card)` bg, `border-left: 3px solid #f7931a`
2. No countdown timers, no fake urgency, no animated badges
3. Risk disclaimer line below every exchange CTA: 11px `var(--fg-light)`
4. Affiliate relationship disclosed in footer and About page

---

## 10. Content Patterns

### Crypto Price Display
- All values: `font-variant-numeric: tabular-nums`
- Positive: `var(--accent-green)` with `▲`
- Negative: `var(--accent-red)` with `▼`
- Data readability first — white bg cards, no heavy shadows

### Article Metadata Row
```
[Avatar 32px circle]  Author · Apr 17, 2026 · 5 min read · Source
```
- 12–13px, `var(--fg-muted)`. Separators `·` in `var(--fg-light)`. Avatar: 32×32px, 50% radius.

### Breadcrumb
```
Home / News / Article Title…
```
- 13px `var(--fg-muted)`. Current page `var(--fg)` (not linked). Separator `mx-2`.

### Related Posts Grid
- 2-column desktop, 1-column mobile. Image 16/9 + title 14px/600 + date. Same `.c-card` hover.

### FAQ Section
- `itemscope itemtype="https://schema.org/FAQPage"` on container
- Question: 15–16px weight 600 `var(--fg)`. Answer: 14px `var(--fg-muted)` `padding-left: 16px`
- Row separator: `1px solid var(--border-subtle)`

---

## 11. Multi-Language Conventions

| Language | URL Path | HTML `lang` |
|----------|----------|-------------|
| 简体中文 (default) | `/` | `zh-CN` |
| 繁體中文 | `/zh-tw/` | `zh-TW` |
| English | `/en/` | `en` |
| Español | `/es/` | `es` |
| Português | `/pt/` | `pt-BR` |

**Rules:**
- Chinese pages: body font-size ≥ 14px — CJK strokes need space
- All visible UI strings live in `src/i18n/ui.ts` — never hardcode in components
- Dates: `toLocaleDateString()` with locale — Chinese `年月日`, English `Mon D, YYYY`
- Pagination labels from i18n: 上一页/下一页, Previous/Next, Anterior/Siguiente
- Alternate RSS feeds: `/rss.xml` (zh-CN), `/en/rss.xml`, `/zh-tw/rss.xml`, `/es/rss.xml`, `/pt/rss.xml`

---

## 12. SEO & Structured Data Patterns

Every page type emits its own JSON-LD schema. Follow these patterns — do not add new schema types without cross-checking.

| Page Type | Schema Types |
|-----------|-------------|
| Homepage | `WebSite` + `WebPage` |
| Blog post | `Article` + `BreadcrumbList` + `FAQPage` (if has FAQs) + `HowTo` (if how-to) |
| News article | `NewsArticle` + `BreadcrumbList` + `FAQPage` |
| News list | `CollectionPage` + `BreadcrumbList` |
| Tag page | `CollectionPage` + `BreadcrumbList` |
| Coin page | `WebPage` + `BreadcrumbList` |

**Sitemaps declared in `robots.txt`:**
- `/sitemap-index.xml` — Astro-generated (static pages)
- `/sanity-sitemap.xml` — All Sanity news URLs + news list pages
- `/news-sitemap.xml` — Google News format, last 48h only
- `/image-sitemap.xml` — Hero/OG images with captions

---

*Last updated: April 2026. Source of truth alongside `src/styles/global.css` and `src/styles/typography.css`. When values conflict, the running CSS wins — update this doc to match.*
