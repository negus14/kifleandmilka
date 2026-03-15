import { NextRequest, NextResponse } from "next/server";
import { getSiteBySlug } from "../../../lib/data/sites";
import { createRSVP } from "../../../lib/data/rsvps";
import { syncRSVPToGoogleSheets } from "../../../lib/google-sheets";

interface GuestInput {
  name: string;
  attending: boolean;
  mealChoice?: string;
  isHalal?: boolean;
}

interface RSVPPayload {
  slug: string;
  email: string;
  message?: string;
  guests: GuestInput[];
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RSVPPayload;
    const { slug, email, guests, message } = body;

    if (!slug || !guests || !Array.isArray(guests) || guests.length === 0) {
      return NextResponse.json({ error: "Slug and at least one guest are required" }, { status: 400 });
    }

    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "A valid email address is required" }, { status: 400 });
    }

    if (guests.length > 10) {
      return NextResponse.json({ error: "Maximum 10 guests per RSVP" }, { status: 400 });
    }

    for (const guest of guests) {
      if (!guest.name || typeof guest.name !== "string" || guest.name.trim().length === 0) {
        return NextResponse.json({ error: "Each guest must have a name" }, { status: 400 });
      }
      if (guest.name.length > 100) {
        return NextResponse.json({ error: "Guest name is too long" }, { status: 400 });
      }
    }

    const site = await getSiteBySlug(slug);
    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    // 1. Save to PostgreSQL (Primary Data Store)
    const rsvp = await createRSVP(slug, email, guests, message);

    // 2. Attempt Sync to Google Sheets (Secondary/Legacy Store)
    // We await this to ensure we try at least once, but failure won't break the response
    // since the data is now safe in our DB.
    await syncRSVPToGoogleSheets(site, email, guests, message, rsvp.id);

    return NextResponse.json({ success: true, rsvpId: rsvp.id });
  } catch (error: any) {
    console.error("RSVP Error:", error);
    return NextResponse.json({ error: "Failed to submit RSVP. Please try again." }, { status: 500 });
  }
}
