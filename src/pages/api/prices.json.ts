// src/pages/api/prices.json.ts
// ─────────────────────────────────────────────────────────────
// Binance-powered price API endpoint
// ⚠️ 必须 prerender = false，否则价格数据会被固化在构建时
// ─────────────────────────────────────────────────────────────
export const prerender = false;

import type { APIRoute } from "astro";
import { COIN_DB, MAJOR_COINS } from "@/utils/coinInfo";

export const GET: APIRoute = async ({ url }) => {
  const requestedIds =
    url.searchParams.get("ids")?.split(",") ||
    MAJOR_COINS.map(c => c.id);

  const symbols = requestedIds
    .map(id => COIN_DB[id]?.binanceSymbol)
    .filter(Boolean) as string[];

  if (symbols.length === 0) {
    return new Response(
      JSON.stringify({ success: false, error: "No valid coin IDs provided" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    const data: Record<string, any> = {};

    // 方法0：Orbit（优先，CoinGecko 兼容格式）
    try {
      const cbRes = await fetch(
        "https://orbit.biyijia.com/api/coins?per_page=60",
        { signal: AbortSignal.timeout(10000) }
      );
      if (cbRes.ok) {
        const cbData: any[] = await cbRes.json();
        const targetSymbols = new Set(
          Object.values(COIN_DB).map(c => c.symbol.toUpperCase())
        );
        for (const item of cbData) {
          const sym = item.symbol?.toUpperCase();
          if (!sym || !targetSymbols.has(sym)) continue;
          const coinInfo = Object.values(COIN_DB).find(c => c.symbol.toUpperCase() === sym);
          if (!coinInfo) continue;
          data[coinInfo.id] = {
            symbol: sym,
            priceUSD: item.current_price || 0,
            change24h: item.price_change_percentage_24h_in_currency || 0,
            high24h: item.high_24h || 0,
            low24h: item.low_24h || 0,
            volume24h: item.total_volume || 0,
            marketCap: item.market_cap || 0,
            rank: item.market_cap_rank || 0,
          };
        }
      }
    } catch {
      // Orbit 失败，继续尝试 Binance
    }

    // 方法1：Binance 精确查询（CB 失败时）
    if (Object.keys(data).length === 0) {
      let tickers: any[] = [];
      try {
        const symbolsParam = JSON.stringify(symbols);
        const res = await fetch(
          `https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(symbolsParam)}`,
          { signal: AbortSignal.timeout(8000) }
        );
        if (res.ok) tickers = await res.json();
      } catch { /* 方法1失败 */ }

      // 方法2：Binance 全量回退
      if (tickers.length === 0) {
        try {
          const fallback = await fetch(
            "https://data-api.binance.vision/api/v3/ticker/24hr",
            { signal: AbortSignal.timeout(10000) }
          );
          if (fallback.ok) {
            const all = await fallback.json();
            const set = new Set(symbols);
            tickers = all.filter((t: any) => set.has(t.symbol));
          }
        } catch { /* 两种方法都失败 */ }
      }

      for (const t of tickers) {
        if (!t.symbol?.endsWith("USDT")) continue;
        const sym = t.symbol.replace("USDT", "");
        const coinInfo = Object.values(COIN_DB).find(c => c.symbol === sym);
        if (!coinInfo) continue;
        data[coinInfo.id] = {
          symbol: sym,
          priceUSD: parseFloat(t.lastPrice) || 0,
          change24h: parseFloat(t.priceChangePercent) || 0,
          high24h: parseFloat(t.highPrice) || 0,
          low24h: parseFloat(t.lowPrice) || 0,
          volume24h: parseFloat(t.quoteVolume) || 0,
        };
      }
    }

    const source = Object.keys(data).length > 0
      ? (data[Object.keys(data)[0]].rank !== undefined ? "cryptobubbles" : "binance")
      : "none";

    return new Response(
      JSON.stringify({
        success: true,
        source,
        timestamp: new Date().toISOString(),
        count: Object.keys(data).length,
        data,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=30",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
