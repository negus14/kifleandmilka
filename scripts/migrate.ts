import dotenv from "dotenv";
// Load .env.local for local runs, Railway sets env vars directly
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import pg from "pg";
import fs from "fs";
import path from "path";
import crypto from "crypto";

/**
 * Custom migration runner that handles databases created outside Drizzle.
 *
 * - Creates Drizzle's __drizzle_migrations tracking table if missing
 * - Marks already-applied migrations as done (e.g., 0000 if tables exist)
 * - Runs pending migrations in order
 * - Safe to run on every deploy (idempotent)
 */
async function runMigrations() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.log("[migrate] DATABASE_URL not set, skipping.");
    process.exit(0);
  }

  const pool = new pg.Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });

  try {
    console.log("[migrate] Starting schema migrations...");

    // 1. Create Drizzle's migration tracking table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
        id SERIAL PRIMARY KEY,
        hash TEXT NOT NULL,
        created_at BIGINT
      );
    `);

    // 2. Read journal to get ordered migrations
    const journalPath = path.join(process.cwd(), "drizzle", "meta", "_journal.json");
    const journal = JSON.parse(fs.readFileSync(journalPath, "utf-8"));
    const entries: { idx: number; tag: string; when: number }[] = journal.entries;

    // 3. Get already-applied migrations
    const { rows: applied } = await pool.query("SELECT hash FROM __drizzle_migrations");
    const appliedHashes = new Set(applied.map((r: any) => r.hash));

    // 4. Check if DB was created outside Drizzle (tables exist but no migrations tracked)
    if (appliedHashes.size === 0) {
      const { rows: tables } = await pool.query(`
        SELECT table_name FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name IN ('sites', 'rsvps')
      `);
      const existingTables = new Set(tables.map((r: any) => r.table_name));

      // If sites table exists but no migrations recorded, mark 0000 as applied
      if (existingTables.has("sites") && entries.length > 0) {
        const firstMigration = entries[0];
        const sqlPath = path.join(process.cwd(), "drizzle", `${firstMigration.tag}.sql`);
        const sqlContent = fs.readFileSync(sqlPath, "utf-8");
        const hash = crypto.createHash("sha256").update(sqlContent).digest("hex");

        await pool.query(
          "INSERT INTO __drizzle_migrations (hash, created_at) VALUES ($1, $2)",
          [hash, firstMigration.when]
        );
        appliedHashes.add(hash);
        console.log(`[migrate] Marked 0000 (${firstMigration.tag}) as already applied (tables exist from Python setup).`);
      }
    }

    // 5. Run pending migrations in order
    let applied_count = 0;
    for (const entry of entries) {
      const sqlPath = path.join(process.cwd(), "drizzle", `${entry.tag}.sql`);
      const sqlContent = fs.readFileSync(sqlPath, "utf-8");
      const hash = crypto.createHash("sha256").update(sqlContent).digest("hex");

      if (appliedHashes.has(hash)) {
        console.log(`[migrate] Skip: ${entry.tag} (already applied)`);
        continue;
      }

      console.log(`[migrate] Applying: ${entry.tag}...`);

      // Split by Drizzle's statement breakpoint marker and run each statement
      const statements = sqlContent
        .split("--> statement-breakpoint")
        .map((s: string) => s.trim())
        .filter(Boolean);

      for (const stmt of statements) {
        try {
          await pool.query(stmt);
        } catch (err: any) {
          // Handle "already exists" errors gracefully (e.g., IF NOT EXISTS not used in older migrations)
          if (err.code === "42P07" || err.code === "42701" || err.code === "42710") {
            console.log(`[migrate]   (skipped: ${err.message.split("\n")[0]})`);
          } else {
            throw err;
          }
        }
      }

      await pool.query(
        "INSERT INTO __drizzle_migrations (hash, created_at) VALUES ($1, $2)",
        [hash, entry.when]
      );
      applied_count++;
      console.log(`[migrate] Applied: ${entry.tag}`);
    }

    if (applied_count === 0) {
      console.log("[migrate] Database is up to date.");
    } else {
      console.log(`[migrate] Done. Applied ${applied_count} migration(s).`);
    }
  } catch (err) {
    console.error("[migrate] Migration failed:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
