CREATE TABLE IF NOT EXISTS "rsvps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_slug" text,
	"email" text,
	"message" text,
	"guests" jsonb NOT NULL,
	"synced_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "rsvps" ADD COLUMN IF NOT EXISTS "synced_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "rsvps" ADD COLUMN IF NOT EXISTS "message" text;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_rsvps_site_slug" ON "rsvps" USING btree ("site_slug");
--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'rsvps_site_slug_sites_slug_fk') THEN ALTER TABLE "rsvps" ADD CONSTRAINT "rsvps_site_slug_sites_slug_fk" FOREIGN KEY ("site_slug") REFERENCES "public"."sites"("slug") ON DELETE cascade ON UPDATE no action; END IF; END $$;