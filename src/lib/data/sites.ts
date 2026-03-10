import fs from "fs/promises";
import path from "path";
import type { WeddingSite } from "@/lib/types/wedding-site";

const DATA_DIR = path.join(process.cwd(), "data", "sites");

export async function getSiteBySlug(
  slug: string
): Promise<WeddingSite | null> {
  try {
    const filePath = path.join(DATA_DIR, `${slug}.json`);
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as WeddingSite;
  } catch {
    return null;
  }
}

export async function updateSite(
  slug: string,
  data: Partial<WeddingSite>
): Promise<WeddingSite | null> {
  const existing = await getSiteBySlug(slug);
  if (!existing) return null;

  const updated = { ...existing, ...data, slug: existing.slug };
  const filePath = path.join(DATA_DIR, `${slug}.json`);
  await fs.writeFile(filePath, JSON.stringify(updated, null, 2), "utf-8");
  return updated;
}

export async function getAllSlugs(): Promise<string[]> {
  try {
    const files = await fs.readdir(DATA_DIR);
    return files
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(".json", ""));
  } catch {
    return [];
  }
}
