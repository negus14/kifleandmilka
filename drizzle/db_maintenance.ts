import pool from "../src/lib/db";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function runMaintenance() {
  console.log("Starting Database Maintenance...");

  try {
    console.log("Running VACUUM ANALYZE on 'sites'...");
    await pool.query("VACUUM ANALYZE sites");
    
    console.log("Running VACUUM ANALYZE on 'site_audit_log'...");
    await pool.query("VACUUM ANALYZE site_audit_log");
    
    console.log("Running VACUUM ANALYZE on 'rsvps'...");
    await pool.query("VACUUM ANALYZE rsvps");

    console.log("\nDatabase maintenance complete. Vacuum Health should be restored.");
  } catch (err) {
    console.error("Maintenance Error:", err);
  } finally {
    await pool.end();
  }
}

runMaintenance();
