"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

/**
 * Preferencia global de moneda de display.
 * Vive en cookie así es server-readable (para SSR sin flicker).
 *
 * Decisión: el toggle afecta agregados (balance, totales, stats, lista de movimientos)
 * pero NO cambia la moneda nativa de cada InvestmentCard — un USD MEP siempre se ve
 * en USD aunque el toggle global esté en ARS. Eso es para que no se distorsione la
 * lectura de cada instrumento.
 */

export type DisplayCurrency = "ARS" | "USD";

const COOKIE_NAME = "mango_display_currency";
const ONE_YEAR = 60 * 60 * 24 * 365;

export async function getDisplayCurrency(): Promise<DisplayCurrency> {
  const store = await cookies();
  const value = store.get(COOKIE_NAME)?.value;
  return value === "USD" ? "USD" : "ARS";
}

export async function setDisplayCurrency(currency: DisplayCurrency) {
  const store = await cookies();
  store.set(COOKIE_NAME, currency, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: ONE_YEAR,
    path: "/",
  });
  revalidatePath("/", "layout");
}
