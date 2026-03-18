import { NextRequest, NextResponse } from "next/server";
import { getSiteBySlug } from "../../../lib/data/sites";
import { createRSVP, markRSVPConfirmationSent } from "../../../lib/data/rsvps";
import { syncRSVPToGoogleSheets } from "../../../lib/google-sheets";
import { sendRSVPConfirmation, sendRSVPNotification } from "../../../lib/email";
import { rateLimit, getClientIP } from "@/lib/rate-limit";
import { rsvpSchema, parseBody } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 RSVPs per IP per minute
    const ip = getClientIP(request);
    const { allowed } = await rateLimit(ip, { prefix: "rl:rsvp", maxRequests: 5, windowSeconds: 60 });
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many submissions. Please wait a moment and try again." },
        { status: 429 }
      );
    }

    // Validate & sanitize input with Zod — replaces all the manual if/else checks.
    // This also strips HTML tags from text fields to prevent stored XSS.
    const body = await request.json();
    const parsed = parseBody(rsvpSchema, body);
    if (typeof parsed === "string") {
      return NextResponse.json({ error: parsed }, { status: 400 });
    }

    const { slug, email, phone, guests, message } = parsed;

    const site = await getSiteBySlug(slug);
    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    // 1. Save to PostgreSQL (Primary Data Store)
    const rsvp = await createRSVP(slug, email, guests, message, phone);

    // 2. Attempt Sync to Google Sheets (Secondary/Legacy Store)
    await syncRSVPToGoogleSheets(site, email, guests, message, rsvp.id);

    // 3. Send email confirmations (fire-and-forget — never block response)
    sendRSVPConfirmation(site, email, guests, message)
      .then((sent) => { if (sent) markRSVPConfirmationSent(rsvp.id); })
      .catch((err) => console.error("[RSVP] Confirmation email error:", err));
    sendRSVPNotification(site, email, guests, message)
      .catch((err) => console.error("[RSVP] Notification email error:", err));

    return NextResponse.json({ success: true, rsvpId: rsvp.id });
  } catch (error: any) {
    console.error("RSVP Error:", error);
    return NextResponse.json({ error: "Failed to submit RSVP. Please try again." }, { status: 500 });
  }
}
