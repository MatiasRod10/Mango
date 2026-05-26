/**
 * Setea invited_email en el membership "mem_matias" del seed.
 *
 * Esto habilita la migración automática: al loguearte por primera vez con
 * matiasitw@gmail.com, el helper findOrCreateMembership encuentra el membership
 * por email y actualiza su user_id al ID real que devuelve Stack Auth.
 *
 * Uso: npx tsx scripts/link-matias-email.ts
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { eq } from "drizzle-orm";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/lib/db/schema";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("✗ DATABASE_URL no está en .env.local");
  process.exit(1);
}

const sql = neon(url);
const db = drizzle({ client: sql, schema });

const EMAIL = "matiasitw@gmail.com";

async function main() {
  const updated = await db
    .update(schema.memberships)
    .set({ invitedEmail: EMAIL })
    .where(eq(schema.memberships.id, "mem_matias"))
    .returning({ id: schema.memberships.id, email: schema.memberships.invitedEmail });

  if (updated.length === 0) {
    console.warn(
      `! No se encontró membership 'mem_matias'. ¿Corriste el seed antes?`,
    );
    process.exit(1);
  }

  console.log(`✓ Membership ${updated[0].id} ahora tiene email ${updated[0].email}`);
  console.log(
    `\nAl loguearte por primera vez con ${EMAIL} en Stack Auth, el helper findOrCreateMembership va a migrar el user_id automáticamente.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
