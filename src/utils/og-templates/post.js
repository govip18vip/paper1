// src/utils/og-templates/post.js
// 品牌化 OG 图模板 — Bitcoin橙主题，替换原版黑白设计

import satori from "satori";
import { SITE } from "@/config";
import loadGoogleFonts from "../loadGoogleFont";

// 标签颜色映射
const tagColors = {
  btc:     { bg: "#fff3e0", text: "#e65100", label: "BTC" },
  bitcoin: { bg: "#fff3e0", text: "#e65100", label: "Bitcoin" },
  eth:     { bg: "#e8eaf6", text: "#283593", label: "ETH" },
  ethereum:{ bg: "#e8eaf6", text: "#283593", label: "Ethereum" },
  defi:    { bg: "#e8f5e9", text: "#1b5e20", label: "DeFi" },
  beginner:{ bg: "#e3f2fd", text: "#0d47a1", label: "入门" },
  docs:    { bg: "#e3f2fd", text: "#0d47a1", label: "教程" },
  wallet:  { bg: "#e8f5e9", text: "#1b5e20", label: "钱包" },
  market:  { bg: "#fce4ec", text: "#880e4f", label: "行情" },
};

function getTagStyle(tags = []) {
  for (const t of tags) {
    const key = t.toLowerCase();
    if (tagColors[key]) return tagColors[key];
  }
  return { bg: "#fff3e0", text: "#e65100", label: tags[0] || "资讯" };
}

export default async (post) => {
  const tagStyle = getTagStyle(post.data.tags);
  const title = post.data.title || SITE.title;
  const author = post.data.author || SITE.author;

  // 截断超长标题
  const displayTitle = title.length > 52 ? title.slice(0, 52) + "…" : title;

  return satori(
    {
      type: "div",
      props: {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#0d0e14",
          position: "relative",
          overflow: "hidden",
        },
        children: [
          // 橙色顶部条
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                top: 0, left: 0, right: 0,
                height: "5px",
                background: "linear-gradient(90deg, #f7931a, #ffc107, #f7931a)",
              },
            },
          },

          // 右侧装饰圆
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                right: "-60px",
                top: "-60px",
                width: "320px",
                height: "320px",
                borderRadius: "50%",
                background: "rgba(247,147,26,0.06)",
                border: "1px solid rgba(247,147,26,0.1)",
              },
            },
          },
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                right: "60px",
                bottom: "-40px",
                width: "200px",
                height: "200px",
                borderRadius: "50%",
                background: "rgba(247,147,26,0.04)",
                border: "1px solid rgba(247,147,26,0.08)",
              },
            },
          },

          // 主内容区
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "56px 72px 52px",
                height: "100%",
                position: "relative",
                zIndex: 1,
              },
              children: [
                // 顶部：LOGO + 标签
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    },
                    children: [
                      // Logo
                      {
                        type: "div",
                        props: {
                          style: {
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                          },
                          children: [
                            {
                              type: "div",
                              props: {
                                style: {
                                  width: "44px",
                                  height: "44px",
                                  borderRadius: "10px",
                                  background: "#f7931a",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "24px",
                                  fontWeight: 900,
                                  color: "#fff",
                                },
                                children: "₿",
                              },
                            },
                            {
                              type: "span",
                              props: {
                                style: {
                                  fontSize: "22px",
                                  fontWeight: 700,
                                  color: "#e4e6f0",
                                  letterSpacing: "-0.02em",
                                },
                                children: SITE.title,
                              },
                            },
                          ],
                        },
                      },
                      // 标签 badge
                      {
                        type: "div",
                        props: {
                          style: {
                            display: "flex",
                            alignItems: "center",
                            padding: "6px 18px",
                            borderRadius: "20px",
                            background: tagStyle.bg,
                            fontSize: "16px",
                            fontWeight: 700,
                            color: tagStyle.text,
                            letterSpacing: "0.02em",
                          },
                          children: tagStyle.label,
                        },
                      },
                    ],
                  },
                },

                // 中部：标题
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    },
                    children: [
                      {
                        type: "p",
                        props: {
                          style: {
                            fontSize: 58,
                            fontWeight: 800,
                            color: "#f1f3fa",
                            lineHeight: 1.25,
                            margin: 0,
                            letterSpacing: "-0.02em",
                            maxWidth: "900px",
                          },
                          children: displayTitle,
                        },
                      },
                    ],
                  },
                },

                // 底部：作者 + 网站
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    },
                    children: [
                      // 作者
                      {
                        type: "div",
                        props: {
                          style: {
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          },
                          children: [
                            {
                              type: "div",
                              props: {
                                style: {
                                  width: "36px",
                                  height: "36px",
                                  borderRadius: "50%",
                                  background: "rgba(247,147,26,0.2)",
                                  border: "1px solid rgba(247,147,26,0.4)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "16px",
                                  fontWeight: 700,
                                  color: "#f7931a",
                                },
                                children: author.slice(0,1).toUpperCase(),
                              },
                            },
                            {
                              type: "span",
                              props: {
                                style: {
                                  fontSize: "18px",
                                  fontWeight: 500,
                                  color: "#8b8fa8",
                                },
                                children: author,
                              },
                            },
                          ],
                        },
                      },
                      // 域名
                      {
                        type: "span",
                        props: {
                          style: {
                            fontSize: "18px",
                            fontWeight: 600,
                            color: "#f7931a",
                            opacity: 0.85,
                          },
                          children: new URL(SITE.website).hostname,
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      embedFont: true,
      fonts: await loadGoogleFonts(
        displayTitle + author + SITE.title + "₿资讯"
      ),
    }
  );
};
