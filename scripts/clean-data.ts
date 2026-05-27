/**
 * Borra TODO el contenido de Mango en Neon (datos de la app).
 *
 * NO toca el schema de Stack Auth (users, sessions) — esos viven en su
 * propio schema gestionado por Neon Auth.
 *
 * Después de correr esto:
 *   - Si estás logueado con Stack, seguís logueado.
 *   - Al entrar a /dashboard, el layout detecta "user pero no membership"
 *     y te redirige a /onboarding para crear una entity nueva limpia.
 *
 * Uso: npx tsx scripts/clean-data.ts
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("✗ DATABASE_URL no está en .env.local");
  process.exit(1);
}

const sql = neon(url);

async function main() {
  console.log("→ Conteo antes:\n");
  const before = await sql`
    SELECT
      (SELECT count(*) FROM entities) AS entities,
      (SELECT count(*) FROM memberships) AS memberships,
      (SELECT count(*) FROM movements) AS movements,
      (SELECT count(*) FROM investments) AS investments,
      (SELECT count(*) FROM saving_goals) AS saving_goals,
      (SELECT count(*) FROM budgets) AS budgets
  `;
  for (const [k, v] of Object.entries(before[0])) {
    console.log(`  ${k.padEnd(14)}: ${v}`);
  }

  console.log("\n→ Truncating...");
  await sql`
    TRUNCATE TABLE budgets, investments, saving_goals, movements, memberships, entities
    RESTART IDENTITY CASCADE
  `;
  console.log("✓ Tablas vaciadas.");

  console.log("\n→ Conteo después:\n");
  const after = await sql`
    SELECT
      (SELECT count(*) FROM entities) AS entities,
      (SELECT count(*) FROM memberships) AS memberships,
      (SELECT count(*) FROM movements) AS movements,
      (SELECT count(*) FROM investments) AS investments,
      (SELECT count(*) FROM saving_goals) AS saving_goals,
      (SELECT count(*) FROM budgets) AS budgets
  `;
  for (const [k, v] of Object.entries(after[0])) {
    console.log(`  ${k.padEnd(14)}: ${v}`);
  }

  console.log(
    "\n✓ Listo. Tu próximo login en Mango va a mandarte a /onboarding.",
  );
}

main().catch((err) => {
  console.error("\n✗ Error:", err);
  process.exit(1);
});
