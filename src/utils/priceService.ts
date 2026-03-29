// src/utils/priceService.ts
// ─────────────────────────────────────────────────────────────
// 多源价格数据服务 — 优先使用 Binance 公开 API（无需认证）
// 备用：CoinGecko
// ─────────────────────────────────────────────────────────────

import { MAJOR_COINS, COIN_DB, type CoinInfo } from "./coinInfo";

export interface PriceData {
  symbol: string;
  name: string;
  price: number;
  priceUSD: number;
  change24h: number;
  high24h: number;
  low24h: number;
  marketCap: number;
  volume24h: number;
  circulatingSupply: number;
  totalSupply: number;
  maxSupply: number | null;
  rank: number;
  ath: number;
  atl: number;
  lastUpdate: number;
}

// Re-export for backward compatibility
export { MAJOR_COINS, COIN_DB, type CoinInfo };

// Binance API 端点（公开，无需认证）
const BINANCE_ENDPOINTS = [
  "https://api.binance.com",
  "https://api1.binance.com",
  "https://api2.binance.com",
  "https://api3.binance.com",
  "https://data-api.binance.vision",
];

class PriceService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheExpiry = 30 * 1000; // 30秒缓存

  /**
   * 从 Binance 获取24h行情（无认证，公开API）
   * GET /api/v3/ticker/24hr
   */
  async getPricesFromBinance(symbols?: string[]): Promise<Record<string, PriceData>> {
    const targetSymbols = symbols || MAJOR_COINS.map(c => c.binanceSymbol);

    for (const endpoint of BINANCE_ENDPOINTS) {
      try {
        // 使用 symbols 参数精准请求，减少数据传输
        const symbolsParam = JSON.stringify(targetSymbols);
        const url = `${endpoint}/api/v3/ticker/24hr?symbols=${encodeURIComponent(symbolsParam)}`;

        const res = await fetch(url, {
          signal: AbortSignal.timeout(8000),
          headers: { "Accept": "application/json" },
        });

        if (!res.ok) {
          // 如果 symbols 参数不支持，回退到全量请求
          if (res.status === 400) {
            return await this._binanceFallback(endpoint, targetSymbols);
          }
          continue;
        }

        const tickers = await res.json();
        return this._parseBinanceTickers(tickers);
      } catch (_err) {
        continue; // 尝试下一个端点
      }
    }

    // 所有 Binance 端点失败，返回空
    return {};
  }

  /**
   * Binance 回退方案：请求全量 ticker 然后过滤
   */
  private async _binanceFallback(endpoint: string, targetSymbols: string[]): Promise<Record<string, PriceData>> {
    try {
      const res = await fetch(`${endpoint}/api/v3/ticker/24hr`, {
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) return {};
      const tickers = await res.json();
      const targetSet = new Set(targetSymbols);
      const filtered = tickers.filter((t: any) => targetSet.has(t.symbol));
      return this._parseBinanceTickers(filtered);
    } catch {
      return {};
    }
  }

  /**
   * 解析 Binance ticker 数据
   */
  private _parseBinanceTickers(tickers: any[]): Record<string, PriceData> {
    const result: Record<string, PriceData> = {};

    for (const t of tickers) {
      if (!t.symbol?.endsWith("USDT")) continue;
      const sym = t.symbol.replace("USDT", "");

      // 查找对应的 coin info
      const coinInfo = Object.values(COIN_DB).find(c => c.symbol === sym);
      if (!coinInfo) continue;

      result[coinInfo.id] = {
        symbol: sym,
        name: coinInfo.name.en,
        price: parseFloat(t.lastPrice) || 0,
        priceUSD: parseFloat(t.lastPrice) || 0,
        change24h: parseFloat(t.priceChangePercent) || 0,
        high24h: parseFloat(t.highPrice) || 0,
        low24h: parseFloat(t.lowPrice) || 0,
        marketCap: 0, // Binance 不提供市值，需要额外计算
        volume24h: parseFloat(t.quoteVolume) || 0,
        circulatingSupply: 0,
        totalSupply: 0,
        maxSupply: null,
        rank: 0,
        ath: 0,
        atl: 0,
        lastUpdate: Date.now(),
      };
    }

    return result;
  }

  /**
   * 从 CoinGecko 获取完整数据（含市值、排名等）
   * 作为补充数据源
   */
  async getPricesFromCoinGecko(ids: string[]): Promise<Record<string, PriceData>> {
    try {
      const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids.join(",")}&order=market_cap_desc&sparkline=false&per_page=250`;
      const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
      if (!res.ok) return {};
      const data = await res.json();

      const result: Record<string, PriceData> = {};
      for (const coin of data) {
        result[coin.id] = {
          symbol: coin.symbol.toUpperCase(),
          name: coin.name,
          price: coin.current_price || 0,
          priceUSD: coin.current_price || 0,
          change24h: coin.price_change_percentage_24h || 0,
          high24h: coin.high_24h || 0,
          low24h: coin.low_24h || 0,
          marketCap: coin.market_cap || 0,
          volume24h: coin.total_volume || 0,
          circulatingSupply: coin.circulating_supply || 0,
          totalSupply: coin.total_supply || 0,
          maxSupply: coin.max_supply,
          rank: coin.market_cap_rank || 0,
          ath: coin.ath || 0,
          atl: coin.atl || 0,
          lastUpdate: Date.now(),
        };
      }
      return result;
    } catch {
      return {};
    }
  }

  /**
   * 获取多个币种价格 — 优先 Binance，CoinGecko 补充市值数据
   */
  async getMultiplePrices(ids?: string[], withMarketCap = true): Promise<Record<string, PriceData>> {
    const coinIds = ids || MAJOR_COINS.map(c => c.id);
    const cacheKey = `prices:${coinIds.join(",")}:${withMarketCap}`;

    // 检查缓存
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }

    // 1. 从 Binance 获取实时价格
    const binanceSymbols = coinIds
      .map(id => COIN_DB[id]?.binanceSymbol)
      .filter(Boolean) as string[];

    let result = await this.getPricesFromBinance(binanceSymbols);

    // 2. 如果需要市值数据，从 CoinGecko 补充
    if (withMarketCap) {
      const geckoData = await this.getPricesFromCoinGecko(coinIds);

      // 合并：Binance价格优先，CoinGecko补充市值
      for (const [id, gData] of Object.entries(geckoData)) {
        if (result[id]) {
          // 用 CoinGecko 补充 Binance 缺少的数据
          result[id].marketCap = gData.marketCap;
          result[id].circulatingSupply = gData.circulatingSupply;
          result[id].totalSupply = gData.totalSupply;
          result[id].maxSupply = gData.maxSupply;
          result[id].rank = gData.rank;
          result[id].ath = gData.ath;
          result[id].atl = gData.atl;
        } else {
          // Binance 没有的，用 CoinGecko 数据
          result[id] = gData;
        }
      }
    }

    // 3. 如果都失败了，单独从 CoinGecko 获取
    if (Object.keys(result).length === 0) {
      result = await this.getPricesFromCoinGecko(coinIds);
    }

    // 缓存结果
    this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  }

  /**
   * 获取单个币种的 Binance K线数据
   */
  async getKlines(symbol: string, interval = "1h", limit = 24): Promise<Array<{time: number; open: number; high: number; low: number; close: number; volume: number}>> {
    const coinInfo = COIN_DB[symbol] || Object.values(COIN_DB).find(c => c.symbol === symbol.toUpperCase());
    if (!coinInfo) return [];

    for (const endpoint of BINANCE_ENDPOINTS) {
      try {
        const url = `${endpoint}/api/v3/klines?symbol=${coinInfo.binanceSymbol}&interval=${interval}&limit=${limit}`;
        const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
        if (!res.ok) continue;

        const data = await res.json();
        return data.map((k: any[]) => ({
          time: k[0],
          open: parseFloat(k[1]),
          high: parseFloat(k[2]),
          low: parseFloat(k[3]),
          close: parseFloat(k[4]),
          volume: parseFloat(k[5]),
        }));
      } catch {
        continue;
      }
    }
    return [];
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const priceService = new PriceService();
