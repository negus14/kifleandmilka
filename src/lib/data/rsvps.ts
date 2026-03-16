import { db } from "@/lib/db";
import { rsvps } from "@/db/schema";
import { eq, isNull, and } from "drizzle-orm";

export interface GuestInput {
  name: string;
  attending: boolean;
  mealChoice?: string;
  isHalal?: boolean;
  dietaryPreference?: string;
}

export interface RSVPRecord {
  id: string;
  site_slug: string | null;
  email: string | null;
  phone: string | null;
  message: string | null;
  guests: GuestInput[];
  synced_at: Date | null;
  created_at: Date | null;
}

export async function createRSVP(
  slug: string,
  email: string,
  guests: GuestInput[],
  message?: string,
  phone?: string
): Promise<RSVPRecord> {
  const result = await db.insert(rsvps).values({
    siteSlug: slug,
    email,
    phone: phone || null,
    guests,
    message,
  }).returning();

  const row = result[0];
  return {
    id: row.id,
    site_slug: row.siteSlug,
    email: row.email,
    phone: row.phone,
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
    phone: row.phone,
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

export async function updateRSVP(id: string, data: { email?: string; phone?: string; message?: string; guests?: GuestInput[] }) {
  await db.update(rsvps)
    .set({
      ...(data.email !== undefined && { email: data.email }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.message !== undefined && { message: data.message }),
      ...(data.guests !== undefined && { guests: data.guests }),
      syncedAt: null,
    })
    .where(eq(rsvps.id, id));
}

export async function deleteRSVP(id: string) {
  await db.delete(rsvps).where(eq(rsvps.id, id));
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
    phone: row.phone,
    message: row.message,
    guests: row.guests as GuestInput[],
    synced_at: row.syncedAt,
    created_at: row.createdAt,
  }));
}
