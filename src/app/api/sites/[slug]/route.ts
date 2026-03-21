import { NextResponse } from "next/server";
import { requireAuth, createSession } from "../../../../lib/auth";
import { getSiteBySlug, updateSite, renameSite } from "../../../../lib/data/sites";
import type { WeddingSite } from "../../../../lib/types/wedding-site";
import { generateAndUploadOgImage } from "../../../../lib/og-image";

const RESERVED_SLUGS = [
  "dashboard", "api", "login", "signup", "pricing", "about", "admin", "logout", "auth", "preview"
];

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: currentSlug } = await params;
    const auth = await requireAuth(currentSlug);
    if (auth instanceof NextResponse) return auth;

    const body = (await request.json()) as Partial<WeddingSite>;
    const newSlug = body.slug;

    console.log(`[API] Site Update Started: ${currentSlug}`, {
      hasNewSlug: !!newSlug && newSlug !== currentSlug,
      updateFields: Object.keys(body)
    });

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

      console.log(`[API] Site Renamed Successfully: ${currentSlug} -> ${newSlug}`);
      return NextResponse.json({ ok: true, newSlug });
    }

    // ─── Standard Update Case ───
    const updated = await updateSite(currentSlug, body);
    if (!updated) {
      console.error(`[API] Site update returned null for: ${currentSlug}`);
      return NextResponse.json({ error: "Site not found or update failed to persist" }, { status: 404 });
    }

    // Regenerate OG image if relevant fields changed
    if (body.partner1Name || body.partner2Name || body.ogStyle !== undefined || body.customColors || body.templateId) {
      generateAndUploadOgImage(updated).catch((err) =>
        console.error("[OG] Failed to generate OG image:", err)
      );
    }

    console.log(`[API] Site Updated & Verified: ${currentSlug}`);
    return NextResponse.json({ ok: true, updatedAt: new Date().toISOString() });

  } catch (error: any) {
    console.error("[API] PUT Site Error:", {
      message: error.message,
      stack: error.stack,
      slug: (await params).slug
    });
    return NextResponse.json({ 
      error: "Internal Server Error", 
      details: process.env.NODE_ENV === "development" ? error.message : undefined 
    }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // Support bypassing cache for debugging via ?nocache=true
    const { searchParams } = new URL(request.url);
    const nocache = searchParams.get("nocache") === "true";

    const auth = await requireAuth(slug);
    if (auth instanceof NextResponse) return auth;

    const site = await getSiteBySlug(slug, nocache);
    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    return NextResponse.json(site);
  } catch (error: any) {
    console.error("[API] GET Site Error:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
