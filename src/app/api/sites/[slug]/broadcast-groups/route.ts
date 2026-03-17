import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  getBroadcastGroupsBySite,
  createBroadcastGroup,
  deleteBroadcastGroup,
  updateBroadcastGroup,
} from "@/lib/data/broadcasts";

const DEFAULT_SMART_GROUPS = [
  { name: "All Guests", filter: { status: "all" } },
  { name: "Attending", filter: { status: "attending" } },
  { name: "Declined", filter: { status: "declined" } },
];

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const session = await getSession();
    if (!session || session.slug !== slug) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let groups = await getBroadcastGroupsBySite(slug);

    // Auto-create default smart groups on first load
    const hasSmartGroups = groups.some((g) => g.type === "smart");
    if (!hasSmartGroups) {
      for (const def of DEFAULT_SMART_GROUPS) {
        await createBroadcastGroup(slug, {
          name: def.name,
          type: "smart",
          filter: def.filter,
        });
      }
      groups = await getBroadcastGroupsBySite(slug);
    }

    return NextResponse.json({ groups });
  } catch (error) {
    console.error("[API] GET Broadcast Groups Error:", error);
    return NextResponse.json({ error: "Failed to load groups" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const session = await getSession();
    if (!session || session.slug !== slug) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, members } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Group name is required" }, { status: 400 });
    }

    const group = await createBroadcastGroup(slug, {
      name,
      type: "custom",
      members: members || [],
    });

    return NextResponse.json({ group });
  } catch (error) {
    console.error("[API] POST Broadcast Group Error:", error);
    return NextResponse.json({ error: "Failed to create group" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const session = await getSession();
    if (!session || session.slug !== slug) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, members } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Missing group id" }, { status: 400 });
    }

    await updateBroadcastGroup(id, { name, members });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] PUT Broadcast Group Error:", error);
    return NextResponse.json({ error: "Failed to update group" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const session = await getSession();
    if (!session || session.slug !== slug) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Missing group id" }, { status: 400 });
    }

    await deleteBroadcastGroup(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] DELETE Broadcast Group Error:", error);
    return NextResponse.json({ error: "Failed to delete group" }, { status: 500 });
  }
}
