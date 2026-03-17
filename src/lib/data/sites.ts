import pool, { db } from "@/lib/db";
import redis from "@/lib/redis";
import { sites, siteAuditLog } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { WeddingSite } from "@/lib/types/wedding-site";
import { normalizeSiteData } from "../template-utils";

const SITE_CACHE_TTL = 60; // 60 seconds — short TTL to minimize stale reads

function getSiteCacheKey(slug: string) {
  return `site:${slug}`;
}

/** Invalidate cache with retry. Logs but does not throw on failure. */
async function invalidateCache(slug: string): Promise<void> {
  const key = getSiteCacheKey(slug);
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      await redis.del(key);
      console.log(`[Redis] Cache invalidated for: ${slug}`);
      return;
    } catch (error) {
      console.error(`[Redis] Invalidation attempt ${attempt} failed for ${slug}:`, error);
    }
  }
  // If both retries failed, log a warning — reads will get stale data for up to TTL
  console.warn(`[Redis] ⚠️ Cache invalidation FAILED for ${slug} after 2 attempts. Stale data may be served for up to ${SITE_CACHE_TTL}s.`);
}

export async function getSiteBySlug(
  slug: string,
  forceRefresh: boolean = false
): Promise<WeddingSite | null> {
  const cacheKey = getSiteCacheKey(slug);

  // 1. Try Cache First (Unless forced refresh)
  if (!forceRefresh) {
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        console.log(`[Redis] Cache HIT for: ${slug}`);
        const site = JSON.parse(cached) as WeddingSite;
        return normalizeSiteData(site);
      }
      console.log(`[Redis] Cache MISS for: ${slug}`);
    } catch (error) {
      if (!(redis as any)._logged_error) {
        console.error("[Redis] Read Error (skipping cache):", (error as any).message || error);
      }
    }
  }

  // 2. Fallback to Drizzle
  console.log(`[DB] Fetching site from database: ${slug}`);
  const [result] = await db
    .select({
      data: sites.data,
      isPaid: sites.isPaid,
      stripeCustomerId: sites.stripeCustomerId,
      customDomain: sites.customDomain,
    })
    .from(sites)
    .where(eq(sites.slug, slug));

  if (!result) return null;
  const site = {
    ...normalizeSiteData(result.data as WeddingSite),
    isPaid: result.isPaid,
    stripeCustomerId: result.stripeCustomerId,
    customDomain: result.customDomain,
  };

  // 3. Populate Cache
  try {
    await redis.setex(cacheKey, SITE_CACHE_TTL, JSON.stringify(site));
  } catch (error) {
    console.error("[Redis] Write Error:", error);
  }

  return site;
}

export async function updateSite(
  slug: string,
  data: Partial<WeddingSite>
): Promise<WeddingSite | null> {
  const existing = await getSiteBySlug(slug, true); // Force refresh to get latest before update
  if (!existing) return null;

  // Combine data, but ensure keys in 'data' completely overwrite those in 'existing'
  // This is especially important for arrays like sectionOrder
  const updated = { ...existing, ...data, slug: existing.slug };

  // Drizzle Update — verify rows affected
  const changedFields = Object.keys(data);
  console.log(`[DB] Updating site: ${slug}`, { 
    fieldsChanged: changedFields,
    sectionCount: updated.sectionOrder?.length 
  });

  const { isPaid, stripeCustomerId, customDomain, ...rest } = updated;
  const result = await db.update(sites)
    .set({
      data: rest,
      isPaid: isPaid ? new Date(isPaid) : null,
      stripeCustomerId: stripeCustomerId || null,
      customDomain: customDomain ? customDomain.toLowerCase() : null,
      updatedAt: new Date()
    })
    .where(eq(sites.slug, slug))
    .returning({ slug: sites.slug });

  if (!result.length) {
    console.error(`[DB] ⚠️ UPDATE affected 0 rows for slug: ${slug} — row may have been deleted`);
    return null;
  }

  // Audit log (fire-and-forget — never block the save)
  db.insert(siteAuditLog).values({
    siteSlug: slug,
    action: "update",
    changedFields,
  }).catch((err) => console.error("[Audit] Failed to log update:", err));

  // Invalidate Cache (with retry)
  await invalidateCache(slug);
  // Also invalidate domain cache if domain changed
  if (customDomain) {
    try { await redis.del(`domain:${customDomain.toLowerCase()}`); } catch {}
  }

  // Verify persistence by re-reading from DB
  const verified = await getSiteBySlug(slug, true);
  if (!verified) {
    console.error(`[DB] ⚠️ Post-update verification FAILED for slug: ${slug} — data not found after update`);
    return null;
  }

  console.log(`[DB] ✓ Update verified for: ${slug}`);
  return verified;
}

export async function renameSite(
  oldSlug: string,
  newSlug: string,
  data: Partial<WeddingSite>
): Promise<WeddingSite | null> {
  const existing = await getSiteBySlug(oldSlug, true);
  if (!existing) return null;

  const updated = { ...existing, ...data, slug: newSlug };

  // Drizzle Update (including PK change) — verify rows affected
  console.log(`[DB] Renaming site: ${oldSlug} -> ${newSlug}`);
  const { isPaid, stripeCustomerId, customDomain, ...rest } = updated;
  const result = await db.update(sites)
    .set({
      slug: newSlug,
      data: rest,
      isPaid: isPaid ? new Date(isPaid) : null,
      stripeCustomerId: stripeCustomerId || null,
      customDomain: customDomain ? customDomain.toLowerCase() : null,
      updatedAt: new Date()
    })
    .where(eq(sites.slug, oldSlug))
    .returning({ slug: sites.slug });

  if (!result.length) {
    console.error(`[DB] ⚠️ RENAME affected 0 rows for slug: ${oldSlug}`);
    return null;
  }

  // Audit log (fire-and-forget)
  db.insert(siteAuditLog).values({
    siteSlug: newSlug,
    action: "rename",
    changedFields: [`slug: ${oldSlug} -> ${newSlug}`],
  }).catch((err) => console.error("[Audit] Failed to log rename:", err));

  // Invalidate Both Old and New Cache Keys
  await invalidateCache(oldSlug);
  await invalidateCache(newSlug);

  return updated;
}

export async function createSite(
  slug: string,
  data: WeddingSite
): Promise<WeddingSite> {
  console.log(`[DB] Creating site: ${slug}`);
  const { isPaid, stripeCustomerId, customDomain, ...rest } = data;
  await db.insert(sites).values({
    slug,
    data: rest,
    isPaid: isPaid ? new Date(isPaid) : null,
    stripeCustomerId: stripeCustomerId || null,
    customDomain: customDomain ? customDomain.toLowerCase() : null,
  });
  return data;
}

export async function getSiteByDomain(
  domain: string
): Promise<WeddingSite | null> {
  const domainCacheKey = `domain:${domain}`;

  // 1. Try Redis cache
  try {
    const cached = await redis.get(domainCacheKey);
    if (cached) {
      console.log(`[Redis] Domain cache HIT for: ${domain}`);
      const site = JSON.parse(cached) as WeddingSite;
      return normalizeSiteData(site);
    }
  } catch (error) {
    // Redis unavailable — fall through to DB
  }

  // 2. Query by customDomain column
  const [result] = await db
    .select({
      slug: sites.slug,
      data: sites.data,
      isPaid: sites.isPaid,
      stripeCustomerId: sites.stripeCustomerId,
    })
    .from(sites)
    .where(eq(sites.customDomain, domain.toLowerCase()));

  if (!result) return null;

  const site = {
    ...normalizeSiteData(result.data as WeddingSite),
    isPaid: result.isPaid,
    stripeCustomerId: result.stripeCustomerId,
  };

  // 3. Populate cache
  try {
    await redis.setex(domainCacheKey, SITE_CACHE_TTL, JSON.stringify(site));
  } catch (error) {
    console.error("[Redis] Domain cache write error:", error);
  }

  return site;
}

export async function getAllSlugs(): Promise<string[]> {
  const rows = await db.select({ slug: sites.slug }).from(sites).orderBy(sites.slug);
  return rows.map((r) => r.slug);
}
