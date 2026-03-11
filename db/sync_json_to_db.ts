import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import pool from "../src/lib/db";
import fs from "fs";
import path from "path";

async function sync() {
  console.log("Starting sync of JSON to local database...");
  
  const jsonPath = path.join(process.cwd(), "data", "sites", "kifleandmilka.json");
  
  if (!fs.existsSync(jsonPath)) {
    console.error("JSON file not found at:", jsonPath);
    return;
  }

  const siteData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  const slug = siteData.slug;

  try {
    const res = await pool.query(
      `INSERT INTO sites (slug, data)
       VALUES ($1, $2)
       ON CONFLICT (slug) DO UPDATE
       SET data = EXCLUDED.data
       RETURNING slug`,
      [slug, JSON.stringify(siteData)]
    );
    
    console.log(`Successfully updated database for: ${res.rows[0].slug}`);
    console.log("Try refreshing your localhost:3000 now.");
  } catch (err) {
    console.error("Sync Error:", err);
  } finally {
    await pool.end();
  }
}

sync();
