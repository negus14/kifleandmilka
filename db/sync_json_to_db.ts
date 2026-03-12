import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import fs from "fs";
import path from "path";

async function sync() {
  const isProduction = process.env.DATABASE_URL?.includes("railway.app") || process.env.NODE_ENV === "production";
  
  if (isProduction && !process.argv.includes("--force")) {
    console.error("\n❌ SAFETY ERROR: You are attempting to sync LOCAL JSON files TO a PRODUCTION database.");
    console.error("This will OVERWRITE any changes made by users in the Dashboard.");
    console.error("\nIf you ARE sure, run this with the --force flag:");
    console.error("npm run db:sync -- --force\n");
    process.exit(1);
  }

  console.log("Starting sync of JSON to database...");
  
  // Dynamically import pool AFTER dotenv has been configured
  const poolModule = await import("../src/lib/db");
  const pool = poolModule.default;
  
  const sitesDir = path.join(process.cwd(), "data", "sites");
  
  if (!fs.existsSync(sitesDir)) {
    console.error("Sites directory not found at:", sitesDir);
    return;
  }

  const files = fs.readdirSync(sitesDir).filter(f => f.endsWith('.json'));

  try {
    for (const file of files) {
      const jsonPath = path.join(sitesDir, file);
      const siteData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
      const slug = siteData.slug;

      const res = await pool.query(
        `INSERT INTO sites (slug, data)
         VALUES ($1, $2)
         ON CONFLICT (slug) DO UPDATE
         SET data = EXCLUDED.data
         RETURNING slug`,
        [slug, JSON.stringify(siteData)]
      );
      
      console.log(`Successfully updated database for: ${res.rows[0].slug}`);
    }
    console.log("Sync complete. Try refreshing your localhost:3000 now.");
  } catch (err) {
    console.error("Sync Error:", err);
  } finally {
    await pool.end();
  }
}

sync();
