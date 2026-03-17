import { db } from "@/lib/db";
import { broadcastGroups, broadcasts } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// ─── Broadcast Groups ───

export interface BroadcastGroupRecord {
  id: string;
  siteSlug: string | null;
  name: string;
  type: string;
  filter: any;
  members: any;
  createdAt: Date | null;
}

export async function getBroadcastGroupsBySite(slug: string): Promise<BroadcastGroupRecord[]> {
  return db.select().from(broadcastGroups).where(eq(broadcastGroups.siteSlug, slug));
}

export async function createBroadcastGroup(
  slug: string,
  data: { name: string; type: "smart" | "custom"; filter?: any; members?: string[] }
): Promise<BroadcastGroupRecord> {
  const [group] = await db.insert(broadcastGroups).values({
    siteSlug: slug,
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
  siteSlug: string | null;
  groupId: string | null;
  subject: string;
  body: string;
  channel: string;
  status: string;
  recipientCount: string | null;
  sentAt: Date | null;
  createdAt: Date | null;
}

export async function getBroadcastsBySite(slug: string): Promise<BroadcastRecord[]> {
  return db.select().from(broadcasts).where(eq(broadcasts.siteSlug, slug));
}

export async function createBroadcast(
  slug: string,
  data: { groupId: string; subject: string; body: string; channel?: string }
): Promise<BroadcastRecord> {
  const [broadcast] = await db.insert(broadcasts).values({
    siteSlug: slug,
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
  data: { status?: string; recipientCount?: string; sentAt?: Date }
) {
  const updates: any = {};
  if (data.status !== undefined) updates.status = data.status;
  if (data.recipientCount !== undefined) updates.recipientCount = data.recipientCount;
  if (data.sentAt !== undefined) updates.sentAt = data.sentAt;
  await db.update(broadcasts).set(updates).where(eq(broadcasts.id, id));
}
