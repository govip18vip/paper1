// src/utils/coinInfo.ts
// ─────────────────────────────────────────────────────────────
// 全面的币种详情多语言配置 — 类似 CoinMarketCap 级别信息
// 包含：白皮书、官网、创始人、共识机制、社交链接等
// ─────────────────────────────────────────────────────────────

import type { Lang } from "@/i18n/ui";

export interface CoinInfo {
  id: string;
  symbol: string;
  name: Record<Lang, string>;
  description: Record<Lang, string>;
  useCase: Record<Lang, string>;
  consensus?: string;
  blockTime?: string;
  maxSupply?: string;
  launchDate?: string;
  founder?: string;
  founderFull?: Record<Lang, string>;
  officialWebsite?: string;
  whitepaper?: string;
  blockExplorer?: string;
  github?: string;
  twitter?: string;
  telegram?: string;
  reddit?: string;
  discord?: string;
  coingeckoId: string;
  cmcId?: number;
  color: string;       // 品牌色
  emoji: string;       // 图标
  tags: string[];      // 相关标签
  binanceSymbol: string; // Binance 交易对符号
}

export const COIN_DB: Record<string, CoinInfo> = {
  bitcoin: {
    id: "bitcoin",
    symbol: "BTC",
    binanceSymbol: "BTCUSDT",
    color: "#f7931a",
    emoji: "₿",
    tags: ["btc", "bitcoin", "比特币"],
    name: {
      "zh-CN": "比特币", "zh-TW": "比特幣", en: "Bitcoin", es: "Bitcoin", pt: "Bitcoin",
    },
    description: {
      "zh-CN": "世界上第一个去中心化数字货币，采用工作量证明（PoW）共识机制。总量永久固定2100万枚，被称为「数字黄金」。",
      "zh-TW": "世界上第一個去中心化數字貨幣，採用工作量證明（PoW）共識機制。總量永久固定2100萬枚，被稱為「數位黃金」。",
      en: "The world's first decentralized digital currency using Proof of Work (PoW) consensus. Total supply hard-capped at 21 million BTC, often called 'digital gold'.",
      es: "La primera criptomoneda descentralizada del mundo con consenso PoW. Suministro total fijo de 21 millones de BTC, llamada 'oro digital'.",
      pt: "A primeira criptomoeda descentralizada do mundo usando PoW. Fornecimento total fixo em 21 milhões de BTC, chamada de 'ouro digital'.",
    },
    useCase: {
      "zh-CN": "价值储存、支付工具、数字黄金、通胀对冲",
      "zh-TW": "價值儲存、支付工具、數位黃金、通膨對沖",
      en: "Store of value, payment method, digital gold, inflation hedge",
      es: "Almacenamiento de valor, método de pago, oro digital",
      pt: "Armazenamento de valor, método de pagamento, ouro digital",
    },
    consensus: "Proof of Work (PoW / SHA-256)",
    blockTime: "~10 min",
    maxSupply: "21,000,000 BTC",
    launchDate: "2009-01-03",
    founder: "Satoshi Nakamoto",
    founderFull: {
      "zh-CN": "中本聪（Satoshi Nakamoto）— 匿名创始人，2008年发布白皮书",
      "zh-TW": "中本聰（Satoshi Nakamoto）— 匿名創始人，2008年發佈白皮書",
      en: "Satoshi Nakamoto — pseudonymous creator, published whitepaper in 2008",
      es: "Satoshi Nakamoto — creador pseudónimo, publicó el whitepaper en 2008",
      pt: "Satoshi Nakamoto — criador pseudônimo, publicou o whitepaper em 2008",
    },
    officialWebsite: "https://bitcoin.org",
    whitepaper: "https://bitcoin.org/bitcoin.pdf",
    blockExplorer: "https://blockchair.com/bitcoin",
    github: "https://github.com/bitcoin/bitcoin",
    twitter: "https://x.com/bitcoin",
    reddit: "https://reddit.com/r/bitcoin",
    coingeckoId: "bitcoin",
    cmcId: 1,
  },

  ethereum: {
    id: "ethereum",
    symbol: "ETH",
    binanceSymbol: "ETHUSDT",
    color: "#627eea",
    emoji: "⟠",
    tags: ["eth", "ethereum", "以太坊"],
    name: {
      "zh-CN": "以太坊", "zh-TW": "以太坊", en: "Ethereum", es: "Ethereum", pt: "Ethereum",
    },
    description: {
      "zh-CN": "全球最大的智能合约平台，支持 DeFi、NFT、Web3 应用。2022年9月完成向权益证明(PoS)的合并升级，大幅降低能耗。",
      "zh-TW": "全球最大的智能合約平台，支持 DeFi、NFT、Web3 應用。2022年9月完成向權益證明(PoS)的合併升級。",
      en: "World's largest smart contract platform powering DeFi, NFTs, and Web3. Completed the Merge to Proof of Stake in Sept 2022, reducing energy consumption by ~99.95%.",
      es: "La plataforma de contratos inteligentes más grande del mundo. Completó la transición a PoS en septiembre de 2022.",
      pt: "A maior plataforma de contratos inteligentes do mundo. Concluiu a transição para PoS em setembro de 2022.",
    },
    useCase: {
      "zh-CN": "智能合约、DeFi、NFT、Web3 基础设施、质押收益",
      "zh-TW": "智能合約、DeFi、NFT、Web3 基礎設施、質押收益",
      en: "Smart contracts, DeFi, NFTs, Web3 infrastructure, staking yields",
      es: "Contratos inteligentes, DeFi, NFT, infraestructura Web3",
      pt: "Contratos inteligentes, DeFi, NFT, infraestrutura Web3",
    },
    consensus: "Proof of Stake (PoS)",
    blockTime: "~12 sec",
    maxSupply: "No hard cap (deflationary via EIP-1559)",
    launchDate: "2015-07-30",
    founder: "Vitalik Buterin",
    founderFull: {
      "zh-CN": "Vitalik Buterin（维塔利克·布特林）— 1994年出生的俄裔加拿大程序员",
      "zh-TW": "Vitalik Buterin（維塔利克·布特林）— 1994年出生的俄裔加拿大程式設計師",
      en: "Vitalik Buterin — Russian-Canadian programmer, born 1994, proposed Ethereum in 2013",
      es: "Vitalik Buterin — programador ruso-canadiense, nacido en 1994",
      pt: "Vitalik Buterin — programador russo-canadense, nascido em 1994",
    },
    officialWebsite: "https://ethereum.org",
    whitepaper: "https://ethereum.org/en/whitepaper/",
    blockExplorer: "https://etherscan.io",
    github: "https://github.com/ethereum",
    twitter: "https://x.com/ethereum",
    reddit: "https://reddit.com/r/ethereum",
    discord: "https://discord.gg/ethereum-org",
    coingeckoId: "ethereum",
    cmcId: 1027,
  },

  binancecoin: {
    id: "binancecoin",
    symbol: "BNB",
    binanceSymbol: "BNBUSDT",
    color: "#F0B90B",
    emoji: "🔶",
    tags: ["bnb", "binance"],
    name: {
      "zh-CN": "币安币", "zh-TW": "幣安幣", en: "BNB", es: "BNB", pt: "BNB",
    },
    description: {
      "zh-CN": "币安生态原生代币，用于交易手续费折扣、BNB Chain Gas费、Launchpad参与等。定期通过自动燃烧机制减少供应。",
      "zh-TW": "幣安生態原生代幣，用於交易手續費折扣、BNB Chain Gas費、Launchpad參與等。",
      en: "Native token of the Binance ecosystem. Used for trading fee discounts, BNB Chain gas, Launchpad participation, and more. Regularly burned to reduce supply.",
      es: "Token nativo del ecosistema Binance. Utilizado para descuentos de comisiones y gas de BNB Chain.",
      pt: "Token nativo do ecossistema Binance. Usado para descontos de taxas e gas da BNB Chain.",
    },
    useCase: {
      "zh-CN": "交易手续费折扣、BNB Chain生态、Launchpad、质押",
      "zh-TW": "交易手續費折扣、BNB Chain生態、Launchpad、質押",
      en: "Trading fee discounts, BNB Chain ecosystem, Launchpad, staking",
      es: "Descuentos de tarifas, ecosistema BNB Chain, Launchpad",
      pt: "Descontos de taxa, ecossistema BNB Chain, Launchpad",
    },
    consensus: "Proof of Staked Authority (PoSA)",
    blockTime: "~3 sec",
    maxSupply: "200,000,000 BNB (with burns)",
    launchDate: "2017-07-14",
    founder: "Changpeng Zhao (CZ)",
    founderFull: {
      "zh-CN": "赵长鹏 (CZ) — 华裔加拿大企业家，币安创始人兼前CEO",
      "zh-TW": "趙長鵬 (CZ) — 華裔加拿大企業家，幣安創始人兼前CEO",
      en: "Changpeng Zhao (CZ) — Chinese-Canadian entrepreneur, Binance founder and former CEO",
      es: "Changpeng Zhao (CZ) — empresario chino-canadiense, fundador de Binance",
      pt: "Changpeng Zhao (CZ) — empresário sino-canadense, fundador da Binance",
    },
    officialWebsite: "https://www.bnbchain.org",
    whitepaper: "https://github.com/bnb-chain/whitepaper",
    blockExplorer: "https://bscscan.com",
    github: "https://github.com/bnb-chain",
    twitter: "https://x.com/BNBCHAIN",
    telegram: "https://t.me/bnbchain",
    coingeckoId: "binancecoin",
    cmcId: 1839,
  },

  solana: {
    id: "solana", symbol: "SOL", binanceSymbol: "SOLUSDT",
    color: "#9945FF", emoji: "◎", tags: ["sol", "solana"],
    name: { "zh-CN": "Solana", "zh-TW": "Solana", en: "Solana", es: "Solana", pt: "Solana" },
    description: {
      "zh-CN": "高性能区块链平台，支持每秒数万笔交易，手续费极低。使用独特的时间历史证明(PoH)共识，已成为 DeFi 和 Meme 币的热门平台。",
      "zh-TW": "高性能區塊鏈平台，支持每秒數萬筆交易，手續費極低。使用獨特的時間歷史證明(PoH)共識。",
      en: "High-performance blockchain supporting tens of thousands of TPS with ultra-low fees. Uses unique Proof of History (PoH) consensus. Popular for DeFi and meme coins.",
      es: "Blockchain de alto rendimiento con miles de TPS y tarifas ultra bajas. Usa Proof of History (PoH).",
      pt: "Blockchain de alto desempenho com dezenas de milhares de TPS e taxas ultra baixas.",
    },
    useCase: { "zh-CN": "DeFi、NFT、高频交易、游戏、Meme币", "zh-TW": "DeFi、NFT、高頻交易、遊戲", en: "DeFi, NFTs, high-frequency trading, gaming, meme coins", es: "DeFi, NFT, trading de alta frecuencia, juegos", pt: "DeFi, NFTs, trading de alta frequência, jogos" },
    consensus: "Proof of History (PoH) + Proof of Stake",
    blockTime: "~400 ms", maxSupply: "No hard cap", launchDate: "2020-03-16",
    founder: "Anatoly Yakovenko",
    founderFull: { "zh-CN": "Anatoly Yakovenko — 前高通工程师", "zh-TW": "Anatoly Yakovenko — 前高通工程師", en: "Anatoly Yakovenko — former Qualcomm engineer", es: "Anatoly Yakovenko — ex ingeniero de Qualcomm", pt: "Anatoly Yakovenko — ex engenheiro da Qualcomm" },
    officialWebsite: "https://solana.com", whitepaper: "https://solana.com/solana-whitepaper.pdf",
    blockExplorer: "https://solscan.io", github: "https://github.com/solana-labs",
    twitter: "https://x.com/solana", telegram: "https://t.me/solana", reddit: "https://reddit.com/r/solana",
    discord: "https://discord.gg/solana", coingeckoId: "solana", cmcId: 5426,
  },

  ripple: {
    id: "ripple", symbol: "XRP", binanceSymbol: "XRPUSDT",
    color: "#346AA9", emoji: "✕", tags: ["xrp", "ripple"],
    name: { "zh-CN": "瑞波币", "zh-TW": "瑞波幣", en: "XRP", es: "XRP", pt: "XRP" },
    description: {
      "zh-CN": "专注于跨境支付和银行间结算的数字资产。由Ripple Labs开发，交易速度快、手续费极低，已与多家银行和金融机构建立合作。",
      "zh-TW": "專注於跨境支付和銀行間結算的數字資產。由Ripple Labs開發，已與多家銀行建立合作。",
      en: "Digital asset focused on cross-border payments and bank settlements. Developed by Ripple Labs with partnerships with major banks and financial institutions.",
      es: "Activo digital centrado en pagos transfronterizos. Desarrollado por Ripple Labs con asociaciones bancarias.",
      pt: "Ativo digital focado em pagamentos internacionais. Desenvolvido pela Ripple Labs com parcerias bancárias.",
    },
    useCase: { "zh-CN": "跨境支付、银行结算、汇款、流动性桥梁", "zh-TW": "跨境支付、銀行結算、匯款", en: "Cross-border payments, bank settlements, remittance, liquidity bridge", es: "Pagos transfronterizos, liquidación bancaria", pt: "Pagamentos internacionais, liquidação bancária" },
    consensus: "XRP Ledger Consensus Protocol",
    blockTime: "~3-5 sec", maxSupply: "100,000,000,000 XRP", launchDate: "2012-06-02",
    founder: "Chris Larsen & Jed McCaleb",
    officialWebsite: "https://xrpl.org", whitepaper: "https://ripple.com/files/ripple_consensus_whitepaper.pdf",
    blockExplorer: "https://xrpscan.com", github: "https://github.com/ripple",
    twitter: "https://x.com/Ripple", coingeckoId: "ripple", cmcId: 52,
  },

  cardano: {
    id: "cardano", symbol: "ADA", binanceSymbol: "ADAUSDT",
    color: "#0033AD", emoji: "◆", tags: ["ada", "cardano"],
    name: { "zh-CN": "卡尔达诺", "zh-TW": "卡爾達諾", en: "Cardano", es: "Cardano", pt: "Cardano" },
    description: {
      "zh-CN": "基于同行评审学术研究的第三代区块链平台，采用Ouroboros PoS共识算法。强调安全性、可持续性和可扩展性。",
      "zh-TW": "基於同行評審學術研究的第三代區塊鏈平台，採用Ouroboros PoS共識算法。",
      en: "Third-generation blockchain built on peer-reviewed academic research. Uses Ouroboros PoS consensus, emphasizing security, sustainability, and scalability.",
      es: "Blockchain de tercera generación basada en investigación académica revisada por pares.",
      pt: "Blockchain de terceira geração baseada em pesquisa acadêmica revisada por pares.",
    },
    useCase: { "zh-CN": "智能合约、DeFi、身份认证、供应链", "zh-TW": "智能合約、DeFi、身份認證", en: "Smart contracts, DeFi, identity, supply chain", es: "Contratos inteligentes, DeFi, identidad", pt: "Contratos inteligentes, DeFi, identidade" },
    consensus: "Ouroboros (PoS)",
    blockTime: "~20 sec", maxSupply: "45,000,000,000 ADA", launchDate: "2017-09-29",
    founder: "Charles Hoskinson",
    founderFull: { "zh-CN": "Charles Hoskinson — 以太坊联合创始人之一", "zh-TW": "Charles Hoskinson — 以太坊聯合創始人之一", en: "Charles Hoskinson — Ethereum co-founder", es: "Charles Hoskinson — cofundador de Ethereum", pt: "Charles Hoskinson — cofundador do Ethereum" },
    officialWebsite: "https://cardano.org", whitepaper: "https://docs.cardano.org/about-cardano/introduction",
    blockExplorer: "https://cardanoscan.io", github: "https://github.com/cardano-foundation",
    twitter: "https://x.com/Cardano", telegram: "https://t.me/Cardano", reddit: "https://reddit.com/r/cardano",
    coingeckoId: "cardano", cmcId: 2010,
  },

  dogecoin: {
    id: "dogecoin", symbol: "DOGE", binanceSymbol: "DOGEUSDT",
    color: "#C2A633", emoji: "🐕", tags: ["doge", "dogecoin", "狗狗币"],
    name: { "zh-CN": "狗狗币", "zh-TW": "狗狗幣", en: "Dogecoin", es: "Dogecoin", pt: "Dogecoin" },
    description: {
      "zh-CN": "起源于网络迷因的加密货币，后因Elon Musk等名人推广而爆火。采用Scrypt算法的PoW共识，社区活跃度极高。",
      "zh-TW": "起源於網路迷因的加密貨幣，後因Elon Musk等名人推廣而爆紅。",
      en: "Cryptocurrency born from an internet meme that gained massive popularity through Elon Musk endorsements. Uses Scrypt PoW consensus with an active community.",
      es: "Criptomoneda nacida de un meme de internet, popularizada por Elon Musk.",
      pt: "Criptomoeda nascida de um meme da internet, popularizada por Elon Musk.",
    },
    useCase: { "zh-CN": "小额支付、打赏、社区货币、Meme文化", "zh-TW": "小額支付、打賞、社區貨幣", en: "Micro-payments, tipping, community currency, meme culture", es: "Micropagos, propinas, moneda comunitaria", pt: "Micropagamentos, gorjetas, moeda comunitária" },
    consensus: "Proof of Work (Scrypt)",
    blockTime: "~1 min", maxSupply: "No cap (inflationary)", launchDate: "2013-12-06",
    founder: "Billy Markus & Jackson Palmer",
    officialWebsite: "https://dogecoin.com", blockExplorer: "https://dogechain.info",
    github: "https://github.com/dogecoin/dogecoin", twitter: "https://x.com/dogecoin",
    reddit: "https://reddit.com/r/dogecoin", coingeckoId: "dogecoin", cmcId: 74,
  },

  tron: {
    id: "tron", symbol: "TRX", binanceSymbol: "TRXUSDT",
    color: "#E50914", emoji: "♦", tags: ["trx", "tron", "波场"],
    name: { "zh-CN": "波场", "zh-TW": "波場", en: "TRON", es: "TRON", pt: "TRON" },
    description: {
      "zh-CN": "去中心化互联网基础设施，专注于内容分发和娱乐。是USDT最大的流通网络之一，交易速度快且Gas费几乎为零。",
      "zh-TW": "去中心化互聯網基礎設施，專注於內容分發和娛樂。是USDT最大的流通網路之一。",
      en: "Decentralized internet infrastructure focused on content distribution. One of the largest networks for USDT circulation with near-zero transaction fees.",
      es: "Infraestructura de internet descentralizada para distribución de contenido.",
      pt: "Infraestrutura de internet descentralizada focada em distribuição de conteúdo.",
    },
    useCase: { "zh-CN": "稳定币转账、内容分发、DeFi、游戏", "zh-TW": "穩定幣轉賬、內容分發、DeFi", en: "Stablecoin transfers, content distribution, DeFi, gaming", es: "Transferencias de stablecoins, distribución de contenido", pt: "Transferências de stablecoins, distribuição de conteúdo" },
    consensus: "Delegated Proof of Stake (DPoS)",
    blockTime: "~3 sec", maxSupply: "No hard cap", launchDate: "2017-08-28",
    founder: "Justin Sun (孙宇晨)",
    officialWebsite: "https://tron.network", whitepaper: "https://tron.network/static/doc/white_paper_v_2_0.pdf",
    blockExplorer: "https://tronscan.org", github: "https://github.com/tronprotocol",
    twitter: "https://x.com/traborig", telegram: "https://t.me/tronnetworkEN",
    coingeckoId: "tron", cmcId: 1958,
  },

  polkadot: {
    id: "polkadot", symbol: "DOT", binanceSymbol: "DOTUSDT",
    color: "#E6007A", emoji: "●", tags: ["dot", "polkadot"],
    name: { "zh-CN": "波卡", "zh-TW": "波卡", en: "Polkadot", es: "Polkadot", pt: "Polkadot" },
    description: {
      "zh-CN": "跨链互操作协议，允许不同区块链之间安全通信和数据传输。由以太坊联合创始人Gavin Wood创建。",
      "zh-TW": "跨鏈互操作協議，允許不同區塊鏈之間安全通信和數據傳輸。由以太坊聯合創始人Gavin Wood創建。",
      en: "Cross-chain interoperability protocol enabling secure communication between different blockchains. Created by Ethereum co-founder Gavin Wood.",
      es: "Protocolo de interoperabilidad cross-chain creado por el cofundador de Ethereum, Gavin Wood.",
      pt: "Protocolo de interoperabilidade cross-chain criado pelo cofundador do Ethereum, Gavin Wood.",
    },
    useCase: { "zh-CN": "跨链互操作、平行链、去中心化治理", "zh-TW": "跨鏈互操作、平行鏈", en: "Cross-chain interoperability, parachains, governance", es: "Interoperabilidad cross-chain, parachains", pt: "Interoperabilidade cross-chain, parachains" },
    consensus: "Nominated Proof of Stake (NPoS)",
    blockTime: "~6 sec", launchDate: "2020-05-26",
    founder: "Gavin Wood",
    founderFull: { "zh-CN": "Gavin Wood — 以太坊联合创始人、Solidity语言发明者", "zh-TW": "Gavin Wood — 以太坊聯合創始人", en: "Gavin Wood — Ethereum co-founder, inventor of Solidity", es: "Gavin Wood — cofundador de Ethereum", pt: "Gavin Wood — cofundador do Ethereum" },
    officialWebsite: "https://polkadot.network", whitepaper: "https://polkadot.network/whitepaper/",
    blockExplorer: "https://polkadot.subscan.io", github: "https://github.com/polkadot-fellows",
    twitter: "https://x.com/Polkadot", reddit: "https://reddit.com/r/polkadot",
    coingeckoId: "polkadot", cmcId: 6636,
  },

  litecoin: {
    id: "litecoin", symbol: "LTC", binanceSymbol: "LTCUSDT",
    color: "#BFBBBB", emoji: "Ł", tags: ["ltc", "litecoin", "莱特币"],
    name: { "zh-CN": "莱特币", "zh-TW": "萊特幣", en: "Litecoin", es: "Litecoin", pt: "Litecoin" },
    description: {
      "zh-CN": "比特币的「轻量版」分叉，出块速度更快（2.5分钟），总量8400万枚。被视为比特币的测试网络和补充支付方案。",
      "zh-TW": "比特幣的「輕量版」分叉，出塊速度更快（2.5分鐘），總量8400萬枚。",
      en: "A 'lighter' Bitcoin fork with 2.5-minute block times and 84 million max supply. Often seen as Bitcoin's testing ground and complementary payment solution.",
      es: "Fork 'ligero' de Bitcoin con bloques de 2.5 minutos y suministro máximo de 84 millones.",
      pt: "Fork 'leve' do Bitcoin com blocos de 2,5 minutos e fornecimento máximo de 84 milhões.",
    },
    useCase: { "zh-CN": "日常支付、快速转账、比特币补充", "zh-TW": "日常支付、快速轉賬", en: "Daily payments, fast transfers, Bitcoin complement", es: "Pagos diarios, transferencias rápidas", pt: "Pagamentos diários, transferências rápidas" },
    consensus: "Proof of Work (Scrypt)",
    blockTime: "~2.5 min", maxSupply: "84,000,000 LTC", launchDate: "2011-10-07",
    founder: "Charlie Lee",
    officialWebsite: "https://litecoin.org", blockExplorer: "https://blockchair.com/litecoin",
    github: "https://github.com/litecoin-project", twitter: "https://x.com/litecoin",
    reddit: "https://reddit.com/r/litecoin", coingeckoId: "litecoin", cmcId: 2,
  },

  chainlink: {
    id: "chainlink", symbol: "LINK", binanceSymbol: "LINKUSDT",
    color: "#2A5ADA", emoji: "🔗", tags: ["link", "chainlink"],
    name: { "zh-CN": "Chainlink", "zh-TW": "Chainlink", en: "Chainlink", es: "Chainlink", pt: "Chainlink" },
    description: {
      "zh-CN": "去中心化预言机网络，为智能合约提供可靠的链下数据。是DeFi生态最核心的基础设施之一，被数百个项目集成。",
      "zh-TW": "去中心化預言機網路，為智能合約提供可靠的鏈下數據。是DeFi生態最核心的基礎設施之一。",
      en: "Decentralized oracle network providing reliable off-chain data to smart contracts. Core DeFi infrastructure integrated by hundreds of projects.",
      es: "Red de oráculos descentralizados que proporciona datos off-chain a contratos inteligentes.",
      pt: "Rede de oráculos descentralizados fornecendo dados off-chain para contratos inteligentes.",
    },
    useCase: { "zh-CN": "预言机、跨链通信、CCIP、数据验证", "zh-TW": "預言機、跨鏈通信、CCIP", en: "Oracles, cross-chain communication (CCIP), data verification", es: "Oráculos, comunicación cross-chain, verificación de datos", pt: "Oráculos, comunicação cross-chain, verificação de dados" },
    consensus: "Off-chain Reporting (OCR)",
    launchDate: "2017-09-19", founder: "Sergey Nazarov",
    officialWebsite: "https://chain.link", whitepaper: "https://chain.link/whitepaper",
    blockExplorer: "https://etherscan.io/token/0x514910771af9ca656af840dff83e8264ecf986ca",
    github: "https://github.com/smartcontractkit", twitter: "https://x.com/chainlink",
    discord: "https://discord.gg/chainlink", coingeckoId: "chainlink", cmcId: 1975,
  },

  "avalanche-2": {
    id: "avalanche-2", symbol: "AVAX", binanceSymbol: "AVAXUSDT",
    color: "#E84142", emoji: "▲", tags: ["avax", "avalanche"],
    name: { "zh-CN": "Avalanche", "zh-TW": "Avalanche", en: "Avalanche", es: "Avalanche", pt: "Avalanche" },
    description: {
      "zh-CN": "高吞吐量智能合约平台，以亚秒级终端确认时间著称。采用独特的雪崩共识协议，支持创建自定义子网。",
      "zh-TW": "高吞吐量智能合約平台，以亞秒級終端確認時間著稱。",
      en: "High-throughput smart contract platform known for sub-second finality. Uses unique Avalanche consensus protocol with customizable subnets.",
      es: "Plataforma de contratos inteligentes de alto rendimiento con finalidad sub-segundo.",
      pt: "Plataforma de contratos inteligentes de alto desempenho com finalidade sub-segundo.",
    },
    useCase: { "zh-CN": "DeFi、子网、企业区块链、游戏", "zh-TW": "DeFi、子網、企業區塊鏈", en: "DeFi, subnets, enterprise blockchain, gaming", es: "DeFi, subnets, blockchain empresarial", pt: "DeFi, subnets, blockchain empresarial" },
    consensus: "Avalanche Consensus (PoS)",
    blockTime: "~2 sec", maxSupply: "720,000,000 AVAX", launchDate: "2020-09-21",
    founder: "Emin Gün Sirer",
    officialWebsite: "https://avax.network", whitepaper: "https://www.avalabs.org/whitepapers",
    blockExplorer: "https://snowtrace.io", github: "https://github.com/ava-labs",
    twitter: "https://x.com/avaborig", telegram: "https://t.me/avalancheavax",
    discord: "https://discord.gg/avalanche", coingeckoId: "avalanche-2", cmcId: 5805,
  },

  uniswap: {
    id: "uniswap", symbol: "UNI", binanceSymbol: "UNIUSDT",
    color: "#FF007A", emoji: "🦄", tags: ["uni", "uniswap", "defi"],
    name: { "zh-CN": "Uniswap", "zh-TW": "Uniswap", en: "Uniswap", es: "Uniswap", pt: "Uniswap" },
    description: {
      "zh-CN": "以太坊上最大的去中心化交易所(DEX)，使用自动做市商(AMM)模型。UNI是其治理代币，持有者可参与协议决策。",
      "zh-TW": "以太坊上最大的去中心化交易所(DEX)，使用自動做市商(AMM)模型。",
      en: "Largest decentralized exchange (DEX) on Ethereum using an Automated Market Maker (AMM) model. UNI is the governance token.",
      es: "El DEX más grande de Ethereum usando modelo AMM. UNI es el token de gobernanza.",
      pt: "O maior DEX no Ethereum usando modelo AMM. UNI é o token de governança.",
    },
    useCase: { "zh-CN": "去中心化交易、流动性提供、治理投票", "zh-TW": "去中心化交易、流動性提供", en: "Decentralized trading, liquidity provision, governance", es: "Trading descentralizado, provisión de liquidez", pt: "Trading descentralizado, provisão de liquidez" },
    launchDate: "2018-11-02", founder: "Hayden Adams",
    officialWebsite: "https://uniswap.org", whitepaper: "https://uniswap.org/whitepaper-v3.pdf",
    blockExplorer: "https://etherscan.io/token/0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    github: "https://github.com/Uniswap", twitter: "https://x.com/Uniswap",
    discord: "https://discord.gg/uniswap", coingeckoId: "uniswap", cmcId: 7083,
  },

  stellar: {
    id: "stellar", symbol: "XLM", binanceSymbol: "XLMUSDT",
    color: "#000000", emoji: "★", tags: ["xlm", "stellar"],
    name: { "zh-CN": "恒星币", "zh-TW": "恆星幣", en: "Stellar", es: "Stellar", pt: "Stellar" },
    description: {
      "zh-CN": "开源支付网络，专注于金融包容性和跨境汇款。与IBM等企业合作，手续费极低（约0.00001 XLM）。",
      "zh-TW": "開源支付網路，專注於金融包容性和跨境匯款。",
      en: "Open-source payment network focused on financial inclusion and cross-border remittance. Partners with IBM, extremely low fees (~0.00001 XLM).",
      es: "Red de pago de código abierto enfocada en inclusión financiera.",
      pt: "Rede de pagamento de código aberto focada em inclusão financeira.",
    },
    useCase: { "zh-CN": "跨境汇款、代币化资产、企业支付", "zh-TW": "跨境匯款、代幣化資產", en: "Cross-border remittance, tokenized assets, enterprise payments", es: "Remesas internacionales, activos tokenizados", pt: "Remessas internacionais, ativos tokenizados" },
    consensus: "Stellar Consensus Protocol (SCP)",
    blockTime: "~5 sec", maxSupply: "50,001,806,812 XLM", launchDate: "2014-07-31",
    founder: "Jed McCaleb",
    officialWebsite: "https://stellar.org", whitepaper: "https://www.stellar.org/papers/stellar-consensus-protocol",
    blockExplorer: "https://stellarchain.io", github: "https://github.com/stellar",
    twitter: "https://x.com/StellarOrg", coingeckoId: "stellar", cmcId: 512,
  },

  cosmos: {
    id: "cosmos", symbol: "ATOM", binanceSymbol: "ATOMUSDT",
    color: "#2E3148", emoji: "⊕", tags: ["atom", "cosmos"],
    name: { "zh-CN": "Cosmos", "zh-TW": "Cosmos", en: "Cosmos", es: "Cosmos", pt: "Cosmos" },
    description: {
      "zh-CN": "「区块链互联网」，通过IBC协议实现不同区块链之间的互操作。Cosmos SDK被众多项目采用构建应用链。",
      "zh-TW": "「區塊鏈互聯網」，通過IBC協議實現不同區塊鏈之間的互操作。",
      en: "The 'Internet of Blockchains' enabling interoperability through the IBC protocol. Cosmos SDK is widely used to build application-specific chains.",
      es: "El 'Internet de Blockchains' con interoperabilidad a través del protocolo IBC.",
      pt: "A 'Internet de Blockchains' com interoperabilidade através do protocolo IBC.",
    },
    useCase: { "zh-CN": "跨链通信(IBC)、应用链、质押", "zh-TW": "跨鏈通信(IBC)、應用鏈", en: "Cross-chain communication (IBC), app chains, staking", es: "Comunicación cross-chain, cadenas de aplicación", pt: "Comunicação cross-chain, app chains" },
    consensus: "Tendermint BFT (PoS)",
    blockTime: "~6 sec", launchDate: "2019-03-13",
    founder: "Jae Kwon & Ethan Buchman",
    officialWebsite: "https://cosmos.network", whitepaper: "https://v1.cosmos.network/resources/whitepaper",
    blockExplorer: "https://www.mintscan.io/cosmos", github: "https://github.com/cosmos",
    twitter: "https://x.com/cosmos", discord: "https://discord.gg/cosmosnetwork",
    coingeckoId: "cosmos", cmcId: 3794,
  },

  "bitcoin-cash": {
    id: "bitcoin-cash", symbol: "BCH", binanceSymbol: "BCHUSDT",
    color: "#0AC18E", emoji: "¤", tags: ["bch", "bitcoin-cash"],
    name: { "zh-CN": "比特币现金", "zh-TW": "比特幣現金", en: "Bitcoin Cash", es: "Bitcoin Cash", pt: "Bitcoin Cash" },
    description: {
      "zh-CN": "2017年从比特币硬分叉而来，区块大小扩大到32MB，旨在成为日常支付的「电子现金」。",
      "zh-TW": "2017年從比特幣硬分叉而來，區塊大小擴大到32MB。",
      en: "Hard fork of Bitcoin from 2017 with 32MB block size, aimed at becoming 'electronic cash' for daily payments.",
      es: "Hard fork de Bitcoin de 2017 con bloques de 32MB para pagos diarios.",
      pt: "Hard fork do Bitcoin de 2017 com blocos de 32MB para pagamentos diários.",
    },
    useCase: { "zh-CN": "日常支付、点对点电子现金", "zh-TW": "日常支付、點對點電子現金", en: "Daily payments, peer-to-peer electronic cash", es: "Pagos diarios, efectivo electrónico P2P", pt: "Pagamentos diários, dinheiro eletrônico P2P" },
    consensus: "Proof of Work (SHA-256)",
    blockTime: "~10 min", maxSupply: "21,000,000 BCH", launchDate: "2017-08-01",
    officialWebsite: "https://bitcoincash.org", blockExplorer: "https://blockchair.com/bitcoin-cash",
    github: "https://gitlab.com/bitcoin-cash-node", twitter: "https://x.com/bitcoincashorg",
    coingeckoId: "bitcoin-cash", cmcId: 1831,
  },

  polygon: {
    id: "polygon", symbol: "POL", binanceSymbol: "POLUSDT",
    color: "#7B3FE4", emoji: "▮", tags: ["pol", "matic", "polygon"],
    name: { "zh-CN": "Polygon", "zh-TW": "Polygon", en: "Polygon", es: "Polygon", pt: "Polygon" },
    description: {
      "zh-CN": "以太坊Layer 2扩容方案，提供高速低费的交易体验。已从MATIC升级为POL代币，支持zkEVM等零知识证明技术。",
      "zh-TW": "以太坊Layer 2擴容方案，提供高速低費的交易體驗。",
      en: "Ethereum Layer 2 scaling solution with high-speed, low-cost transactions. Upgraded from MATIC to POL token, supporting zkEVM zero-knowledge technology.",
      es: "Solución de escalado Layer 2 de Ethereum con transacciones rápidas y baratas.",
      pt: "Solução de escalabilidade Layer 2 do Ethereum com transações rápidas e baratas.",
    },
    useCase: { "zh-CN": "Layer 2扩容、zkEVM、DeFi、NFT", "zh-TW": "Layer 2擴容、zkEVM", en: "Layer 2 scaling, zkEVM, DeFi, NFTs", es: "Escalado Layer 2, zkEVM, DeFi", pt: "Escalabilidade Layer 2, zkEVM, DeFi" },
    consensus: "Proof of Stake (PoS)",
    blockTime: "~2 sec", launchDate: "2017-10-01",
    founder: "Sandeep Nailwal, Jaynti Kanani & Anurag Arjun",
    officialWebsite: "https://polygon.technology", whitepaper: "https://polygon.technology/papers/pol-whitepaper",
    blockExplorer: "https://polygonscan.com", github: "https://github.com/maticnetwork",
    twitter: "https://x.com/0xPolygon", discord: "https://discord.gg/polygon",
    coingeckoId: "polygon-ecosystem-token", cmcId: 3890,
  },

  arbitrum: {
    id: "arbitrum", symbol: "ARB", binanceSymbol: "ARBUSDT",
    color: "#28A0F0", emoji: "🔵", tags: ["arb", "arbitrum"],
    name: { "zh-CN": "Arbitrum", "zh-TW": "Arbitrum", en: "Arbitrum", es: "Arbitrum", pt: "Arbitrum" },
    description: {
      "zh-CN": "以太坊最大的Optimistic Rollup Layer 2网络，TVL领先。提供与以太坊相同的安全性，但手续费大幅降低。",
      "zh-TW": "以太坊最大的Optimistic Rollup Layer 2網路，TVL領先。",
      en: "Ethereum's largest Optimistic Rollup L2 network by TVL. Offers Ethereum-level security with significantly reduced fees.",
      es: "La red L2 Optimistic Rollup más grande de Ethereum por TVL.",
      pt: "A maior rede L2 Optimistic Rollup do Ethereum por TVL.",
    },
    useCase: { "zh-CN": "Layer 2扩容、DeFi、低费交易", "zh-TW": "Layer 2擴容、DeFi", en: "L2 scaling, DeFi, low-cost transactions", es: "Escalado L2, DeFi, transacciones baratas", pt: "Escalabilidade L2, DeFi, transações baratas" },
    consensus: "Optimistic Rollup",
    launchDate: "2021-08-31", founder: "Offchain Labs (Steven Goldfeder, Harry Kalodner, Ed Felten)",
    officialWebsite: "https://arbitrum.io", blockExplorer: "https://arbiscan.io",
    github: "https://github.com/OffchainLabs", twitter: "https://x.com/arbitrum",
    discord: "https://discord.gg/arbitrum", coingeckoId: "arbitrum", cmcId: 11841,
  },

  optimism: {
    id: "optimism", symbol: "OP", binanceSymbol: "OPUSDT",
    color: "#FF0420", emoji: "🔴", tags: ["op", "optimism"],
    name: { "zh-CN": "Optimism", "zh-TW": "Optimism", en: "Optimism", es: "Optimism", pt: "Optimism" },
    description: {
      "zh-CN": "以太坊Optimistic Rollup L2网络，提出了Superchain愿景。推动OP Stack开源框架，被Base等多个L2采用。",
      "zh-TW": "以太坊Optimistic Rollup L2網路，提出了Superchain願景。",
      en: "Ethereum Optimistic Rollup L2 with the Superchain vision. Developed the open-source OP Stack framework, adopted by Base and other L2s.",
      es: "L2 Optimistic Rollup de Ethereum con la visión Superchain.",
      pt: "L2 Optimistic Rollup do Ethereum com a visão Superchain.",
    },
    useCase: { "zh-CN": "Layer 2扩容、Superchain、OP Stack", "zh-TW": "Layer 2擴容、Superchain", en: "L2 scaling, Superchain, OP Stack", es: "Escalado L2, Superchain, OP Stack", pt: "Escalabilidade L2, Superchain, OP Stack" },
    consensus: "Optimistic Rollup",
    launchDate: "2021-12-16", founder: "Jinglan Wang, Karl Floersch, Kevin Ho",
    officialWebsite: "https://optimism.io", blockExplorer: "https://optimistic.etherscan.io",
    github: "https://github.com/ethereum-optimism", twitter: "https://x.com/Optimism",
    discord: "https://discord.gg/optimism", coingeckoId: "optimism", cmcId: 11840,
  },

  sui: {
    id: "sui", symbol: "SUI", binanceSymbol: "SUIUSDT",
    color: "#4DA2FF", emoji: "💧", tags: ["sui"],
    name: { "zh-CN": "Sui", "zh-TW": "Sui", en: "Sui", es: "Sui", pt: "Sui" },
    description: {
      "zh-CN": "由前Meta(Facebook)工程师开发的高性能Layer 1区块链，使用Move编程语言。主打并行交易处理，实现亚秒级终端确认。",
      "zh-TW": "由前Meta工程師開發的高性能Layer 1區塊鏈，使用Move程式語言。",
      en: "High-performance L1 blockchain built by former Meta engineers using the Move programming language. Focuses on parallel transaction processing with sub-second finality.",
      es: "Blockchain L1 de alto rendimiento construida por ex ingenieros de Meta usando Move.",
      pt: "Blockchain L1 de alto desempenho construída por ex engenheiros da Meta usando Move.",
    },
    useCase: { "zh-CN": "DeFi、游戏、NFT、高性能应用", "zh-TW": "DeFi、遊戲、NFT", en: "DeFi, gaming, NFTs, high-performance apps", es: "DeFi, juegos, NFT", pt: "DeFi, jogos, NFTs" },
    consensus: "Mysticeti (PoS DAG-based)",
    blockTime: "~390 ms", launchDate: "2023-05-03",
    founder: "Mysten Labs (Evan Cheng, Sam Blackshear)",
    officialWebsite: "https://sui.io", whitepaper: "https://docs.sui.io/paper/sui.pdf",
    blockExplorer: "https://suiscan.xyz", github: "https://github.com/MystenLabs",
    twitter: "https://x.com/SuiNetwork", discord: "https://discord.gg/sui",
    coingeckoId: "sui", cmcId: 20947,
  },
};

// ── 导出 MAJOR_COINS 列表（按市值大致排序）──────────────────
export const MAJOR_COINS = [
  "bitcoin", "ethereum", "binancecoin", "solana", "ripple",
  "cardano", "dogecoin", "tron", "polkadot", "litecoin",
  "chainlink", "avalanche-2", "uniswap", "stellar", "cosmos",
  "bitcoin-cash", "polygon", "arbitrum", "optimism", "sui",
].map(id => COIN_DB[id]).filter(Boolean);

/**
 * 获取币种信息
 */
export function getCoinInfo(coinId: string, _lang?: Lang): CoinInfo | null {
  return COIN_DB[coinId] || null;
}

/**
 * 通过 symbol 查找币种
 */
export function getCoinBySymbol(symbol: string): CoinInfo | null {
  const upper = symbol.toUpperCase();
  return Object.values(COIN_DB).find(c => c.symbol === upper) || null;
}
