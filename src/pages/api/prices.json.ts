// src/pages/api/prices.json.ts
// Binance-powered price API endpoint — 唯一版本
import type { APIRoute } from "astro";
import { COIN_DB, MAJOR_COINS } from "@/utils/coinInfo";

export const GET: APIRoute = async ({ url }) => {
  const requestedIds = url.searchParams.get("ids")?.split(",") ||
    MAJOR_COINS.map(c => c.id);

  // Build Binance symbols list
  const symbols = requestedIds
    .map(id => COIN_DB[id]?.binanceSymbol)
    .filter(Boolean) as string[];

  if (symbols.length === 0) {
    return new Response(JSON.stringify({
      success: false,
      error: "No valid coin IDs provided",
    }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  try {
    let tickers: any[] = [];

    // 方法1：精确查询指定 symbols
    try {
      const symbolsParam = JSON.stringify(symbols);
      const res = await fetch(
        `https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(symbolsParam)}`,
        { signal: AbortSignal.timeout(8000) }
      );
      if (res.ok) {
        tickers = await res.json();
      }
    } catch {
      // 方法1失败，尝试方法2
    }

    // 方法2：回退到全量查询
    if (tickers.length === 0) {
      try {
        const fallback = await fetch("https://data-api.binance.vision/api/v3/ticker/24hr",
          { signal: AbortSignal.timeout(10000) });
        if (fallback.ok) {
          const all = await fallback.json();
          const set = new Set(symbols);
          tickers = all.filter((t: any) => set.has(t.symbol));
        }
      } catch {
        // 两种方法都失败
      }
    }

    // Parse results
    const data: Record<string, any> = {};
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

    return new Response(JSON.stringify({
      success: true,
      source: "binance",
      timestamp: new Date().toISOString(),
      count: Object.keys(data).length,
      data,
    }), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=30",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};
