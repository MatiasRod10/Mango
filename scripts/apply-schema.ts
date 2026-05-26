/**
 * Aplica schema.sql a Neon usando el Pool de @neondatabase/serverless.
 *
 * Por qué Pool y no neon-http: schema.sql contiene CREATE FUNCTION con bloques
 * $$ ... $$ y múltiples statements. El driver HTTP solo soporta single-statement;
 * el Pool (WebSocket) sí soporta multi-statement.
 *
 * Uso: npx tsx scripts/apply-schema.ts
 */

import { config } from "dotenv";
import { neonConfig, Pool } from "@neondatabase/serverless";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

// Next.js lee .env.local automáticamente; los scripts standalone no.
config({ path: ".env.local" });

async function setupWebSocket() {
  if (typeof globalThis.WebSocket !== "undefined") {
    neonConfig.webSocketConstructor = globalThis.WebSocket as never;
  } else {
    const wsModule = await import("ws");
    neonConfig.webSocketConstructor = wsModule.default as never;
  }
}

async function main() {
  await setupWebSocket();

  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("✗ DATABASE_URL no está definido en .env.local");
    process.exit(1);
  }

  const schemaPath = resolve(process.cwd(), "schema.sql");
  const schemaSQL = await readFile(schemaPath, "utf-8");
  console.log(`✓ Leído schema.sql (${schemaSQL.length} bytes)`);

  const pool = new Pool({ connectionString: url });

  try {
    console.log("→ Aplicando schema a la base...");
    await pool.query(schemaSQL);
    console.log("✓ Schema aplicado.");

    console.log("\n→ Verificando tablas...");
    const tables = await pool.query<{ table_name: string }>(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log("Tablas en public:");
    for (const row of tables.rows) console.log(`   • ${row.table_name}`);

    console.log("\n→ Verificando enums...");
    const enums = await pool.query<{ typname: string }>(`
      SELECT typname FROM pg_type
      WHERE typcategory = 'E' AND typnamespace = 'public'::regnamespace
      ORDER BY typname
    `);
    console.log(`Enums creados: ${enums.rows.length}`);
    for (const row of enums.rows) console.log(`   • ${row.typname}`);

    console.log("\n→ Verificando triggers...");
    const triggers = await pool.query<{
      trigger_name: string;
      event_object_table: string;
    }>(`
      SELECT trigger_name, event_object_table
      FROM information_schema.triggers
      WHERE trigger_schema = 'public'
      ORDER BY event_object_table
    `);
    console.log(`Triggers creados: ${triggers.rows.length}`);
    for (const row of triggers.rows) {
      console.log(`   • ${row.trigger_name} on ${row.event_object_table}`);
    }
  } catch (err) {
    console.error("\n✗ Error aplicando schema:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }

  console.log("\n✓ Listo. Schema en Neon coincide con schema.sql.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
