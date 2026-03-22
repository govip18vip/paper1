# PostDetails.astro 完整集成代码

## 第1步：import 区追加

```astro
import BinanceBanner from "@/components/BinanceBanner.astro";
import BinanceFloating from "@/components/BinanceFloating.astro";
```

---

## 第2步：正文 Content 后插入 mid ``横幅

```astro
        <article id="article" class="app-prose" itemprop="articleBody"
          style="padding:24px;max-width:none;">
          <Content />
        </article>

        <!-- ✅ 文章正文后 mid横幅 -->
        <div style="padding:0 24px 8px;">
          <BinanceBanner variant="mid" lang={postLang} />
        </div>
```

---

## 第3步：HR 之前加 article 横幅

```astro
        <!-- ✅ article 横幅 -->
        <div style="padding:0 24px 16px;">
          <BinanceBanner variant="article" lang={postLang} />
        </div>

        <hr style="border:none;border-top:1px dashed var(--border);margin:0 24px;" />
```

---

## 第4步：右侧边栏末尾加 compact

```astro
      <div class="rsidebar-section">
        <BinanceBanner variant="compact" lang={postLang} />
      </div>
```

---

## 第5步：Footer 前加悬浮组件

```astro
  <BinanceFloating />
  <Footer />
```

---

## 第6步：首页 index.astro

顶部 import 加：
```astro
import BinanceBanner from "@/components/BinanceBanner.astro";
```

Hero Section 后面加：
```astro
      <BinanceBanner variant="hero" lang={lang} />
```

---

## 转化位置总结

| 位置 | 组件 | 出现时机 |
|------|------|---------|
| 文章正文后 | mid | 读完正文 |
| 文章底部 | article | 深度阅读后 |
| 右侧边栏 | compact | 全程可见 |
| 移动端底部 | BinanceFloating | 滚动300px后 |
| 桌面侧边卡片 | BinanceFloating | 读到40%后 |
| 首页 Hero 下 | hero | 首屏 |
| 落地页 /go/binance | 专属页 | 点击深度转化 |
