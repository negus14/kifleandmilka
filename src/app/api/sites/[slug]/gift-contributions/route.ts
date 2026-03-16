import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getGiftContributionsBySite, updateGiftContribution, deleteGiftContribution } from "@/lib/data/gift-contributions";

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

    const contributions = await getGiftContributionsBySite(slug);
    return NextResponse.json({ contributions });
  } catch (error) {
    console.error("[API] GET Gift Contributions Error:", error);
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
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

    const { id, status } = await request.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    await updateGiftContribution(id, { status });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] PUT Gift Contribution Error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
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

    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    await deleteGiftContribution(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] DELETE Gift Contribution Error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
