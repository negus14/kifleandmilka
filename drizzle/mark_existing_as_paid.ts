import { db } from "../src/lib/db";
import { sites } from "../src/db/schema";
import { sql } from "drizzle-orm";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function markExistingAsPaid() {
  console.log("Marking existing sites as paid...");

  try {
    const result = await db.update(sites)
      .set({ isPaid: new Date() })
      .where(sql`is_paid IS NULL`);
    
    console.log(`✅ Success! Updated sites.`);
  } catch (err) {
    console.error("Migration Error:", err);
  } finally {
    process.exit(0);
  }
}

markExistingAsPaid();
