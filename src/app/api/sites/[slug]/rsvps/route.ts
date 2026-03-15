import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getRSVPsBySite } from "@/lib/data/rsvps";

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

    const rsvps = await getRSVPsBySite(slug);
    return NextResponse.json({ rsvps });
  } catch (error) {
    console.error("[API] GET RSVPs Error:", error);
    return NextResponse.json({ error: "Failed to load RSVPs" }, { status: 500 });
  }
}
