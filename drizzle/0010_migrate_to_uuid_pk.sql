-- Migration: Change sites primary key from slug (text) to id (UUID)
-- and update all child tables to reference sites.id instead of sites.slug

-- Step 1: Add UUID id column to sites (if not exists)
ALTER TABLE "sites" ADD COLUMN IF NOT EXISTS "id" uuid DEFAULT gen_random_uuid();

-- Backfill any rows that might have NULL id
UPDATE "sites" SET "id" = gen_random_uuid() WHERE "id" IS NULL;

-- Make id NOT NULL
ALTER TABLE "sites" ALTER COLUMN "id" SET NOT NULL;

-- Step 2: Drop old foreign keys on child tables that reference sites.slug
-- (These reference the old PK constraint)
ALTER TABLE "rsvps" DROP CONSTRAINT IF EXISTS "rsvps_site_slug_sites_slug_fk";
ALTER TABLE "gift_contributions" DROP CONSTRAINT IF EXISTS "gift_contributions_site_slug_sites_slug_fk";
ALTER TABLE "broadcast_groups" DROP CONSTRAINT IF EXISTS "broadcast_groups_site_slug_sites_slug_fk";
ALTER TABLE "broadcasts" DROP CONSTRAINT IF EXISTS "broadcasts_site_slug_sites_slug_fk";

-- Step 3: Add site_id UUID column to child tables and populate from sites
ALTER TABLE "rsvps" ADD COLUMN IF NOT EXISTS "site_id" uuid;
UPDATE "rsvps" r SET "site_id" = s."id" FROM "sites" s WHERE r."site_slug" = s."slug";

ALTER TABLE "gift_contributions" ADD COLUMN IF NOT EXISTS "site_id" uuid;
UPDATE "gift_contributions" gc SET "site_id" = s."id" FROM "sites" s WHERE gc."site_slug" = s."slug";

ALTER TABLE "broadcast_groups" ADD COLUMN IF NOT EXISTS "site_id" uuid;
UPDATE "broadcast_groups" bg SET "site_id" = s."id" FROM "sites" s WHERE bg."site_slug" = s."slug";

ALTER TABLE "broadcasts" ADD COLUMN IF NOT EXISTS "site_id" uuid;
UPDATE "broadcasts" b SET "site_id" = s."id" FROM "sites" s WHERE b."site_slug" = s."slug";

-- Step 4: Drop old site_slug columns from child tables
ALTER TABLE "rsvps" DROP COLUMN IF EXISTS "site_slug";
ALTER TABLE "gift_contributions" DROP COLUMN IF EXISTS "site_slug";
ALTER TABLE "broadcast_groups" DROP COLUMN IF EXISTS "site_slug";
ALTER TABLE "broadcasts" DROP COLUMN IF EXISTS "site_slug";

-- Step 5: Drop old primary key on sites and create new one
ALTER TABLE "sites" DROP CONSTRAINT IF EXISTS "sites_pkey";
ALTER TABLE "sites" ADD PRIMARY KEY ("id");

-- Ensure slug remains unique
CREATE UNIQUE INDEX IF NOT EXISTS "sites_slug_unique" ON "sites" ("slug");

-- Step 6: Add foreign key constraints from child tables to sites.id
ALTER TABLE "rsvps" ADD CONSTRAINT "rsvps_site_id_sites_id_fk"
  FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE CASCADE;

ALTER TABLE "gift_contributions" ADD CONSTRAINT "gift_contributions_site_id_sites_id_fk"
  FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE CASCADE;

ALTER TABLE "broadcast_groups" ADD CONSTRAINT "broadcast_groups_site_id_sites_id_fk"
  FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE CASCADE;

ALTER TABLE "broadcasts" ADD CONSTRAINT "broadcasts_site_id_sites_id_fk"
  FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE CASCADE;

-- Step 7: Add indexes on the new site_id columns
CREATE INDEX IF NOT EXISTS "idx_rsvps_site_id" ON "rsvps" ("site_id");
CREATE INDEX IF NOT EXISTS "idx_gift_contributions_site_id" ON "gift_contributions" ("site_id");
CREATE INDEX IF NOT EXISTS "idx_broadcast_groups_site_id" ON "broadcast_groups" ("site_id");
CREATE INDEX IF NOT EXISTS "idx_broadcasts_site_id" ON "broadcasts" ("site_id");

-- Drop old indexes on site_slug (if they exist)
DROP INDEX IF EXISTS "idx_rsvps_site_slug";
DROP INDEX IF EXISTS "idx_gift_contributions_site_slug";
DROP INDEX IF EXISTS "idx_broadcast_groups_site_slug";
DROP INDEX IF EXISTS "idx_broadcasts_site_slug";
