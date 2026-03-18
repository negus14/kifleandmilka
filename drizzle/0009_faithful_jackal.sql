ALTER TABLE "broadcast_groups" DROP CONSTRAINT "broadcast_groups_site_slug_sites_slug_fk";
--> statement-breakpoint
ALTER TABLE "broadcasts" DROP CONSTRAINT "broadcasts_site_slug_sites_slug_fk";
--> statement-breakpoint
ALTER TABLE "gift_contributions" DROP CONSTRAINT "gift_contributions_site_slug_sites_slug_fk";
--> statement-breakpoint
ALTER TABLE "rsvps" DROP CONSTRAINT "rsvps_site_slug_sites_slug_fk";
--> statement-breakpoint
ALTER TABLE "broadcasts" ALTER COLUMN "recipient_count" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "gift_contributions" ALTER COLUMN "amount" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
ALTER TABLE "sites" ADD COLUMN "cloudflare_hostname_id" text;--> statement-breakpoint
ALTER TABLE "sites" ADD COLUMN "domain_verified_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "broadcast_groups" ADD CONSTRAINT "broadcast_groups_site_slug_sites_slug_fk" FOREIGN KEY ("site_slug") REFERENCES "public"."sites"("slug") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "broadcasts" ADD CONSTRAINT "broadcasts_site_slug_sites_slug_fk" FOREIGN KEY ("site_slug") REFERENCES "public"."sites"("slug") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "gift_contributions" ADD CONSTRAINT "gift_contributions_site_slug_sites_slug_fk" FOREIGN KEY ("site_slug") REFERENCES "public"."sites"("slug") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "rsvps" ADD CONSTRAINT "rsvps_site_slug_sites_slug_fk" FOREIGN KEY ("site_slug") REFERENCES "public"."sites"("slug") ON DELETE cascade ON UPDATE cascade;