import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import fs from "fs";
import path from "path";

async function pull() {
  console.log("Starting pull of Database data to local JSON files...");
  
  const poolModule = await import("../src/lib/db");
  const pool = poolModule.default;
  
  const sitesDir = path.join(process.cwd(), "data", "sites");
  
  if (!fs.existsSync(sitesDir)) {
    fs.mkdirSync(sitesDir, { recursive: true });
  }

  try {
    const { rows } = await pool.query("SELECT slug, data FROM sites");
    
    for (const row of rows) {
      const filePath = path.join(sitesDir, `${row.slug}.json`);
      // We merge the slug into the data object to ensure consistency
      const fullData = { slug: row.slug, ...row.data };
      
      fs.writeFileSync(filePath, JSON.stringify(fullData, null, 2), "utf-8");
      console.log(`Successfully pulled and saved: ${row.slug}.json`);
    }
    
    console.log("\nPull complete. Your local JSON files now match the Production database.");
  } catch (err) {
    console.error("Pull Error:", err);
  } finally {
    await pool.end();
  }
}

pull();
