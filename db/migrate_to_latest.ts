import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import fs from "fs";
import path from "path";
import { DEFAULT_SECTION_ORDER } from "../src/lib/types/wedding-site";

async function migrate() {
  console.log("Starting data migration to latest structure...");
  
  const poolModule = await import("../src/lib/db");
  const pool = poolModule.default;
  
  const sitesDir = path.join(process.cwd(), "data", "sites");
  
  try {
    // 1. Fetch all sites from database
    const { rows } = await pool.query("SELECT slug, data FROM sites");
    
    for (const row of rows) {
      const site = row.data;
      const slug = row.slug;
      let modified = false;

      // --- Migration Logic (Synced with DashboardEditor.tsx) ---

      // 1. Migrate scheduleItems to weddingDays
      if ((!site.weddingDays || site.weddingDays.length === 0) && site.scheduleItems?.length > 0) {
        site.weddingDays = [{
          label: "Wedding Day",
          date: site.dateDisplayText,
          isPrivate: false,
          items: site.scheduleItems
        }];
        modified = true;
      }

      // 2. Migrate legacy gift payment fields to giftPaymentLinks
      if ((!site.giftPaymentLinks || site.giftPaymentLinks.length === 0) && site.giftPaymentUrl && site.giftPaymentLabel) {
        site.giftPaymentLinks = [{
          label: site.giftPaymentLabel,
          url: site.giftPaymentUrl
        }];
        modified = true;
      }

      // 4. Migrate legacy "Details" and "Day Two" to eventDays
      if (!site.eventDays) {
        site.eventDays = [];
        modified = true;
      }
      
      if (site.eventDays.length === 0) {
        // Migrate Day One
        if (site.venues && site.venues.length > 0) {
          site.eventDays.push({
            id: "day-1",
            label: site.detailsDayLabel || "Day One",
            venues: site.venues,
            infoBlocks: site.venueInfoBlocks || [],
            detailsStyle: site.detailsStyle || "grid",
            sectionBackground: site.sectionBackgrounds?.details
          });
          modified = true;
        }
        // Migrate Day Two
        if (site.dayTwoEvent) {
          site.eventDays.push({
            id: "day-2",
            label: site.dayTwoDayLabel || "Day Two",
            venues: [{
              label: site.dayTwoEvent.heading,
              name: "",
              address: site.dayTwoEvent.address,
              time: site.dayTwoEvent.time
            }],
            infoBlocks: [],
            note: site.dayTwoEvent.note,
            detailsStyle: "minimal",
            sectionBackground: site.sectionBackgrounds?.day2
          });
          modified = true;
        }
      }

      // 5. Ensure all sections have a type
      if (site.sectionOrder) {
        const originalOrder = JSON.stringify(site.sectionOrder);
        site.sectionOrder = site.sectionOrder.map((s: any) => ({
          ...s,
          type: s.type || s.id
        }));
        if (JSON.stringify(site.sectionOrder) !== originalOrder) modified = true;
      } else {
        site.sectionOrder = DEFAULT_SECTION_ORDER;
        modified = true;
      }

      if (modified) {
        // Update Database
        await pool.query(
          "UPDATE sites SET data = $1 WHERE slug = $2",
          [JSON.stringify(site), slug]
        );
        console.log(`Migrated database record for: ${slug}`);

        // Update local JSON file if it exists
        const jsonPath = path.join(sitesDir, `${slug}.json`);
        if (fs.existsSync(jsonPath)) {
          fs.writeFileSync(jsonPath, JSON.stringify(site, null, 2), "utf-8");
          console.log(`Updated local JSON for: ${slug}`);
        }
      } else {
        console.log(`No migration needed for: ${slug}`);
      }
    }
    
    console.log("\nMigration complete.");
  } catch (err) {
    console.error("Migration Error:", err);
  } finally {
    await pool.end();
  }
}

migrate();
