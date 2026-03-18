import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getGiftContributionsBySitePaginated, updateGiftContribution, deleteGiftContribution } from "@/lib/data/gift-contributions";
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

    const result = await getGiftContributionsBySitePaginated(slug, page, limit);
    return NextResponse.json({ contributions: result.items, total: result.total, page: result.page, totalPages: result.totalPages });
  } catch (error) {
    console.error("[API] GET Gift Contributions Error:", error);
    return apiError("Failed to load");
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

    const { id, status } = await request.json();
    if (!id) return apiError("Missing id", 400);

    await updateGiftContribution(id, { status });
    return apiOk();
  } catch (error) {
    console.error("[API] PUT Gift Contribution Error:", error);
    return apiError("Failed to update");
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

    const { id } = await request.json();
    if (!id) return apiError("Missing id", 400);

    await deleteGiftContribution(id);
    return apiOk();
  } catch (error) {
    console.error("[API] DELETE Gift Contribution Error:", error);
    return apiError("Failed to delete");
  }
}
