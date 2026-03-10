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

export async function getAllSlugs(): Promise<string[]> {
  const { rows } = await pool.query("SELECT slug FROM sites ORDER BY slug");
  return rows.map((r) => r.slug);
}
