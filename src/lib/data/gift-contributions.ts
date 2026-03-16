import { db } from "@/lib/db";
import { giftContributions } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface GiftContributionRecord {
  id: string;
  site_slug: string | null;
  gift_name: string;
  guest_name: string;
  amount: string | null;
  currency: string | null;
  message: string | null;
  payment_method: string | null;
  status: string | null;
  created_at: Date | null;
}

export async function createGiftContribution(
  slug: string,
  data: { giftName: string; guestName: string; amount?: string; currency?: string; message?: string; paymentMethod?: string }
): Promise<GiftContributionRecord> {
  const result = await db.insert(giftContributions).values({
    siteSlug: slug,
    giftName: data.giftName,
    guestName: data.guestName,
    amount: data.amount,
    currency: data.currency || "GBP",
    message: data.message,
    paymentMethod: data.paymentMethod,
  }).returning();

  const row = result[0];
  return {
    id: row.id,
    site_slug: row.siteSlug,
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

export async function getGiftContributionsBySite(slug: string): Promise<GiftContributionRecord[]> {
  const rows = await db.query.giftContributions.findMany({
    where: eq(giftContributions.siteSlug, slug),
    orderBy: (t, { desc }) => [desc(t.createdAt)],
  });

  return rows.map(row => ({
    id: row.id,
    site_slug: row.siteSlug,
    gift_name: row.giftName,
    guest_name: row.guestName,
    amount: row.amount,
    currency: row.currency,
    message: row.message,
    payment_method: row.paymentMethod,
    status: row.status,
    created_at: row.createdAt,
  }));
}

export async function updateGiftContribution(id: string, data: { status?: string }) {
  await db.update(giftContributions)
    .set({ ...(data.status !== undefined && { status: data.status }) })
    .where(eq(giftContributions.id, id));
}

export async function deleteGiftContribution(id: string) {
  await db.delete(giftContributions).where(eq(giftContributions.id, id));
}
