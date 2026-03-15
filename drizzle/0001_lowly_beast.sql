CREATE TABLE "site_audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_slug" text NOT NULL,
	"action" text NOT NULL,
	"changed_fields" text[],
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "sites" ADD COLUMN "is_paid" timestamp DEFAULT NULL;--> statement-breakpoint
ALTER TABLE "sites" ADD COLUMN "stripe_customer_id" text;--> statement-breakpoint
CREATE INDEX "idx_audit_log_slug" ON "site_audit_log" USING btree ("site_slug");--> statement-breakpoint
CREATE INDEX "idx_audit_log_created" ON "site_audit_log" USING btree ("created_at");