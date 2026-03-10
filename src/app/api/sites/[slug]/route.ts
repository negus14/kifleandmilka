import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getSiteBySlug, updateSite } from "@/lib/data/sites";
import type { WeddingSite } from "@/lib/types/wedding-site";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const session = await getSession();
  if (!session || session.slug !== slug) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as Partial<WeddingSite>;
  const updated = await updateSite(slug, body);
  if (!updated) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const session = await getSession();
  if (!session || session.slug !== slug) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const site = await getSiteBySlug(slug);
  if (!site) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  return NextResponse.json(site);
}
