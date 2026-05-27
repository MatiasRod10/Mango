"use server";

import { redirect } from "next/navigation";
import { stackServerApp } from "@/stack/server";

/**
 * Cierra la sesión del user actual y redirige a la home.
 */
export async function signOutAction() {
  const user = await stackServerApp.getUser();
  if (user) {
    await user.signOut();
  }
  redirect("/");
}
