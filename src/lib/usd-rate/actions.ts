"use server";

import { updateTag } from "next/cache";

/**
 * Fuerza un re-fetch de la cotización. Next 16: `updateTag` invalida el cache
 * para esa etiqueta con semántica "read-your-own-writes" — el próximo render
 * del lado del cliente ve el valor fresco.
 */
export async function refreshUsdRate() {
  updateTag("usd-rate");
}
