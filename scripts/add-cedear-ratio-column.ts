/**
 * Migration: agregar columna cedear_ratio (opcional) a investments.
 *
 * Permite override por inversión del ratio CEDEAR. Si el campo está null,
 * el dispatcher cae al ratio hardcoded en cedear-ratios.ts.
 *
 * Uso: npx tsx scripts/add-cedear-ratio-column.ts
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
  console.log("→ Verificando si la columna ya existe...");
  const exists = await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'investments' AND column_name = 'cedear_ratio'
  `;

  if (exists.length > 0) {
    console.log("✓ La columna 'cedear_ratio' ya existe. Nada que hacer.");
    return;
  }

  console.log("→ Agregando columna cedear_ratio numeric(10, 4)...");
  await sql`ALTER TABLE investments ADD COLUMN cedear_ratio numeric(10, 4)`;
  console.log("✓ Columna agregada.");

  console.log("\n→ Verificando schema...");
  const cols = await sql<{ column_name: string; data_type: string }>`
    SELECT column_name, data_type FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'investments'
      AND column_name = 'cedear_ratio'
  `;
  for (const c of cols) {
    console.log(`   ${c.column_name}: ${c.data_type}`);
  }

  console.log("\n✓ Migration completa.");
}

main().catch((err) => {
  console.error("\n✗ Error:", err);
  process.exit(1);
});
