import pool from "../src/lib/db";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function migrate() {
  console.log("Adding is_paid and stripe_customer_id columns to sites table...");

  try {
    // 1. Add is_paid column if not exists
    await pool.query(`
      ALTER TABLE sites 
      ADD COLUMN IF NOT EXISTS is_paid TIMESTAMP WITH TIME ZONE DEFAULT NULL
    `);
    console.log("✅ Added is_paid column.");

    // 2. Add stripe_customer_id column if not exists
    await pool.query(`
      ALTER TABLE sites 
      ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT DEFAULT NULL
    `);
    console.log("✅ Added stripe_customer_id column.");

    // 3. Mark existing sites as paid (using the current time)
    const result = await pool.query("UPDATE sites SET is_paid = NOW() WHERE is_paid IS NULL");
    console.log(`✅ Marked ${result.rowCount} existing sites as paid.`);

    console.log("\nDatabase migration complete.");
  } catch (err) {
    console.error("Migration Error:", err);
  } finally {
    await pool.end();
  }
}

migrate();
