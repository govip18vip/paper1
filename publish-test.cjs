// publish-test.js
// 运行方式: node publish-test.js

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
  // ── 中文测试文章 ──
  const zhPost = {
    title: '【测试】比特币突破新高：2025年牛市信号全解析',
    slug: 'test-btc-bull-market-2025-zh',
    status: 'published',
    tags: [
      { name: 'btc' },
      { name: 'market' },
      { name: '#lang-zh-cn' },
      { name: '#tk-test-btc-2025' },
    ],
    html: `
      <p><strong>这是一篇测试文章，用于验证 Ghost → Astro 同步功能。</strong></p>
      <h2>比特币再创历史新高</h2>
      <p>2025年，比特币价格再次突破关键阻力位，市场情绪高涨。多项链上指标显示，当前市场结构与2021年牛市初期极为相似。</p>
      <h2>三大牛市信号</h2>
      <h3>1. 机构资金持续流入</h3>
      <p>自比特币现货ETF获批以来，传统金融机构的资金正以前所未有的速度流入加密市场。贝莱德（BlackRock）旗下的IBIT已成为全球规模最大的比特币ETF。</p>
      <h3>2. 减半效应发酵</h3>
      <p>2024年4月完成的第四次减半，将区块奖励从6.25 BTC降至3.125 BTC。历史数据显示，每次减半后12-18个月内，比特币都会迎来显著涨幅。</p>
      <h3>3. 链上数据强劲</h3>
      <p>长期持有者（LTH）的持仓比例创下新高，交易所BTC余额持续下降，供应紧缩效应正在加速。</p>
      <h2>风险提示</h2>
      <p>加密货币投资风险极高，价格波动剧烈。本文不构成投资建议，请根据自身风险承受能力审慎决策。</p>
      <blockquote><p>本文为 Ghost → Astro 同步测试。发布时间：${new Date().toISOString()}</p></blockquote>
    `,
    custom_excerpt: '2025年比特币市场三大牛市信号解析：机构资金流入、减半效应、链上数据强劲。',
    featured: false,
  };

  // ── 英文测试文章 ──
  const enPost = {
    title: '[TEST] Bitcoin Price Analysis: Key Levels to Watch in 2025',
    slug: 'test-btc-price-analysis-2025-en',
    status: 'published',
    tags: [
      { name: 'btc' },
      { name: 'market' },
      { name: '#lang-en' },
      { name: '#tk-test-btc-2025' },
    ],
    html: `
      <p><strong>This is a test article to verify Ghost to Astro sync.</strong></p>
      <h2>Bitcoin Breaks Key Resistance</h2>
      <p>Bitcoin has once again surpassed critical resistance levels in 2025, with market sentiment reaching euphoric highs. Multiple on-chain indicators suggest the current market structure closely mirrors the early stages of the 2021 bull run.</p>
      <h2>Three Bull Market Signals</h2>
      <h3>1. Institutional Capital Inflow</h3>
      <p>Since the approval of spot Bitcoin ETFs, institutional capital has been flowing into crypto at unprecedented rates. BlackRock's IBIT has become the world's largest Bitcoin ETF by AUM.</p>
      <h3>2. Post-Halving Effect</h3>
      <p>The fourth halving completed in April 2024 reduced block rewards from 6.25 to 3.125 BTC. Historical data shows Bitcoin typically sees significant appreciation 12-18 months after each halving.</p>
      <h3>3. Strong On-Chain Metrics</h3>
      <p>Long-term holder supply ratio has hit all-time highs, exchange BTC balances continue declining, and supply squeeze dynamics are accelerating.</p>
      <h2>Risk Disclaimer</h2>
      <p>Cryptocurrency investments carry significant risk. This article does not constitute investment advice.</p>
      <blockquote><p>This is a Ghost to Astro sync test. Published: ${new Date().toISOString()}</p></blockquote>
    `,
    custom_excerpt: 'Bitcoin market analysis for 2025: institutional inflows, halving effect, and strong on-chain data.',
    featured: false,
  };

  console.log('Publishing Chinese article...');
  try {
    const r1 = await publishPost(zhPost);
    console.log('✅ Chinese article published!');
    console.log('   URL:', r1.posts[0].url);
  } catch (e) {
    console.error('❌ Failed:', e.message);
  }

  console.log('Publishing English article...');
  try {
    const r2 = await publishPost(enPost);
    console.log('✅ English article published!');
    console.log('   URL:', r2.posts[0].url);
  } catch (e) {
    console.error('❌ Failed:', e.message);
  }

  console.log('\n--- Verify ---');
  console.log('Ghost admin:  https://coin.ghost.io/ghost/');
  console.log('Astro local:  http://localhost:4321/archives/test-btc-bull-market-2025-zh');
  console.log('Astro local:  http://localhost:4321/archives/test-btc-price-analysis-2025-en');
}

main();
