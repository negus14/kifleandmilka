import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import {
  getBroadcastGroupsBySite,
  createBroadcastGroup,
  deleteBroadcastGroup,
  updateBroadcastGroup,
} from "@/lib/data/broadcasts";
import { broadcastGroupSchema, parseBody } from "@/lib/validations";
import { apiOk, apiError } from "@/lib/api-response";

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
    const auth = await requireAuth(slug);
    if (auth instanceof NextResponse) return auth;

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
    return apiError("Failed to load groups");
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const auth = await requireAuth(slug);
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    const parsed = parseBody(broadcastGroupSchema, body);
    if (typeof parsed === "string") {
      return apiError(parsed, 400);
    }

    const group = await createBroadcastGroup(slug, {
      name: parsed.name,
      type: "custom",
      members: parsed.members,
    });

    return NextResponse.json({ group });
  } catch (error) {
    console.error("[API] POST Broadcast Group Error:", error);
    return apiError("Failed to create group");
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const auth = await requireAuth(slug);
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    const { id, name, members } = body;

    if (!id || typeof id !== "string") {
      return apiError("Missing group id", 400);
    }

    await updateBroadcastGroup(id, { name, members });
    return apiOk();
  } catch (error) {
    console.error("[API] PUT Broadcast Group Error:", error);
    return apiError("Failed to update group");
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const auth = await requireAuth(slug);
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    const { id } = body;

    if (!id || typeof id !== "string") {
      return apiError("Missing group id", 400);
    }

    await deleteBroadcastGroup(id);
    return apiOk();
  } catch (error) {
    console.error("[API] DELETE Broadcast Group Error:", error);
    return apiError("Failed to delete group");
  }
}
