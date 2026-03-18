import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getRSVPsBySitePaginated, updateRSVP, deleteRSVP } from "@/lib/data/rsvps";
import { apiOk, apiError } from "@/lib/api-response";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const auth = await requireAuth(slug);
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));

    const result = await getRSVPsBySitePaginated(slug, page, limit);
    return NextResponse.json({ rsvps: result.items, total: result.total, page: result.page, totalPages: result.totalPages });
  } catch (error) {
    console.error("[API] GET RSVPs Error:", error);
    return apiError("Failed to load RSVPs");
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
    const { id, email, phone, message, guests } = body;

    if (!id || typeof id !== "string") {
      return apiError("Missing RSVP id", 400);
    }

    await updateRSVP(id, { email, phone, message, guests });
    return apiOk();
  } catch (error) {
    console.error("[API] PUT RSVP Error:", error);
    return apiError("Failed to update RSVP");
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
      return apiError("Missing RSVP id", 400);
    }

    await deleteRSVP(id);
    return apiOk();
  } catch (error) {
    console.error("[API] DELETE RSVP Error:", error);
    return apiError("Failed to delete RSVP");
  }
}
