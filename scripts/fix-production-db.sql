-- =============================================================
-- Production Database Fix Script
-- Run this against your production Postgres database
-- Safe to run multiple times (all statements are idempotent)
-- =============================================================

-- 1. Ensure sites table has all required columns
-- ------------------------------------------------
ALTER TABLE "sites" ADD COLUMN IF NOT EXISTS "is_paid" timestamp DEFAULT NULL;
ALTER TABLE "sites" ADD COLUMN IF NOT EXISTS "stripe_customer_id" text;
ALTER TABLE "sites" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE "sites" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now() NOT NULL;

-- 2. Ensure rsvps table exists with all columns
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS "rsvps" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "site_slug" text,
  "email" text,
  "message" text,
  "guests" jsonb NOT NULL,
  "synced_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now()
);

-- Add columns if rsvps table existed but was incomplete
ALTER TABLE "rsvps" ADD COLUMN IF NOT EXISTS "synced_at" timestamp with time zone;
ALTER TABLE "rsvps" ADD COLUMN IF NOT EXISTS "message" text;
ALTER TABLE "rsvps" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now();

-- 3. Ensure site_audit_log table exists
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS "site_audit_log" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "site_slug" text NOT NULL,
  "action" text NOT NULL,
  "changed_fields" text[],
  "created_at" timestamp with time zone DEFAULT now()
);

-- 4. Create indexes (IF NOT EXISTS to be safe)
-- ------------------------------------------------
CREATE INDEX IF NOT EXISTS "idx_sites_published" ON "sites" USING btree ("data");
CREATE INDEX IF NOT EXISTS "idx_rsvps_site_slug" ON "rsvps" USING btree ("site_slug");
CREATE INDEX IF NOT EXISTS "idx_audit_log_slug" ON "site_audit_log" USING btree ("site_slug");
CREATE INDEX IF NOT EXISTS "idx_audit_log_created" ON "site_audit_log" USING btree ("created_at");

-- 5. Add foreign key if missing (wrapped in DO block to handle existing constraint)
-- ------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'rsvps_site_slug_sites_slug_fk'
  ) THEN
    ALTER TABLE "rsvps" ADD CONSTRAINT "rsvps_site_slug_sites_slug_fk"
      FOREIGN KEY ("site_slug") REFERENCES "public"."sites"("slug") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;

-- 6. Verify: show final state
-- ------------------------------------------------
SELECT 'sites columns:' as info, string_agg(column_name, ', ' ORDER BY ordinal_position) as columns
FROM information_schema.columns WHERE table_name = 'sites'
UNION ALL
SELECT 'rsvps columns:', string_agg(column_name, ', ' ORDER BY ordinal_position)
FROM information_schema.columns WHERE table_name = 'rsvps'
UNION ALL
SELECT 'audit_log columns:', string_agg(column_name, ', ' ORDER BY ordinal_position)
FROM information_schema.columns WHERE table_name = 'site_audit_log';
