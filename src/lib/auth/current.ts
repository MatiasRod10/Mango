import { cache } from "react";
import { redirect } from "next/navigation";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { entities, memberships } from "@/lib/db/schema";
import type { Entity, Membership } from "@/lib/db/schema";
import { hasRole, type MemberRole } from "@/lib/auth/roles";
import { stackServerApp } from "@/stack/server";

/**
 * Identidad del user activo según Stack Auth, y su membership/entity en Mango.
 *
 * Usamos React `cache()` para que dentro de un mismo request varias páginas
 * llamen a estos helpers sin duplicar queries (layout + page + componente).
 *
 * Migración: la primera vez que un user loguea con un email que YA existe en
 * memberships.invited_email (caso típico: el seed marcó `mem_matias` con
 * matiasitw@gmail.com), se le asocia el userId real de Stack a ese membership.
 * Eso preserva todos los movs/inversiones del seed.
 */

const SIGN_IN_PATH = "/handler/sign-in";

export const currentUser = cache(async () => {
  return stackServerApp.getUser();
});

export async function requireUser() {
  const user = await currentUser();
  if (!user) redirect(SIGN_IN_PATH);
  return user;
}

/**
 * Resuelve (o migra) el membership del Stack user actual.
 * Devuelve undefined si el user no tiene membership ni invitación pendiente
 * (caso onboarding — pendiente).
 */
export const currentMembership = cache(
  async (): Promise<Membership | undefined> => {
    const user = await currentUser();
    if (!user) return undefined;

    // 1) Por userId real
    const byUserId = await db
      .select()
      .from(memberships)
      .where(
        and(eq(memberships.userId, user.id), eq(memberships.active, true)),
      )
      .limit(1);
    if (byUserId[0]) return byUserId[0];

    // 2) Por email (migración del seed o invitación aceptada)
    const email = user.primaryEmail;
    if (email) {
      const byEmail = await db
        .select()
        .from(memberships)
        .where(
          and(
            eq(memberships.invitedEmail, email),
            eq(memberships.active, true),
          ),
        )
        .limit(1);
      if (byEmail[0]) {
        const [migrated] = await db
          .update(memberships)
          .set({
            userId: user.id,
            joinedAt: byEmail[0].joinedAt ?? new Date(),
            // Si el nombre del seed era genérico ("Matías") lo conservamos;
            // si estaba vacío, usamos el displayName de Stack.
            name: byEmail[0].name || user.displayName || email,
          })
          .where(eq(memberships.id, byEmail[0].id))
          .returning();
        return migrated;
      }
    }

    return undefined;
  },
);

export const currentEntity = cache(
  async (): Promise<Entity | undefined> => {
    const m = await currentMembership();
    if (!m) return undefined;
    const [e] = await db
      .select()
      .from(entities)
      .where(and(eq(entities.id, m.entityId), isNull(entities.deletedAt)))
      .limit(1);
    return e;
  },
);

/** Helper para queries: tira al sign-in si no hay user. */
export async function currentUserId(): Promise<string> {
  const u = await requireUser();
  return u.id;
}

/** Helper para queries: tira al sign-in si no hay membership/entity. */
export async function currentEntityId(): Promise<string> {
  const m = await currentMembership();
  if (!m) {
    // TODO: cuando exista el onboarding (/welcome o similar), redirigir ahí.
    redirect(SIGN_IN_PATH);
  }
  return m.entityId;
}

/**
 * Para acciones que requieren un rol mínimo (ej: editar entity → owner).
 * Devuelve el membership si cumple el rol, sino tira error.
 */
export async function requireRole(min: MemberRole): Promise<Membership> {
  const m = await currentMembership();
  if (!m) redirect(SIGN_IN_PATH);
  if (!hasRole(m.role as MemberRole, min)) {
    throw new Error(`Permisos insuficientes: se requiere rol ${min}`);
  }
  return m;
}
