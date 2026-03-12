import pool from "@/lib/db";
import type { WeddingSite } from "@/lib/types/wedding-site";

export async function getSiteBySlug(
  slug: string
): Promise<WeddingSite | null> {
  const { rows } = await pool.query(
    "SELECT data FROM sites WHERE slug = $1",
    [slug]
  );
  if (rows.length === 0) return null;
  return rows[0].data as WeddingSite;
}

export async function updateSite(
  slug: string,
  data: Partial<WeddingSite>
): Promise<WeddingSite | null> {
  const existing = await getSiteBySlug(slug);
  if (!existing) return null;

  const updated = { ...existing, ...data, slug: existing.slug };
  await pool.query(
    "UPDATE sites SET data = $1 WHERE slug = $2",
    [JSON.stringify(updated), slug]
  );
  return updated;
}

export async function renameSite(
  oldSlug: string,
  newSlug: string,
  data: Partial<WeddingSite>
): Promise<WeddingSite | null> {
  const existing = await getSiteBySlug(oldSlug);
  if (!existing) return null;

  const updated = { ...existing, ...data, slug: newSlug };
  
  await pool.query(
    "UPDATE sites SET slug = $1, data = $2 WHERE slug = $3",
    [newSlug, JSON.stringify(updated), oldSlug]
  );
  
  return updated;
}

export async function getAllSlugs(): Promise<string[]> {
  const { rows } = await pool.query("SELECT slug FROM sites ORDER BY slug");
  return rows.map((r) => r.slug);
}
