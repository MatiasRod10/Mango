"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { currentMonth } from "@/lib/utils/dates";

/**
 * Mes activo de navegación — cookie global que persiste cuál mes está mirando
 * el usuario. Default: mes actual.
 *
 * Formato esperado: "YYYY-MM".
 */

const COOKIE_NAME = "mango_active_month";
const FORMAT = /^\d{4}-\d{2}$/;
const ONE_MONTH = 60 * 60 * 24 * 30;

export async function getActiveMonth(): Promise<string> {
  const store = await cookies();
  const value = store.get(COOKIE_NAME)?.value;
  if (value && FORMAT.test(value)) return value;
  return currentMonth();
}

export async function setActiveMonth(month: string) {
  if (!FORMAT.test(month)) return;
  const store = await cookies();
  store.set(COOKIE_NAME, month, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: ONE_MONTH,
    path: "/",
  });
  revalidatePath("/", "layout");
}
