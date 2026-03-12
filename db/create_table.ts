import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import fs from "fs";
import path from "path";

async function setup() {
  console.log("Checking if sites table exists...");
  
  const poolModule = await import("../src/lib/db");
  const pool = poolModule.default;

  const schemaPath = path.join(process.cwd(), "db", "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf-8");

  try {
    await pool.query(schema);
    console.log("Table 'sites' created or already exists.");
  } catch (err) {
    console.error("Error creating table:", err);
  } finally {
    await pool.end();
  }
}

setup();
