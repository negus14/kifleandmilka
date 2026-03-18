import { db } from "@/lib/db";
import { rsvps } from "@/db/schema";
import { eq, isNull, and, count } from "drizzle-orm";

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
  confirmation_sent: boolean;
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
    confirmation_sent: row.confirmationSent,
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
    confirmation_sent: row.confirmationSent,
    synced_at: row.syncedAt,
    created_at: row.createdAt,
  }));
}

export async function getRSVPsBySitePaginated(
  slug: string,
  page = 1,
  limit = 50
): Promise<{ items: RSVPRecord[]; total: number; page: number; totalPages: number }> {
  const offset = (page - 1) * limit;

  const [rows, [{ total }]] = await Promise.all([
    db.query.rsvps.findMany({
      where: eq(rsvps.siteSlug, slug),
      orderBy: (rsvps, { desc }) => [desc(rsvps.createdAt)],
      limit,
      offset,
    }),
    db.select({ total: count() }).from(rsvps).where(eq(rsvps.siteSlug, slug)),
  ]);

  return {
    items: rows.map(row => ({
      id: row.id,
      site_slug: row.siteSlug,
      email: row.email,
      phone: row.phone,
      message: row.message,
      guests: row.guests as GuestInput[],
      confirmation_sent: row.confirmationSent,
      synced_at: row.syncedAt,
      created_at: row.createdAt,
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function markRSVPConfirmationSent(id: string) {
  await db.update(rsvps)
    .set({ confirmationSent: true })
    .where(eq(rsvps.id, id));
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
    confirmation_sent: row.confirmationSent,
    synced_at: row.syncedAt,
    created_at: row.createdAt,
  }));
}
