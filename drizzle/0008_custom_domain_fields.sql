ALTER TABLE "sites"
  ADD COLUMN "cloudflare_hostname_id" text,
  ADD COLUMN "domain_verified_at" timestamp with time zone;
