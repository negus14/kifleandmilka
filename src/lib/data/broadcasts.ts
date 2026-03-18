import { db } from "@/lib/db";
import { broadcastGroups, broadcasts } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getSiteIdBySlug } from "./sites";

// ─── Broadcast Groups ───

export interface BroadcastGroupRecord {
  id: string;
  siteId: string | null;
  name: string;
  type: string;
  filter: any;
  members: any;
  createdAt: Date | null;
}

export async function getBroadcastGroupsBySite(slug: string): Promise<BroadcastGroupRecord[]> {
  const siteId = await getSiteIdBySlug(slug);
  if (!siteId) return [];
  return db.select().from(broadcastGroups).where(eq(broadcastGroups.siteId, siteId));
}

export async function createBroadcastGroup(
  slug: string,
  data: { name: string; type: "smart" | "custom"; filter?: any; members?: string[] }
): Promise<BroadcastGroupRecord> {
  const siteId = await getSiteIdBySlug(slug);
  if (!siteId) throw new Error(`Site not found: ${slug}`);

  const [group] = await db.insert(broadcastGroups).values({
    siteId,
    name: data.name,
    type: data.type,
    filter: data.filter || null,
    members: data.members || [],
  }).returning();
  return group;
}

export async function deleteBroadcastGroup(id: string) {
  await db.delete(broadcastGroups).where(eq(broadcastGroups.id, id));
}

export async function updateBroadcastGroup(
  id: string,
  data: { name?: string; members?: string[] }
) {
  const updates: any = {};
  if (data.name !== undefined) updates.name = data.name;
  if (data.members !== undefined) updates.members = data.members;
  await db.update(broadcastGroups).set(updates).where(eq(broadcastGroups.id, id));
}

// ─── Broadcasts ───

export interface BroadcastRecord {
  id: string;
  siteId: string | null;
  groupId: string | null;
  subject: string;
  body: string;
  channel: string;
  status: string;
  recipientCount: number | null;
  sentAt: Date | null;
  createdAt: Date | null;
}

export async function getBroadcastsBySite(slug: string): Promise<BroadcastRecord[]> {
  const siteId = await getSiteIdBySlug(slug);
  if (!siteId) return [];
  return db.select().from(broadcasts).where(eq(broadcasts.siteId, siteId));
}

export async function getBroadcastById(id: string): Promise<BroadcastRecord | null> {
  const [broadcast] = await db.select().from(broadcasts).where(eq(broadcasts.id, id));
  return broadcast || null;
}

export async function createBroadcast(
  slug: string,
  data: { groupId: string; subject: string; body: string; channel?: string }
): Promise<BroadcastRecord> {
  const siteId = await getSiteIdBySlug(slug);
  if (!siteId) throw new Error(`Site not found: ${slug}`);

  const [broadcast] = await db.insert(broadcasts).values({
    siteId,
    groupId: data.groupId,
    subject: data.subject,
    body: data.body,
    channel: data.channel || "email",
    status: "draft",
  }).returning();
  return broadcast;
}

export async function updateBroadcast(
  id: string,
  data: { status?: string; recipientCount?: number; sentAt?: Date }
) {
  const updates: any = {};
  if (data.status !== undefined) updates.status = data.status;
  if (data.recipientCount !== undefined) updates.recipientCount = data.recipientCount;
  if (data.sentAt !== undefined) updates.sentAt = data.sentAt;
  await db.update(broadcasts).set(updates).where(eq(broadcasts.id, id));
}
