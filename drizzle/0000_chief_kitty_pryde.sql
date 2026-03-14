CREATE TABLE "rsvps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_slug" text,
	"email" text,
	"message" text,
	"guests" jsonb NOT NULL,
	"synced_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sites" (
	"slug" text PRIMARY KEY NOT NULL,
	"data" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "rsvps" ADD CONSTRAINT "rsvps_site_slug_sites_slug_fk" FOREIGN KEY ("site_slug") REFERENCES "public"."sites"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_rsvps_site_slug" ON "rsvps" USING btree ("site_slug");--> statement-breakpoint
CREATE INDEX "idx_sites_published" ON "sites" USING btree ("data");