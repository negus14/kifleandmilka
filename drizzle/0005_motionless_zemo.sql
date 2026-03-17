CREATE TABLE "broadcast_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_slug" text,
	"name" text NOT NULL,
	"type" text DEFAULT 'custom' NOT NULL,
	"filter" jsonb,
	"members" jsonb,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "broadcasts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_slug" text,
	"group_id" uuid,
	"subject" text NOT NULL,
	"body" text NOT NULL,
	"channel" text DEFAULT 'email' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"recipient_count" text,
	"sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "sites" ADD COLUMN "custom_domain" text;--> statement-breakpoint
ALTER TABLE "broadcast_groups" ADD CONSTRAINT "broadcast_groups_site_slug_sites_slug_fk" FOREIGN KEY ("site_slug") REFERENCES "public"."sites"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "broadcasts" ADD CONSTRAINT "broadcasts_site_slug_sites_slug_fk" FOREIGN KEY ("site_slug") REFERENCES "public"."sites"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "broadcasts" ADD CONSTRAINT "broadcasts_group_id_broadcast_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."broadcast_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_broadcast_groups_site_slug" ON "broadcast_groups" USING btree ("site_slug");--> statement-breakpoint
CREATE INDEX "idx_broadcasts_site_slug" ON "broadcasts" USING btree ("site_slug");--> statement-breakpoint
ALTER TABLE "sites" ADD CONSTRAINT "sites_custom_domain_unique" UNIQUE("custom_domain");