import { pgTable, text, jsonb, timestamp, uuid, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// 1. Sites Table
export const sites = pgTable("sites", {
  slug: text("slug").primaryKey(),
  data: jsonb("data").notNull(),
  isPaid: timestamp("is_paid").default(sql`NULL`), // Using timestamp for paid date or null
  stripeCustomerId: text("stripe_customer_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return [
    index("idx_sites_published").on(table.data), // Matches your manual index
  ];
});

// 2. RSVPs Table
export const rsvps = pgTable("rsvps", {
  id: uuid("id").defaultRandom().primaryKey(),
  siteSlug: text("site_slug").references(() => sites.slug, { onDelete: 'cascade' }),
  email: text("email"),
  phone: text("phone"),
  message: text("message"),
  guests: jsonb("guests").notNull(),
  syncedAt: timestamp("synced_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => {
  return [
    index("idx_rsvps_site_slug").on(table.siteSlug),
  ];
});

// 2b. Gift Contributions Table
export const giftContributions = pgTable("gift_contributions", {
  id: uuid("id").defaultRandom().primaryKey(),
  siteSlug: text("site_slug").references(() => sites.slug, { onDelete: 'cascade' }),
  giftName: text("gift_name").notNull(),
  guestName: text("guest_name").notNull(),
  amount: text("amount"),
  currency: text("currency").default("GBP"),
  message: text("message"),
  paymentMethod: text("payment_method"),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => {
  return [
    index("idx_gift_contributions_site_slug").on(table.siteSlug),
  ];
});

// 3. Audit Log Table — tracks all site mutations for debugging persistence issues
export const siteAuditLog = pgTable("site_audit_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  siteSlug: text("site_slug").notNull(),
  action: text("action").notNull(), // 'update', 'rename', 'create', 'delete'
  changedFields: text("changed_fields").array(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => {
  return [
    index("idx_audit_log_slug").on(table.siteSlug),
    index("idx_audit_log_created").on(table.createdAt),
  ];
});
