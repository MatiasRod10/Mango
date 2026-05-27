/**
 * Fetcher de precio para acciones / ETFs US vía Finnhub.
 *
 * Free tier: 60 calls/min, sin límite diario explícito. Incluye US stocks
 * + ETFs + Forex + Crypto (usamos CoinGecko igual para cripto). NO incluye
 * BCBA (Argentina), pero como usamos ratio CEDEAR para CEDEARs argentinos,
 * solo necesitamos el precio del subyacente US — cosa que Finnhub sí da gratis.
 *
 * Sign up: https://finnhub.io/register
 * Doc del endpoint /quote: https://finnhub.io/docs/api/quote
 */

const ENDPOINT = "https://finnhub.io/api/v1/quote";

export type FinnhubQuoteResult =
  | { ok: true; price: number; currency: "USD" }
  | { ok: false; reason: string };

type FinnhubResponse = {
  c?: number; // current price
  d?: number; // change
  dp?: number; // change percent
  h?: number; // high
  l?: number; // low
  o?: number; // open
  pc?: number; // previous close
  t?: number; // timestamp
};

export async function fetchFinnhubQuote(
  symbol: string,
): Promise<FinnhubQuoteResult> {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      reason: "Falta FINNHUB_API_KEY en env vars de Vercel",
    };
  }

  const cleaned = symbol.toUpperCase().trim();
  if (!cleaned) return { ok: false, reason: "Ticker vacío" };

  const params = new URLSearchParams({
    symbol: cleaned,
    token: apiKey,
  });

  try {
    const res = await fetch(`${ENDPOINT}?${params}`, {
      next: { revalidate: 300, tags: ["finnhub"] },
      signal: AbortSignal.timeout(7000),
    });

    if (!res.ok) {
      // Finnhub devuelve 401 si API key inválida, 429 si rate limit
      if (res.status === 401) {
        return { ok: false, reason: "Finnhub: API key inválida" };
      }
      if (res.status === 429) {
        return { ok: false, reason: "Finnhub: rate limit (60/min)" };
      }
      return { ok: false, reason: `Finnhub HTTP ${res.status}` };
    }

    const data = (await res.json()) as FinnhubResponse;

    // Cuando el símbolo no existe, Finnhub devuelve { c: 0, t: 0, ... }
    if (!data.c || data.c === 0) {
      return {
        ok: false,
        reason: `Símbolo ${cleaned} no encontrado en Finnhub`,
      };
    }

    return { ok: true, price: data.c, currency: "USD" };
  } catch (err) {
    return {
      ok: false,
      reason: `Network error: ${err instanceof Error ? err.message : "desconocido"}`,
    };
  }
}
