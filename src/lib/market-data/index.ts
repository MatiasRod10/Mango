import type { Investment } from "@/lib/db/schema";
import { fetchCoinPrice } from "./coingecko";
import { fetchFinnhubQuote } from "./finnhub";
import { getCedearRatio } from "./cedear-ratios";

/**
 * Dispatcher de pricing por asset_class. Devuelve nuevos valores ARS+USD
 * para guardar en DB, o un motivo de skip si no se puede actualizar.
 *
 * Proveedores:
 *   - cripto       → CoinGecko (sin API key)
 *   - acciones     → Finnhub (US stocks/ETFs, gratis con API key)
 *   - cedear       → Finnhub del subyacente US + ratio CEDEAR local
 *   - dolar        → Recalcula ARS con la cotización fresca de la entity
 *
 * Manual (devolvemos skip con motivo):
 *   - plazo_fijo, bonos, fondo_comun, inmueble, otro
 *
 * Historial: probamos primero yahoo-finance2 (bloqueado en Vercel), después
 * Twelve Data (paywall en AAPL/SPY incluso en free tier), ahora Finnhub.
 */

export type RefreshResult =
  | { ok: true; newValueArs: string; newValueUsd: string; source: string }
  | { ok: false; reason: string };

export async function refreshPriceForInvestment(
  inv: Investment,
  currentUsdRate: string,
): Promise<RefreshResult> {
  const usdRate = parseFloat(currentUsdRate);

  switch (inv.assetClass) {
    case "cripto": {
      if (!inv.ticker)
        return { ok: false, reason: "Falta ticker (slug de CoinGecko)" };
      if (!inv.quantity)
        return { ok: false, reason: "Falta cantidad de cripto" };
      const result = await fetchCoinPrice(inv.ticker);
      if (!result) return { ok: false, reason: "CoinGecko no respondió" };
      const qty = parseFloat(inv.quantity);
      const newUsd = qty * result.usd;
      const newArs = newUsd * usdRate;
      return {
        ok: true,
        newValueUsd: newUsd.toFixed(2),
        newValueArs: newArs.toFixed(2),
        source: "coingecko",
      };
    }

    case "acciones": {
      if (!inv.ticker) return { ok: false, reason: "Falta ticker" };
      if (!inv.quantity) return { ok: false, reason: "Falta cantidad" };
      const result = await fetchFinnhubQuote(inv.ticker);
      if (!result.ok) return { ok: false, reason: result.reason };
      const qty = parseFloat(inv.quantity);
      const newUsd = qty * result.price;
      const newArs = newUsd * usdRate;
      return {
        ok: true,
        newValueUsd: newUsd.toFixed(2),
        newValueArs: newArs.toFixed(2),
        source: "finnhub",
      };
    }

    case "cedear": {
      // ESTRATEGIA RATIO CEDEAR:
      // Fetch del precio del SUBYACENTE US (Finnhub, free tier) y aplicamos
      // el ratio CEDEAR oficial. Trade-off: precio teórico, no captura el
      // spread CCL de la cotización real del CEDEAR en ByMA.
      if (!inv.ticker) return { ok: false, reason: "Falta ticker" };
      if (!inv.quantity) return { ok: false, reason: "Falta cantidad" };

      const normalizedTicker = inv.ticker
        .toUpperCase()
        .replace(/\.BA$/i, "")
        .trim();
      const ratio = getCedearRatio(normalizedTicker);
      if (!ratio) {
        return {
          ok: false,
          reason: `Ratio CEDEAR no conocido para ${normalizedTicker}. Agregalo a cedear-ratios.ts o actualizá manual.`,
        };
      }

      const result = await fetchFinnhubQuote(normalizedTicker);
      if (!result.ok) return { ok: false, reason: result.reason };

      // Precio del CEDEAR (USD) = precio del subyacente US / ratio
      const cedearPriceUsd = result.price / ratio;
      const qty = parseFloat(inv.quantity);
      const newUsd = qty * cedearPriceUsd;
      const newArs = newUsd * usdRate;

      return {
        ok: true,
        newValueUsd: newUsd.toFixed(2),
        newValueArs: newArs.toFixed(2),
        source: `finnhub US + ratio CEDEAR 1:${ratio}`,
      };
    }

    case "dolar": {
      // El valor USD es la cantidad de dólares (no cambia). Recalculamos ARS.
      const usdQty = parseFloat(inv.currentValueUsd);
      const newArs = usdQty * usdRate;
      return {
        ok: true,
        newValueUsd: usdQty.toFixed(2),
        newValueArs: newArs.toFixed(2),
        source: "dolarapi",
      };
    }

    default:
      return {
        ok: false,
        reason: `Pricing automático no disponible para ${inv.assetClass}. Actualizalo manual.`,
      };
  }
}
