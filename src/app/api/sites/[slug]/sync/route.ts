import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getSiteBySlug } from "@/lib/data/sites";
import { getUnsyncedRSVPs } from "@/lib/data/rsvps";
import { syncRSVPToGoogleSheets } from "@/lib/google-sheets";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // 1. Auth check
    const session = await getSession();
    if (!session || session.slug !== slug) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Get site and unsynced RSVPs
    const site = await getSiteBySlug(slug);
    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    const unsynced = await getUnsyncedRSVPs(slug);
    if (unsynced.length === 0) {
      return NextResponse.json({ success: true, message: "No RSVPs to sync", count: 0 });
    }

    // 3. Sync each one
    let successCount = 0;
    for (const rsvp of unsynced) {
      const success = await syncRSVPToGoogleSheets(
        site,
        rsvp.email,
        rsvp.guests,
        rsvp.message,
        rsvp.id,
        rsvp.created_at
      );
      if (success) successCount++;
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully synced ${successCount} RSVPs`,
      count: successCount,
      failed: unsynced.length - successCount
    });

  } catch (error: any) {
    console.error("Manual Sync Error:", error);
    return NextResponse.json({ error: error.message || "Failed to sync RSVPs" }, { status: 500 });
  }
}

// GET to check status
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const session = await getSession();
    if (!session || session.slug !== slug) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const unsynced = await getUnsyncedRSVPs(slug);
    return NextResponse.json({ 
      unsyncedCount: unsynced.length,
      needsSync: unsynced.length > 0 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
