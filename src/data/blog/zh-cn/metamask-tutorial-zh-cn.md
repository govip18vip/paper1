---
author: Bitaigen 研究团队
pubDatetime: 2026-04-05T10:00:00Z
modDatetime: 2026-04-09T08:00:00Z
title: "MetaMask小狐狸钱包使用教程2026：安装、配置、DeFi入门一篇搞定"
slug: metamask-tutorial-zh-cn
featured: false
draft: false
lang: zh-CN
translationKey: metamask-tutorial
type: howto
tags:
  - wallet
  - defi
  - web3
  - beginner
  - docs
description: "MetaMask小狐狸钱包2026年最全教程：从安装到配置多链网络，再到连接DeFi协议和NFT平台，新手一篇文章全搞定。"
faqs:
  - q: "MetaMask是免费的吗？"
    a: "MetaMask本身完全免费，安装和使用不收任何费用。但在区块链上进行交易需要支付Gas费（网络手续费），这是支付给区块链矿工/验证者的，不是MetaMask收取的。"
  - q: "MetaMask安全吗？会被盗吗？"
    a: "MetaMask是开源软件，安全性受到社区审计。但钱包安全取决于用户：1）永远不要泄露助记词；2）不要点击可疑链接授权；3）定期检查已授权的DApp。大额资产建议配合硬件钱包使用。"
  - q: "MetaMask支持比特币吗？"
    a: "MetaMask原生只支持EVM兼容链（以太坊、BSC、Polygon、Arbitrum等），不直接支持比特币。要管理BTC，需要使用Trust Wallet、Ledger或专门的BTC钱包。"
  - q: "助记词丢了还能恢复钱包吗？"
    a: "不能。助记词是恢复钱包的唯一方式，丢失后无法找回，MetaMask团队也无法帮你恢复。请务必在纸上写下助记词，存放在安全的地方，不要截图或存在手机/电脑里。"
steps:
  - name: "安装MetaMask"
    text: "从Chrome Web Store或手机应用商店下载安装。"
  - name: "创建钱包"
    text: "设置密码，备份12个助记词。"
  - name: "添加网络"
    text: "添加BSC、Polygon等常用网络。"
  - name: "连接DeFi"
    text: "访问Uniswap等DApp，点击连接钱包即可使用。"
---

MetaMask（小狐狸钱包）是全球使用最广泛的加密货币钱包，月活用户超过 **3000 万**。它是你进入 DeFi、NFT、Web3 世界的"钥匙"。

本教程从零开始，教你安装、配置和使用 MetaMask。

## MetaMask 是什么？

MetaMask 是一个**浏览器插件 + 手机 APP 钱包**：

- **支持链**：以太坊、BSC、Polygon、Arbitrum、Optimism、Base 等所有 EVM 链
- **功能**：存储加密货币、连接 DeFi 协议、交易代币、购买/出售 NFT
- **费用**：钱包免费，交易需要支付区块链 Gas 费

> 类比：MetaMask 就像加密世界的"支付宝"——你用它连接各种"App"（DeFi/NFT平台）。

## 第一步：安装 MetaMask

### 浏览器插件（推荐）

1. 打开 **Chrome 浏览器**
2. 访问 [MetaMask 官网](https://metamask.io)（务必确认网址正确！）
3. 点击 "Download" → "Install MetaMask for Chrome"
4. 在 Chrome Web Store 点击「添加到 Chrome」
5. 安装完成后，右上角出现小狐狸图标

> **重要**：只从官方渠道下载！假冒的 MetaMask 插件会盗取你的资产。

### 手机 APP

- **iOS**：App Store 搜索 "MetaMask"
- **安卓**：Google Play 搜索 "MetaMask"（或从官网下载 APK）

## 第二步：创建钱包

1. 打开 MetaMask → 点击「创建新钱包」
2. 设置**登录密码**（用于解锁钱包，非助记词）
3. **备份助记词**（最重要的步骤！）：
   - MetaMask 会显示 **12 个英文单词**
   - **用纸笔抄下来**，不要截图！
   - 按顺序确认助记词
4. 完成！你的以太坊钱包已创建

### 助记词安全须知

| 做 | 不做 |
|-----|------|
| 用纸笔抄写 | 不要截图保存 |
| 存放在保险柜 | 不要存在手机/电脑 |
| 可以备份两份 | 不要发给任何人 |
| 记住：助记词 = 你的资产 | 不要在网站上输入助记词 |

## 第三步：添加常用网络

MetaMask 默认只有以太坊主网。手续费很贵（$1-50/笔），建议添加以下低费网络：

### BSC（币安智能链）— 手续费 $0.05

网络参数：
- 网络名称：BNB Smart Chain
- RPC URL：`https://bsc-dataseed.binance.org/`
- 链 ID：56
- 货币符号：BNB
- 区块浏览器：`https://bscscan.com`

### Polygon — 手续费 $0.001

- 网络名称：Polygon Mainnet
- RPC URL：`https://polygon-rpc.com`
- 链 ID：137
- 货币符号：MATIC
- 区块浏览器：`https://polygonscan.com`

### Arbitrum — 手续费 $0.1

- 网络名称：Arbitrum One
- RPC URL：`https://arb1.arbitrum.io/rpc`
- 链 ID：42161
- 货币符号：ETH
- 区块浏览器：`https://arbiscan.io`

> 快捷方式：访问 [chainlist.org](https://chainlist.org)，搜索网络名称，一键添加。

## 第四步：向钱包充值

### 从交易所提现到 MetaMask

1. 打开 MetaMask → 复制你的钱包地址（0x 开头）
2. 在 [币安](/go/binance) 或 [OKX](/go/okx) 中选择「提现」
3. 粘贴你的 MetaMask 地址
4. **选择正确的网络**（非常重要！网络选错资产会丢失）
   - 提 ETH → 选 ERC-20
   - 提 BNB → 选 BEP-20
   - 提 MATIC → 选 Polygon
5. 确认提现，等待到账（1-15分钟）

## 第五步：连接 DeFi 协议

### 使用 Uniswap 兑换代币

1. 访问 [Uniswap](https://app.uniswap.org)
2. 点击右上角「Connect Wallet」
3. 选择「MetaMask」
4. MetaMask 弹出授权窗口 → 点击「连接」
5. 选择要兑换的代币 → 输入金额 → 确认交易

### 常用 DeFi 平台

| 平台 | 链 | 功能 |
|------|-----|------|
| Uniswap | 以太坊/Polygon/Arbitrum | 代币兑换 |
| PancakeSwap | BSC | 代币兑换/流动性挖矿 |
| Aave | 多链 | 借贷 |
| Lido | 以太坊 | ETH质押 |
| OpenSea | 多链 | NFT交易 |

## 安全注意事项

1. **定期检查授权**：访问 [revoke.cash](https://revoke.cash) 查看并撤销不需要的DApp授权
2. **警惕钓鱼网站**：只通过书签访问常用DeFi平台
3. **小额测试**：首次转账先发小额测试地址是否正确
4. **硬件钱包配合**：大额资产连接 Ledger 使用 MetaMask

## 常见问题

### MetaMask是免费的吗？

钱包免费，交易需要支付区块链Gas费（不是MetaMask收的）。BSC/Polygon等链Gas费极低。

### MetaMask安全吗？

开源审计，安全性高。但你的助记词一旦泄露资产就会被盗。不要把助记词告诉任何人。

### MetaMask支持比特币吗？

不支持。MetaMask只支持EVM链（以太坊系列）。BTC需要用Trust Wallet或Ledger。

### 助记词丢了怎么办？

无法恢复。助记词是唯一的恢复方式，MetaMask团队也帮不了你。务必纸笔备份。
