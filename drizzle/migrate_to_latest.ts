import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { DEFAULT_SECTION_ORDER } from "../src/lib/types/wedding-site";

async function migrate() {
  const dbUrl = process.env.DATABASE_URL || "";
  const isProduction = ["rlwy.net", "railway.app", "neon.tech", "supabase.co", "render.com", "amazonaws.com"]
    .some(host => dbUrl.includes(host)) || process.env.NODE_ENV === "production";

  if (isProduction && !process.argv.includes("--force")) {
    console.error("\n❌ SAFETY: You are about to migrate a PRODUCTION database.");
    console.error("   This is a non-destructive migration (additive only), but please confirm.");
    console.error("\n   Re-run with --force to proceed.\n");
    process.exit(1);
  }

  console.log("Starting data migration to latest structure...");

  const poolModule = await import("../src/lib/db");
  const pool = poolModule.default;
  const fs = await import("fs");
  const path = await import("path");

  try {
    // 1. Fetch all sites from database
    const { rows } = await pool.query("SELECT slug, data FROM sites");
    
    // --- BACKUP STEP ---
    const backupDir = path.join(process.cwd(), "drizzle", "backups");
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
    
    const backupPath = path.join(backupDir, `sites_backup_${Date.now()}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(rows, null, 2));
    console.log(`✅ Backup created: ${backupPath}`);
    // -------------------

    for (const row of rows) {
      const site = row.data as any; // Cast as any to access legacy fields for migration
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
      }

      // 5. Cleanup: remove legacy fields after migration
      const legacyFields = [
        "venues", "venueInfoBlocks", "detailsStyle", "detailsDayLabel", 
        "dayTwoEvent", "dayTwoDayLabel", "scheduleItems",
        "giftPaymentUrl", "giftPaymentLabel", "giftNote", "giftBankName",
        "giftAccountHolder", "giftAccountNumber", "giftSwiftCode"
      ];

      for (const field of legacyFields) {
        if (site[field] !== undefined) {
          delete site[field];
          modified = true;
        }
      }

      // 5. Ensure all sections have a type
      if (site.sectionOrder) {
        const originalOrder = JSON.stringify(site.sectionOrder);
        site.sectionOrder = site.sectionOrder
          .filter((s: any) => s.id !== "day2" && s.type !== "day2")
          .map((s: any) => ({
            ...s,
            type: s.type || s.id
          }));

        // Mandatory sections: Hero and Footer must exist
        const hasHero = site.sectionOrder.some((s: any) => s.type === "hero");
        if (!hasHero) {
          site.sectionOrder.unshift({ id: "hero", type: "hero", visible: true });
        }
        
        const hasFooter = site.sectionOrder.some((s: any) => s.type === "footer");
        if (!hasFooter) {
          site.sectionOrder.push({ id: "footer", type: "footer", visible: true });
        }
        
        if (JSON.stringify(site.sectionOrder) !== originalOrder) modified = true;
      } else {
        site.sectionOrder = DEFAULT_SECTION_ORDER;
        modified = true;
      }

      // 6. Initialize empty containers for new features if missing
      if (site.faqs === undefined) {
        site.faqHeading = "";
        site.faqs = [];
        modified = true;
      }

      if (modified) {
        // Update Database
        await pool.query(
          "UPDATE sites SET data = $1 WHERE slug = $2",
          [JSON.stringify(site), slug]
        );
        console.log(`Migrated database record for: ${slug}`);
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
