import { NextResponse } from "next/server";
import { getSession, createSession } from "../../../../lib/auth";
import { getSiteBySlug, updateSite, renameSite } from "../../../../lib/data/sites";
import type { WeddingSite } from "../../../../lib/types/wedding-site";

const RESERVED_SLUGS = [
  "dashboard", "api", "login", "signup", "pricing", "about", "admin", "logout", "auth", "preview"
];

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug: currentSlug } = await params;
  const session = await getSession();
  if (!session || session.slug !== currentSlug) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as Partial<WeddingSite>;
  const newSlug = body.slug;

  // ─── Handle Rename Case ───
  if (newSlug && newSlug !== currentSlug) {
    // 1. Validate format
    if (!/^[a-z0-9-]+$/.test(newSlug)) {
      return NextResponse.json({ error: "URL can only contain lowercase letters, numbers, and hyphens" }, { status: 400 });
    }
    if (newSlug.length < 3) {
      return NextResponse.json({ error: "URL is too short" }, { status: 400 });
    }
    if (RESERVED_SLUGS.includes(newSlug)) {
      return NextResponse.json({ error: "This URL is reserved and cannot be used" }, { status: 400 });
    }

    // 2. Check for conflicts
    const existing = await getSiteBySlug(newSlug);
    if (existing) {
      return NextResponse.json({ error: "This URL is already taken" }, { status: 400 });
    }

    // 3. Rename in DB
    const updated = await renameSite(currentSlug, newSlug, body);
    if (!updated) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    // 4. Update session
    await createSession(newSlug);

    return NextResponse.json({ ok: true, newSlug });
  }

  // ─── Standard Update Case ───
  const updated = await updateSite(currentSlug, body);
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
