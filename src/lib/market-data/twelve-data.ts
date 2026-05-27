/**
 * Fetcher de precio para acciones / CEDEARs vía Twelve Data.
 *
 * Free tier: 800 calls/día · 8 calls/min. Más que suficiente para un portfolio
 * familiar incluso con refresh diario.
 *
 * Tickers soportados:
 *   - US stocks/ETFs: "SPY", "QQQ", "AAPL", "MSFT" (sin exchange — default US)
 *   - CEDEARs argentinos: "SPY", "QQQ", "AAPL" + exchange=BCBA
 *     (Twelve Data devuelve precio en ARS y currency: "ARS")
 *
 * Doc: https://twelvedata.com/docs#quote
 * Sign-up gratis: https://twelvedata.com/register
 */

const ENDPOINT = "https://api.twelvedata.com/quote";

export type TwelveQuote = {
  price: number;
  currency: string; // "USD" o "ARS"
};

type TwelveDataResponse =
  | {
      code: number;
      message: string;
      status: string;
    }
  | {
      close?: string;
      currency?: string;
      symbol?: string;
    };

/**
 * @param symbol Ticker (sin exchange)
 * @param exchange Opcional. "BCBA" para CEDEARs argentinos. Undefined para US.
 */
export async function fetchTwelveDataQuote(
  symbol: string,
  exchange?: string,
): Promise<TwelveQuote | null> {
  const apiKey = process.env.TWELVE_DATA_API_KEY;
  if (!apiKey) {
    console.warn(
      "[twelve-data] TWELVE_DATA_API_KEY no está configurado — el auto-pricing de acciones/CEDEARs va a fallar.",
    );
    return null;
  }

  const cleaned = symbol.toUpperCase().trim();
  if (!cleaned) return null;

  const params = new URLSearchParams({
    symbol: cleaned,
    apikey: apiKey,
  });
  if (exchange) params.set("exchange", exchange);

  try {
    const res = await fetch(`${ENDPOINT}?${params}`, {
      next: { revalidate: 300, tags: ["twelve-data"] },
      signal: AbortSignal.timeout(7000),
    });
    if (!res.ok) return null;

    const data = (await res.json()) as TwelveDataResponse;

    // Errores de Twelve Data devuelven { code, message }
    if ("code" in data && data.code) {
      console.warn(`[twelve-data] ${symbol}${exchange ? ":" + exchange : ""}: ${data.message}`);
      return null;
    }

    if (!("close" in data) || !data.close || !data.currency) return null;
    const price = parseFloat(data.close);
    if (!Number.isFinite(price)) return null;

    return { price, currency: data.currency };
  } catch {
    return null;
  }
}
