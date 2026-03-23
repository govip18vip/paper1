// publish-test2.cjs
// 运行方式: node publish-test2.cjs
// 发布带封面图的测试文章，在首页可见

const crypto = require('crypto');
const https = require('https');

const GHOST_URL = 'https://coin.ghost.io';
const ADMIN_KEY = '696c75ff6064530001a1ff41:c7363d315dcd7e8fdc2a45cae18008b0758303e4e2f79090329ee7149a3cd0a7';

function generateToken() {
  const [id, secret] = ADMIN_KEY.split(':');
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT', kid: id })).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(JSON.stringify({ iat: now, exp: now + 300, aud: '/admin/' })).toString('base64url');
  const signature = crypto.createHmac('sha256', Buffer.from(secret, 'hex')).update(`${header}.${payload}`).digest('base64url');
  return `${header}.${payload}.${signature}`;
}

function publishPost(postData) {
  const token = generateToken();
  const body = JSON.stringify({ posts: [postData] });
  const url = new URL(`${GHOST_URL}/ghost/api/admin/posts/?source=html`);
  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Authorization': `Ghost ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log('═══════════════════════════════════════════');
  console.log('  发布测试文章到 Ghost（带封面图）');
  console.log('═══════════════════════════════════════════\n');

  // ── 中文文章：以太坊分析 ──
  const zhPost = {
    title: '以太坊ETH质押突破3200万枚：Lido主导地位引发去中心化争议',
    slug: 'eth-staking-32m-lido-debate-zh',
    status: 'published',
    featured: true,
    feature_image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=450&fit=crop',
    tags: [
      { name: 'eth' },
      { name: 'defi' },
      { name: 'market' },
      { name: '#lang-zh-cn' },
      { name: '#tk-eth-staking-lido' },
    ],
    html: `
      <p>以太坊网络质押总量突破 <strong>3200万枚 ETH</strong>，占总供应量的26.7%。其中，流动性质押协议 <strong>Lido Finance</strong> 占据约32%的市场份额，引发社区对去中心化的担忧。</p>

      <h2>质押数据一览</h2>
      <p>自2022年9月以太坊完成合并（The Merge）转向权益证明（PoS）以来，质押量持续攀升：</p>
      <ul>
        <li><strong>总质押量：</strong>32,150,000 ETH（约 $640亿）</li>
        <li><strong>活跃验证者：</strong>超过 1,004,000 个</li>
        <li><strong>年化收益率：</strong>约 3.2%</li>
        <li><strong>质押占比：</strong>26.7% 的总供应量</li>
      </ul>

      <h2>Lido 的垄断争议</h2>
      <p>Lido Finance 作为最大的流动性质押协议，管理着超过 1000万枚 ETH 的质押资产。以太坊基金会研究员 <strong>Danny Ryan</strong> 曾多次警告，单一协议占比过高可能对网络安全构成威胁。</p>
      <p>支持者认为，Lido 的运营商节点分布在20+个独立实体中，实际中心化风险有限。但批评者指出，Lido DAO 的治理代币 LDO 集中在少数大户手中，存在治理攻击隐患。</p>

      <h2>去中心化质押的替代方案</h2>
      <p>为应对集中化风险，社区正在推动多种替代方案：</p>
      <ul>
        <li><strong>Rocket Pool (rETH)：</strong>无需许可的去中心化质押，任何人可运行节点</li>
        <li><strong>分布式验证技术 (DVT)：</strong>Obol 和 SSV Network 正在开发多方验证方案</li>
        <li><strong>EigenLayer 再质押：</strong>让已质押的 ETH 同时为其他协议提供安全保障</li>
      </ul>

      <h2>对投资者的影响</h2>
      <p>ETH 质押率持续上升意味着市场上可流通的 ETH 减少，从供需角度形成通缩压力。结合 EIP-1559 的燃烧机制，ETH 的通胀率已降至接近零甚至通缩状态。</p>

      <blockquote><p>⚠️ 风险提示：加密货币投资风险极高。本文不构成投资建议。</p></blockquote>
    `,
    custom_excerpt: '以太坊质押总量突破3200万枚，Lido占32%市场份额引发去中心化争议。质押率上升带来通缩效应，社区推动DVT等替代方案。',
  };

  // ── 英文文章：Solana DeFi ──
  const enPost = {
    title: 'Solana DeFi TVL Surges Past $8B: Jupiter, Raydium Lead the Charge',
    slug: 'solana-defi-tvl-8b-jupiter-en',
    status: 'published',
    featured: false,
    feature_image: 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800&h=450&fit=crop',
    tags: [
      { name: 'defi' },
      { name: 'market' },
      { name: '#lang-en' },
      { name: '#tk-solana-defi-tvl' },
    ],
    html: `
      <p>Solana's total value locked (TVL) in DeFi protocols has surpassed <strong>$8 billion</strong> for the first time since the FTX collapse, marking a remarkable ecosystem recovery. Leading the charge are DEX aggregator <strong>Jupiter</strong> and AMM <strong>Raydium</strong>.</p>

      <h2>Key TVL Milestones</h2>
      <ul>
        <li><strong>Total Solana DeFi TVL:</strong> $8.2 billion (up 340% YoY)</li>
        <li><strong>Jupiter:</strong> $2.1B TVL — dominant DEX aggregator</li>
        <li><strong>Raydium:</strong> $1.5B TVL — primary AMM</li>
        <li><strong>Marinade Finance:</strong> $1.2B TVL — liquid staking</li>
        <li><strong>Jito:</strong> $980M TVL — MEV-optimized staking</li>
      </ul>

      <h2>What's Driving the Growth?</h2>
      <h3>1. Memecoin Trading Volume</h3>
      <p>The memecoin frenzy on Solana has driven massive DEX trading volumes. Pump.fun alone has generated over $200M in fees, funneling liquidity into the broader ecosystem.</p>

      <h3>2. Compressed NFTs and DePIN</h3>
      <p>Solana's compressed NFT standard dramatically reduced minting costs, attracting projects like Helium (DePIN) and Render Network to build on the chain.</p>

      <h3>3. Firedancer Validator Client</h3>
      <p>Jump Crypto's Firedancer validator client promises to increase Solana's throughput to 1M+ TPS, addressing past reliability concerns and attracting institutional interest.</p>

      <h2>Risks to Watch</h2>
      <p>Despite the impressive growth, several risks remain: network outage history, validator centralization concerns, and the sustainability of memecoin-driven volume. Investors should conduct thorough due diligence.</p>

      <blockquote><p>Disclaimer: This article is for informational purposes only and does not constitute investment advice. Cryptocurrency investments carry significant risk.</p></blockquote>
    `,
    custom_excerpt: 'Solana DeFi TVL hits $8B milestone led by Jupiter and Raydium. Memecoin volume, compressed NFTs, and Firedancer driving ecosystem recovery.',
  };

  // ── 中文快讯：BTC 短快讯 ──
  const flashPost = {
    title: '快讯：贝莱德IBIT比特币ETF单日净流入超4亿美元，创三个月新高',
    slug: 'flash-blackrock-ibit-400m-zh',
    status: 'published',
    featured: false,
    feature_image: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&h=450&fit=crop',
    tags: [
      { name: 'btc' },
      { name: 'market' },
      { name: '快讯' },
      { name: '#lang-zh-cn' },
    ],
    html: `
      <p><strong>贝莱德（BlackRock）旗下的比特币现货ETF — IBIT，于昨日录得单日净流入 4.12亿美元</strong>，创下近三个月以来的最高纪录。</p>
      <p>这一数据显示机构投资者对比特币的配置需求正在加速。目前IBIT管理的总资产规模已突破 <strong>$530亿</strong>，是全球最大的比特币ETF。</p>
      <p>市场分析师指出，ETF资金持续流入叠加减半后的供应收缩，可能为BTC价格提供中长期支撑。</p>
      <blockquote><p>⚠️ 投资有风险，请谨慎决策。</p></blockquote>
    `,
    custom_excerpt: '贝莱德IBIT比特币ETF单日净流入4.12亿美元，创三个月新高。IBIT总资产规模突破530亿美元。',
  };

  // ── 发布 ──
  const articles = [
    { name: '中文 ETH 质押分析', data: zhPost },
    { name: '英文 Solana DeFi', data: enPost },
    { name: '中文 BTC 快讯', data: flashPost },
  ];

  for (const article of articles) {
    console.log(`📝 发布: ${article.name}...`);
    try {
      const result = await publishPost(article.data);
      const p = result.posts[0];
      console.log(`   ✅ 成功！`);
      console.log(`   标题: ${p.title}`);
      console.log(`   链接: /archives/${p.slug}`);
      console.log('');
    } catch (e) {
      console.error(`   ❌ 失败: ${e.message}\n`);
    }
  }

  console.log('═══════════════════════════════════════════');
  console.log('  验证方法:');
  console.log('');
  console.log('  1. 首页（Ghost文章应混合显示）:');
  console.log('     http://localhost:4321/');
  console.log('');
  console.log('  2. Ghost文章直接链接:');
  console.log('     http://localhost:4321/archives/eth-staking-32m-lido-debate-zh');
  console.log('     http://localhost:4321/archives/solana-defi-tvl-8b-jupiter-en');
  console.log('     http://localhost:4321/archives/flash-blackrock-ibit-400m-zh');
  console.log('');
  console.log('  3. Ghost API 检查:');
  console.log('     https://coin.ghost.io/ghost/api/content/posts/?key=9269336edff13b5664c35c8706&limit=5');
  console.log('═══════════════════════════════════════════');
}

main();
