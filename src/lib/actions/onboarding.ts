"use server";

import { createId } from "@paralleldrive/cuid2";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import { entities, memberships } from "@/lib/db/schema";
import { requireUser } from "@/lib/auth/current";
import {
  onboardingSchema,
  type OnboardingInput,
} from "@/lib/schemas/onboarding";

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function completeOnboardingAction(
  input: OnboardingInput,
): Promise<ActionResult> {
  const user = await requireUser();

  const parsed = onboardingSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  // Verificar que el user no tenga ya una membership activa
  const [existing] = await db
    .select()
    .from(memberships)
    .where(
      and(eq(memberships.userId, user.id), eq(memberships.active, true)),
    )
    .limit(1);

  if (existing) {
    // Ya tiene entity — no creamos otra, redirigimos
    redirect("/dashboard");
  }

  const entityId = createId();
  const membershipId = createId();
  const now = new Date();

  // Insert atómico de entity + membership owner
  await db.insert(entities).values({
    id: entityId,
    name: parsed.data.entityName,
    type: parsed.data.entityType,
    country: "AR",
    baseCurrency: "ARS",
    displayCurrency: "ARS",
    usdRate: "1247.00", // valor inicial razonable; se actualiza al primer fetch
    usdRateType: "blue",
    usdRateSource: "dolarapi",
    usdRateUpdatedAt: now,
    theme: "dark",
  });

  await db.insert(memberships).values({
    id: membershipId,
    entityId,
    userId: user.id,
    name: parsed.data.memberName,
    role: "owner",
    active: true,
    invitedEmail: user.primaryEmail ?? null,
    joinedAt: now,
  });

  revalidatePath("/", "layout");
  return { ok: true, data: undefined };
}
