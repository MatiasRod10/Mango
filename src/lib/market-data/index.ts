import type { Investment } from "@/lib/db/schema";
import { fetchCoinPrice } from "./coingecko";
import { fetchTwelveDataQuote } from "./twelve-data";

/**
 * Dispatcher de pricing por asset_class. Devuelve nuevos valores ARS+USD
 * para guardar en DB, o un motivo de skip si no se puede actualizar.
 *
 * Proveedores:
 *   - cripto       → CoinGecko (sin API key)
 *   - acciones     → Twelve Data (necesita TWELVE_DATA_API_KEY)
 *   - cedear       → Twelve Data con exchange=BCBA
 *   - dolar        → Recalcula ARS con la cotización fresca de la entity
 *
 * Manual (devolvemos skip con motivo):
 *   - plazo_fijo, bonos, fondo_comun, inmueble, otro
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
      const result = await fetchTwelveDataQuote(inv.ticker);
      if (!result.ok) return { ok: false, reason: result.reason };
      const qty = parseFloat(inv.quantity);
      if (result.currency === "USD") {
        const newUsd = qty * result.price;
        const newArs = newUsd * usdRate;
        return {
          ok: true,
          newValueUsd: newUsd.toFixed(2),
          newValueArs: newArs.toFixed(2),
          source: "twelve-data",
        };
      }
      return { ok: false, reason: `Moneda no soportada: ${result.currency}` };
    }

    case "cedear": {
      if (!inv.ticker) return { ok: false, reason: "Falta ticker" };
      if (!inv.quantity) return { ok: false, reason: "Falta cantidad" };
      // CEDEARs en ByMA — Twelve Data los tiene en exchange BCBA.
      const result = await fetchTwelveDataQuote(inv.ticker, "BCBA");
      if (!result.ok) return { ok: false, reason: result.reason };
      const qty = parseFloat(inv.quantity);
      if (result.currency === "ARS") {
        const newArs = qty * result.price;
        const newUsd = usdRate > 0 ? newArs / usdRate : 0;
        return {
          ok: true,
          newValueUsd: newUsd.toFixed(2),
          newValueArs: newArs.toFixed(2),
          source: "twelve-data (BCBA)",
        };
      }
      if (result.currency === "USD") {
        // CEDEAR cotizando en USD (raro pero por las dudas)
        const newUsd = qty * result.price;
        const newArs = newUsd * usdRate;
        return {
          ok: true,
          newValueUsd: newUsd.toFixed(2),
          newValueArs: newArs.toFixed(2),
          source: "twelve-data (BCBA)",
        };
      }
      return { ok: false, reason: `Moneda no soportada: ${result.currency}` };
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
