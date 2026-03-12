import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import fs from "fs";
import path from "path";

async function sync() {
  console.log("Starting sync of JSON to local database...");
  
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
