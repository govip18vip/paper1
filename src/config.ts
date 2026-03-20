export const SITE = {
  website: "https://your-crypto-domain.com/", // 替换为你的域名
  author: "加密研究员",
  profile: "",
  desc: "专业区块链资讯平台，提供比特币行情分析、交易所使用教程、加密钱包安全指南及 DeFi 协议深度解析。",
  title: "CryptoNews",  // 替换为你的站点名
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
} as const;
