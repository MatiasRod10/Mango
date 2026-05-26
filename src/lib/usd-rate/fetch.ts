/**
 * Cotización del dólar — fetcher server-side contra dolarapi.com.
 * Cache de 10 min vía Next.js Data Cache + tag "usd-rate" para invalidación manual.
 *
 * En caso de fallo (API caída, timeout, JSON inválido) devuelve un fallback con
 * stale=true para que la UI lo marque visualmente.
 */

export type UsdRateType = "blue" | "oficial" | "mep" | "ccl";

export type UsdRate = {
  value: string; // venta (lo que pagás al comprar)
  buy: string; // compra
  sell: string; // venta
  type: UsdRateType;
  source: string;
  updatedAt: Date;
  /** true si no pudimos contactar la fuente — la UI lo señaliza con un dot amarillo. */
  stale: boolean;
};

const ENDPOINTS: Record<UsdRateType, string> = {
  blue: "https://dolarapi.com/v1/dolares/blue",
  oficial: "https://dolarapi.com/v1/dolares/oficial",
  mep: "https://dolarapi.com/v1/dolares/bolsa",
  ccl: "https://dolarapi.com/v1/dolares/contadoconliqui",
};

const FALLBACK_VALUES: Record<UsdRateType, { buy: string; sell: string }> = {
  blue: { buy: "1240.00", sell: "1247.00" },
  oficial: { buy: "1100.00", sell: "1120.00" },
  mep: { buy: "1230.00", sell: "1240.00" },
  ccl: { buy: "1280.00", sell: "1290.00" },
};

function fallback(type: UsdRateType): UsdRate {
  const fb = FALLBACK_VALUES[type];
  return {
    value: fb.sell,
    buy: fb.buy,
    sell: fb.sell,
    type,
    source: "fallback",
    updatedAt: new Date(),
    stale: true,
  };
}

export async function fetchUsdRate(
  type: UsdRateType = "blue",
): Promise<UsdRate> {
  try {
    const res = await fetch(ENDPOINTS[type], {
      next: { revalidate: 600, tags: ["usd-rate"] },
      // dolarapi acepta GET sin headers; un timeout corto evita colgarnos la página
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return fallback(type);
    const data = (await res.json()) as {
      compra: number;
      venta: number;
      fechaActualizacion: string;
    };
    if (typeof data.venta !== "number") return fallback(type);
    return {
      value: data.venta.toFixed(2),
      buy: data.compra.toFixed(2),
      sell: data.venta.toFixed(2),
      type,
      source: "dolarapi.com",
      updatedAt: new Date(data.fechaActualizacion),
      stale: false,
    };
  } catch {
    return fallback(type);
  }
}
