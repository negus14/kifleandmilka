import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getSiteBySlug } from "@/lib/data/sites";
import { getUnsyncedRSVPs } from "@/lib/data/rsvps";
import { syncRSVPToGoogleSheets } from "@/lib/google-sheets";
import { apiOk, apiError } from "@/lib/api-response";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // 1. Auth check
    const auth = await requireAuth(slug);
    if (auth instanceof NextResponse) return auth;

    // 2. Get site and unsynced RSVPs
    const site = await getSiteBySlug(slug);
    if (!site) {
      return apiError("Site not found", 404);
    }

    const unsynced = await getUnsyncedRSVPs(slug);
    if (unsynced.length === 0) {
      return apiOk({ message: "No RSVPs to sync", count: 0 });
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

    return apiOk({
      message: `Successfully synced ${successCount} RSVPs`,
      count: successCount,
      failed: unsynced.length - successCount
    });

  } catch (error: any) {
    console.error("Manual Sync Error:", error);
    return apiError(error.message || "Failed to sync RSVPs");
  }
}

// GET to check status
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const auth = await requireAuth(slug);
    if (auth instanceof NextResponse) return auth;

    const unsynced = await getUnsyncedRSVPs(slug);
    return NextResponse.json({ 
      unsyncedCount: unsynced.length,
      needsSync: unsynced.length > 0 
    });
  } catch (error: any) {
    return apiError(error.message);
  }
}
