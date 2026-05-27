import type { Investment } from "@/lib/db/schema";
import { DUMMY_ENTITY_ID, DUMMY_MEMBERSHIPS } from "@/lib/dummy/entity";

const matiasId = DUMMY_MEMBERSHIPS[0].id;

/**
 * 6 instrumentos del mockup, con fechas de compra que generan una
 * descomposición ganancia-real vs cotización interesante.
 */
export const DUMMY_INVESTMENTS: Investment[] = [
  {
    id: "inv_btc",
    entityId: DUMMY_ENTITY_ID,
    membershipId: matiasId,
    name: "Bitcoin",
    ticker: "BTC",
    assetClass: "cripto",
    brokerOrAccount: "Lemon Cash",
    date: "2026-01-22",
    investedArs: "3510000.00", // 3250 USD * 1080
    investedUsd: "3250.00",
    buyUsdSellRate: "1080.00",
    currentValueArs: "5923250.00", // 4750 USD * 1247
    currentValueUsd: "4750.00",
    currentUsdSellRate: "1247.00",
    quantity: "0.05000000",
    averagePriceArs: "70200000.0000", // 65000 USD * 1080 — precio promedio en ARS al comprar
    currentPriceArs: "118465000.0000", // 95000 USD * 1247
    cedearRatio: null,
    status: "active",
    risk: "high",
    notes: "0,05 BTC comprado en enero",
    createdAt: new Date("2026-01-22T15:00:00Z"),
    updatedAt: new Date("2026-05-26T09:30:00Z"),
    deletedAt: null,
  },
  {
    id: "inv_aapl",
    entityId: DUMMY_ENTITY_ID,
    membershipId: matiasId,
    name: "Apple Inc.",
    ticker: "AAPL",
    assetClass: "cedear",
    brokerOrAccount: "Cocos Capital",
    date: "2026-02-15",
    investedArs: "1944000.00", // 1800 USD * 1080
    investedUsd: "1800.00",
    buyUsdSellRate: "1080.00",
    currentValueArs: "2681050.00", // 2150 USD * 1247
    currentValueUsd: "2150.00",
    currentUsdSellRate: "1247.00",
    quantity: "10.00000000",
    averagePriceArs: "194400.0000", // 180 USD * 1080
    currentPriceArs: "268105.0000", // 215 USD * 1247
    cedearRatio: null,
    status: "active",
    risk: "low",
    notes: "10 CEDEARs",
    createdAt: new Date("2026-02-15T14:30:00Z"),
    updatedAt: new Date("2026-05-26T09:30:00Z"),
    deletedAt: null,
  },
  {
    id: "inv_al30",
    entityId: DUMMY_ENTITY_ID,
    membershipId: matiasId,
    name: "AL30",
    ticker: "AL30",
    assetClass: "bonos",
    brokerOrAccount: "Banco Galicia",
    date: "2026-03-10",
    investedArs: "200000.00",
    investedUsd: "178.57", // 200000 / 1120 (rate de marzo)
    buyUsdSellRate: "1120.00",
    currentValueArs: "245000.00",
    currentValueUsd: "196.47", // 245000 / 1247
    currentUsdSellRate: "1247.00",
    quantity: null,
    averagePriceArs: null,
    currentPriceArs: null,
    cedearRatio: null,
    status: "active",
    risk: "medium",
    notes: "Bono soberano hard-dollar",
    createdAt: new Date("2026-03-10T11:00:00Z"),
    updatedAt: new Date("2026-05-26T09:30:00Z"),
    deletedAt: null,
  },
  {
    id: "inv_pf",
    entityId: DUMMY_ENTITY_ID,
    membershipId: matiasId,
    name: "Plazo fijo 90 días",
    ticker: null,
    assetClass: "plazo_fijo",
    brokerOrAccount: "Banco Galicia",
    date: "2026-04-20",
    investedArs: "180000.00",
    investedUsd: "152.54", // 180000 / 1180
    buyUsdSellRate: "1180.00",
    currentValueArs: "210000.00", // interés corrido aprox 60 días @ TNA 110%
    currentValueUsd: "168.40",
    currentUsdSellRate: "1247.00",
    quantity: null,
    averagePriceArs: null,
    currentPriceArs: null,
    cedearRatio: null,
    status: "active",
    risk: "low",
    notes: "TNA 110% · vence 18/07/2026",
    createdAt: new Date("2026-04-20T10:00:00Z"),
    updatedAt: new Date("2026-05-26T09:30:00Z"),
    deletedAt: null,
  },
  {
    id: "inv_usd_mep",
    entityId: DUMMY_ENTITY_ID,
    membershipId: matiasId,
    name: "Dólares MEP",
    ticker: null,
    assetClass: "dolar",
    brokerOrAccount: "Balanz",
    date: "2026-04-15",
    investedArs: "9440000.00", // 8000 USD * 1180
    investedUsd: "8000.00",
    buyUsdSellRate: "1180.00",
    currentValueArs: "9976000.00", // 8000 USD * 1247
    currentValueUsd: "8000.00", // misma cantidad de USD, valor en USD no cambia
    currentUsdSellRate: "1247.00",
    quantity: "8000.00000000",
    averagePriceArs: "1180.0000",
    currentPriceArs: "1247.0000",
    cedearRatio: null,
    status: "active",
    risk: "low",
    notes: "8.000 USD cash — el profit es solo por movimiento del dólar",
    createdAt: new Date("2026-04-15T16:00:00Z"),
    updatedAt: new Date("2026-05-26T09:30:00Z"),
    deletedAt: null,
  },
  {
    id: "inv_cochera",
    entityId: DUMMY_ENTITY_ID,
    membershipId: matiasId,
    name: "Cochera Martinez",
    ticker: null,
    assetClass: "inmueble",
    brokerOrAccount: "Escritura propia",
    date: "2024-06-01",
    investedArs: "22500000.00", // 25000 USD * 900 (cotización 2024)
    investedUsd: "25000.00",
    buyUsdSellRate: "900.00",
    currentValueArs: "31175000.00", // 25000 USD * 1247
    currentValueUsd: "25000.00",
    currentUsdSellRate: "1247.00",
    quantity: null,
    averagePriceArs: null,
    currentPriceArs: null,
    cedearRatio: null,
    status: "active",
    risk: "low",
    notes: "Valuación actualizada manualmente al 01/04/2026",
    createdAt: new Date("2024-06-01T12:00:00Z"),
    updatedAt: new Date("2026-04-01T00:00:00Z"),
    deletedAt: null,
  },
];

// Stats: ver src/lib/investments/stats.ts (calculatePortfolioStats, compositionByAssetClass, calculateProfitBreakdown).
