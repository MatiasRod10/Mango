import "server-only";
import yahooFinance from "yahoo-finance2";

/**
 * Wrapper sobre yahoo-finance2.
 *
 * Tickers soportados:
 *   - Acciones US: "AAPL", "MSFT", "GOOGL", "TSLA"…
 *   - CEDEARs argentinos: agregar ".BA" → "AAPL.BA", "KO.BA", "MELI.BA"
 *   - ETFs: "SPY", "QQQ", "VTI" (sin .BA)
 *
 * Yahoo es API no oficial. Si rompe en algún momento, fallback es undefined
 * y la app muestra "no pude obtener precio".
 */

export type StockQuote = {
  price: number;
  currency: string; // "USD" o "ARS"
};

export async function fetchStockPrice(
  ticker: string,
): Promise<StockQuote | null> {
  const symbol = ticker.toUpperCase().trim();
  if (!symbol) return null;

  try {
    const quote = (await yahooFinance.quote(symbol)) as
      | { regularMarketPrice?: number; currency?: string }
      | null
      | undefined;
    if (!quote) return null;
    const price = quote.regularMarketPrice;
    const currency = quote.currency;
    if (typeof price !== "number" || !currency) return null;
    return { price, currency };
  } catch {
    return null;
  }
}
