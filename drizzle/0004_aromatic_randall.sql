CREATE TABLE "gift_contributions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_slug" text,
	"gift_name" text NOT NULL,
	"guest_name" text NOT NULL,
	"amount" text,
	"currency" text DEFAULT 'GBP',
	"message" text,
	"payment_method" text,
	"status" text DEFAULT 'pending',
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "rsvps" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "gift_contributions" ADD CONSTRAINT "gift_contributions_site_slug_sites_slug_fk" FOREIGN KEY ("site_slug") REFERENCES "public"."sites"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_gift_contributions_site_slug" ON "gift_contributions" USING btree ("site_slug");