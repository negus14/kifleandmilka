import { db } from "@/lib/db";
import { rsvps } from "@/db/schema";
import { eq, isNull, and } from "drizzle-orm";

export interface GuestInput {
  name: string;
  attending: boolean;
  mealChoice?: string;
  isHalal?: boolean;
}

export interface RSVPRecord {
  id: string;
  site_slug: string | null;
  email: string | null;
  message: string | null;
  guests: GuestInput[];
  synced_at: Date | null;
  created_at: Date | null;
}

export async function createRSVP(
  slug: string,
  email: string,
  guests: GuestInput[],
  message?: string
): Promise<RSVPRecord> {
  const result = await db.insert(rsvps).values({
    siteSlug: slug,
    email,
    guests,
    message,
  }).returning();
  
  // Map back to the expected interface (Drizzle uses camelCase from our schema)
  const row = result[0];
  return {
    id: row.id,
    site_slug: row.siteSlug,
    email: row.email,
    message: row.message,
    guests: row.guests as GuestInput[],
    synced_at: row.syncedAt,
    created_at: row.createdAt,
  };
}

export async function getRSVPsBySite(slug: string): Promise<RSVPRecord[]> {
  const rows = await db.query.rsvps.findMany({
    where: eq(rsvps.siteSlug, slug),
    orderBy: (rsvps, { desc }) => [desc(rsvps.createdAt)],
  });
  
  return rows.map(row => ({
    id: row.id,
    site_slug: row.siteSlug,
    email: row.email,
    message: row.message,
    guests: row.guests as GuestInput[],
    synced_at: row.syncedAt,
    created_at: row.createdAt,
  }));
}

export async function markRSVPSynced(id: string) {
  await db.update(rsvps)
    .set({ syncedAt: new Date() })
    .where(eq(rsvps.id, id));
}

export async function getUnsyncedRSVPs(slug: string): Promise<RSVPRecord[]> {
  const rows = await db.query.rsvps.findMany({
    where: and(
      eq(rsvps.siteSlug, slug),
      isNull(rsvps.syncedAt)
    ),
  });
  
  return rows.map(row => ({
    id: row.id,
    site_slug: row.siteSlug,
    email: row.email,
    message: row.message,
    guests: row.guests as GuestInput[],
    synced_at: row.syncedAt,
    created_at: row.createdAt,
  }));
}
