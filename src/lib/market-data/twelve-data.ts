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

export type TwelveQuoteResult =
  | { ok: true; price: number; currency: string }
  | { ok: false; reason: string };

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
): Promise<TwelveQuoteResult> {
  const apiKey = process.env.TWELVE_DATA_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      reason: "Falta TWELVE_DATA_API_KEY en env vars de Vercel",
    };
  }

  const cleaned = symbol.toUpperCase().trim();
  if (!cleaned) return { ok: false, reason: "Ticker vacío" };

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

    if (!res.ok) {
      return {
        ok: false,
        reason: `Twelve Data HTTP ${res.status}`,
      };
    }

    const data = (await res.json()) as TwelveDataResponse;

    if ("code" in data && data.code) {
      // Mensajes típicos: "Symbol not found", "You have run out of API credits",
      // "Plan upgrade required", "API key invalid"
      return {
        ok: false,
        reason: `Twelve Data: ${data.message}`,
      };
    }

    if (!("close" in data) || !data.close || !data.currency) {
      return {
        ok: false,
        reason: "Twelve Data devolvió respuesta sin precio/moneda",
      };
    }

    const price = parseFloat(data.close);
    if (!Number.isFinite(price)) {
      return {
        ok: false,
        reason: `Precio no parseable: ${data.close}`,
      };
    }

    return { ok: true, price, currency: data.currency };
  } catch (err) {
    return {
      ok: false,
      reason: `Network error: ${err instanceof Error ? err.message : "desconocido"}`,
    };
  }
}
