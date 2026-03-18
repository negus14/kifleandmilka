import { db } from "@/lib/db";
import { giftContributions } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import { getSiteIdBySlug } from "./sites";

export interface GiftContributionRecord {
  id: string;
  site_id: string | null;
  gift_name: string;
  guest_name: string;
  amount: string | null;
  currency: string | null;
  message: string | null;
  payment_method: string | null;
  status: string | null;
  created_at: Date | null;
}

function toRecord(row: typeof giftContributions.$inferSelect): GiftContributionRecord {
  return {
    id: row.id,
    site_id: row.siteId,
    gift_name: row.giftName,
    guest_name: row.guestName,
    amount: row.amount,
    currency: row.currency,
    message: row.message,
    payment_method: row.paymentMethod,
    status: row.status,
    created_at: row.createdAt,
  };
}

export async function createGiftContribution(
  slug: string,
  data: { giftName: string; guestName: string; amount?: string; currency?: string; message?: string; paymentMethod?: string }
): Promise<GiftContributionRecord> {
  const siteId = await getSiteIdBySlug(slug);
  if (!siteId) throw new Error(`Site not found: ${slug}`);

  const result = await db.insert(giftContributions).values({
    siteId,
    giftName: data.giftName,
    guestName: data.guestName,
    amount: data.amount,
    currency: data.currency || "GBP",
    message: data.message,
    paymentMethod: data.paymentMethod,
  }).returning();

  return toRecord(result[0]);
}

export async function getGiftContributionsBySite(slug: string): Promise<GiftContributionRecord[]> {
  const siteId = await getSiteIdBySlug(slug);
  if (!siteId) return [];

  const rows = await db.query.giftContributions.findMany({
    where: eq(giftContributions.siteId, siteId),
    orderBy: (t, { desc }) => [desc(t.createdAt)],
  });

  return rows.map(toRecord);
}

export async function getGiftContributionsBySitePaginated(
  slug: string,
  page = 1,
  limit = 50
): Promise<{ items: GiftContributionRecord[]; total: number; page: number; totalPages: number }> {
  const siteId = await getSiteIdBySlug(slug);
  if (!siteId) return { items: [], total: 0, page, totalPages: 0 };

  const offset = (page - 1) * limit;

  const [rows, [{ total }]] = await Promise.all([
    db.query.giftContributions.findMany({
      where: eq(giftContributions.siteId, siteId),
      orderBy: (t, { desc }) => [desc(t.createdAt)],
      limit,
      offset,
    }),
    db.select({ total: count() }).from(giftContributions).where(eq(giftContributions.siteId, siteId)),
  ]);

  return {
    items: rows.map(toRecord),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function updateGiftContribution(id: string, data: { status?: string }) {
  await db.update(giftContributions)
    .set({ ...(data.status !== undefined && { status: data.status }) })
    .where(eq(giftContributions.id, id));
}

export async function deleteGiftContribution(id: string) {
  await db.delete(giftContributions).where(eq(giftContributions.id, id));
}
