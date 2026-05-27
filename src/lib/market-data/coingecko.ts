/**
 * Fetcher de precio para cripto via CoinGecko.
 * Sin API key, gratis. Cache de 5 min para no pegarle de más.
 *
 * El "ticker" en Mango para cripto debe ser el slug de CoinGecko:
 *   bitcoin, ethereum, solana, tether, usd-coin, etc.
 * Listado: https://api.coingecko.com/api/v3/coins/list
 */

const ENDPOINT = "https://api.coingecko.com/api/v3/simple/price";

export type CoinPrice = { usd: number };

export async function fetchCoinPrice(
  coinId: string,
): Promise<CoinPrice | null> {
  const id = coinId.toLowerCase().trim();
  if (!id) return null;

  try {
    const res = await fetch(
      `${ENDPOINT}?ids=${encodeURIComponent(id)}&vs_currencies=usd`,
      {
        next: { revalidate: 300, tags: ["coingecko"] },
        signal: AbortSignal.timeout(6000),
      },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as Record<string, { usd?: number }>;
    const price = data[id]?.usd;
    return typeof price === "number" ? { usd: price } : null;
  } catch {
    return null;
  }
}
