/**
 * Ratios CEDEAR — cuántos CEDEARs argentinos equivalen a 1 acción/ETF US.
 *
 * Datos públicos de Comafi / BYMA. Pueden cambiar con stock splits.
 * Listado a mediados de 2025; si un ratio cambió, editar acá y deploy.
 *
 * Fuente oficial: https://www.comafi.com.ar/custodiaglobal/2330-CertCedears.note.aspx
 * Lista comunidad: https://www.byma.com.ar
 *
 * Si un CEDEAR no está acá, devolvemos null y la card cae a "actualizar manual".
 */

export const CEDEAR_RATIOS: Record<string, number> = {
  // === ETFs ===
  // Ratios verificados con datos del usuario (INVIU) en may 2026 — pueden
  // cambiar con el tiempo. Si auto-pricing da +20% off vs broker, revisar.
  SPY: 30, // S&P 500 ETF (era 20, ajustado)
  QQQ: 15, // Nasdaq 100 ETF (era 12, ajustado tras data INVIU)
  FXI: 10, // iShares China Large-Cap ETF
  EWZ: 5,  // iShares Brazil ETF
  DIA: 20, // SPDR Dow Jones ETF
  IWM: 12, // iShares Russell 2000 ETF
  VTI: 20, // Vanguard Total Stock Market
  EEM: 6,  // iShares MSCI Emerging Markets
  IBIT: 20, // iShares Bitcoin Trust

  // === Tech ===
  AAPL: 10,
  MSFT: 5,
  GOOGL: 58, // post-split
  GOOG: 58,
  AMZN: 144, // post 20:1 split
  META: 6,
  NFLX: 22,
  NVDA: 5,  // post 10:1 split (jun 2024)
  AMD: 3,
  TSLA: 30, // post 3:1 split (2022)
  ORCL: 2,
  INTC: 2,
  CSCO: 4,
  IBM: 5,
  CRM: 6,
  ADBE: 8,
  PYPL: 4,
  UBER: 4,
  PLTR: 5,

  // === Finance ===
  JPM: 5,
  BAC: 5,
  C: 2,
  GS: 6,
  V: 5,
  MA: 10,
  WFC: 5,
  AXP: 8,

  // === Consumer ===
  KO: 4,
  PEP: 6,
  DIS: 4,
  WMT: 6,
  MCD: 12,
  NKE: 4,
  SBUX: 4,
  HD: 22,
  COST: 30,
  TGT: 8,

  // === Energy / Industrials ===
  XOM: 4,
  CVX: 4,
  BA: 5,
  GE: 4,
  CAT: 15,

  // === Pharma ===
  PFE: 4,
  JNJ: 5,
  LLY: 25,
  ABBV: 10,
  MRK: 5,

  // === Latam / cross-listed ===
  MELI: 5,
  BABA: 10,
  VALE: 2,
  PBR: 2,

  // === Misc ===
  T: 6,
  VZ: 5,
  "BRK-B": 50, // Berkshire Hathaway B
  KO_AR: 4,
};

/**
 * Devuelve el ratio CEDEAR para un ticker subyacente. Normaliza el input:
 *   "SPY", "spy", "SPY.BA" → "SPY"
 */
export function getCedearRatio(ticker: string): number | null {
  const normalized = ticker
    .toUpperCase()
    .replace(/\.BA$/i, "")
    .trim();
  return CEDEAR_RATIOS[normalized] ?? null;
}

/**
 * Para help-text: lista los tickers soportados (ordenados).
 */
export function listSupportedTickers(): string[] {
  return Object.keys(CEDEAR_RATIOS).sort();
}
