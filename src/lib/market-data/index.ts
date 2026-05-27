import type { Investment } from "@/lib/db/schema";
import { fetchCoinPrice } from "./coingecko";
import { fetchStockPrice } from "./yahoo-finance";

/**
 * Dispatcher de pricing por asset_class. Devuelve nuevos valores ARS+USD
 * para guardar en DB, o un motivo de skip si no se puede actualizar.
 *
 * Soportado automáticamente:
 *   - cripto       → CoinGecko (necesita ticker = slug)
 *   - acciones     → Yahoo Finance (ticker normal)
 *   - cedear       → Yahoo Finance (con o sin .BA — agregamos .BA si no está)
 *   - dolar        → Recalcula ARS con la cotización fresca de la entity
 *
 * Manual (devolvemos skip):
 *   - plazo_fijo   → cálculo de intereses corridos requiere TNA + vencimiento (faltan campos)
 *   - bonos        → no hay API gratis estable
 *   - fondo_comun  → idem
 *   - inmueble     → siempre manual
 *   - otro         → manual
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

    case "acciones":
    case "cedear": {
      if (!inv.ticker) return { ok: false, reason: "Falta ticker" };
      if (!inv.quantity) return { ok: false, reason: "Falta cantidad" };
      // CEDEARs típicamente terminan en .BA. Si no está, lo agregamos.
      const symbol =
        inv.assetClass === "cedear" && !inv.ticker.toUpperCase().endsWith(".BA")
          ? `${inv.ticker}.BA`
          : inv.ticker;
      const result = await fetchStockPrice(symbol);
      if (!result)
        return { ok: false, reason: `Yahoo Finance no respondió para ${symbol}` };
      const qty = parseFloat(inv.quantity);

      if (result.currency === "USD") {
        const newUsd = qty * result.price;
        const newArs = newUsd * usdRate;
        return {
          ok: true,
          newValueUsd: newUsd.toFixed(2),
          newValueArs: newArs.toFixed(2),
          source: "yahoo-finance",
        };
      }
      if (result.currency === "ARS") {
        const newArs = qty * result.price;
        const newUsd = usdRate > 0 ? newArs / usdRate : 0;
        return {
          ok: true,
          newValueUsd: newUsd.toFixed(2),
          newValueArs: newArs.toFixed(2),
          source: "yahoo-finance",
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
