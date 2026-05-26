/**
 * Cotización dummy del dólar. Espejo de lo que va a devolver
 * el endpoint /api/usd-rate cuando conectemos dolarapi.
 */

export const DUMMY_USD_RATE = {
  value: "1247.00",
  type: "blue" as const,
  source: "dolarapi",
  updatedAt: new Date("2026-05-26T09:30:00Z"),
};

/**
 * Cotizaciones históricas usadas por los movimientos/inversiones dummy.
 * El movimiento guarda su `usd_rate_used` propio, esta lookup es para
 * generar dummies coherentes.
 */
export const RATE_BY_MONTH: Record<string, string> = {
  "2024-06": "900.00",
  "2026-01": "1080.00",
  "2026-02": "1080.00",
  "2026-03": "1120.00",
  "2026-04": "1180.00",
  "2026-05": "1247.00",
};

export function getRateForDate(isoDate: string): string {
  const month = isoDate.slice(0, 7);
  return RATE_BY_MONTH[month] ?? DUMMY_USD_RATE.value;
}
