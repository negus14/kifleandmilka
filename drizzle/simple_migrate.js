const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function migrate() {
  console.log("Adding is_paid and stripe_customer_id columns to sites table...");
  console.log("Using URL:", process.env.DATABASE_URL ? "Exists (hidden)" : "MISSING");

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    
    // 1. Add is_paid column if not exists
    await client.query(`
      ALTER TABLE sites 
      ADD COLUMN IF NOT EXISTS is_paid TIMESTAMP WITH TIME ZONE DEFAULT NULL
    `);
    console.log("✅ Added is_paid column.");

    // 2. Add stripe_customer_id column if not exists
    await client.query(`
      ALTER TABLE sites 
      ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT DEFAULT NULL
    `);
    console.log("✅ Added stripe_customer_id column.");

    // 3. Mark existing sites as paid
    const result = await client.query("UPDATE sites SET is_paid = NOW() WHERE is_paid IS NULL");
    console.log(`✅ Marked ${result.rowCount} existing sites as paid.`);

    console.log("\nDatabase migration complete.");
  } catch (err) {
    console.error("Migration Error:", err);
  } finally {
    await client.end();
  }
}

migrate();
