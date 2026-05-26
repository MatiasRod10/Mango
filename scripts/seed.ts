/**
 * Seed inicial — Familia García + 2 miembros + 32 movs + 6 inversiones.
 *
 * Idempotente: usa ON CONFLICT (id) DO NOTHING. Re-correrlo no rompe nada
 * pero tampoco re-aplica cambios — si querés "actualizar", borrá manualmente
 * la fila en Neon y volvé a correr.
 *
 * Uso: npx tsx scripts/seed.ts
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/lib/db/schema";
import { DUMMY_ENTITY, DUMMY_MEMBERSHIPS } from "../src/lib/dummy/entity";
import { DUMMY_MOVEMENTS } from "../src/lib/dummy/movements";
import { DUMMY_INVESTMENTS } from "../src/lib/dummy/investments";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("✗ DATABASE_URL no está en .env.local");
  process.exit(1);
}

const sql = neon(url);
const db = drizzle({ client: sql, schema });

async function main() {
  console.log("→ Seeding Mango...\n");

  console.log("  • entity (Familia García)");
  await db.insert(schema.entities).values(DUMMY_ENTITY).onConflictDoNothing();

  console.log(`  • memberships (${DUMMY_MEMBERSHIPS.length})`);
  await db
    .insert(schema.memberships)
    .values(DUMMY_MEMBERSHIPS)
    .onConflictDoNothing();

  console.log(`  • movements (${DUMMY_MOVEMENTS.length})`);
  // Insertamos en chunks para no exceder límites del driver HTTP.
  const CHUNK = 16;
  for (let i = 0; i < DUMMY_MOVEMENTS.length; i += CHUNK) {
    const slice = DUMMY_MOVEMENTS.slice(i, i + CHUNK);
    await db.insert(schema.movements).values(slice).onConflictDoNothing();
  }

  console.log(`  • investments (${DUMMY_INVESTMENTS.length})`);
  await db
    .insert(schema.investments)
    .values(DUMMY_INVESTMENTS)
    .onConflictDoNothing();

  console.log("\n→ Verificando conteos en DB...");
  const [entities, memberships, movements, investments] = await Promise.all([
    db.select().from(schema.entities),
    db.select().from(schema.memberships),
    db.select().from(schema.movements),
    db.select().from(schema.investments),
  ]);
  console.log(`  entities:     ${entities.length}`);
  console.log(`  memberships:  ${memberships.length}`);
  console.log(`  movements:    ${movements.length}`);
  console.log(`  investments:  ${investments.length}`);

  console.log("\n✓ Seed completo.");
}

main().catch((err) => {
  console.error("\n✗ Error en seed:", err);
  process.exit(1);
});
