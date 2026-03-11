import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { getSiteBySlug } from "@/lib/data/sites";

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

function extractSheetId(url: string) {
  const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : url;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RSVPPayload;
    const { slug, email, guests, message } = body;

    if (!slug || !guests || !Array.isArray(guests) || guests.length === 0) {
      return NextResponse.json({ error: "Slug and at least one guest are required" }, { status: 400 });
    }

    const site = await getSiteBySlug(slug);
    const googleSheetId = site?.googleSheetId || (site?.rsvpEmbedUrl ? extractSheetId(site.rsvpEmbedUrl) : null);

    if (!site || !googleSheetId) {
      console.warn(`Site or Google Sheet ID not found for slug: ${slug}`);
      return NextResponse.json({ error: "Google Sheets integration not configured for this site" }, { status: 400 });
    }

    // Google Auth
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const range = `${site.googleSheetName || "Sheet1"}!A:G`;

    const timestamp = new Date().toISOString();
    
    // Map each guest to a row in the sheet
    // Columns: [Timestamp, Submitter Email, Guest Name, Attending, Meal Choice, Halal, Message]
    const values = guests.map((guest) => [
      timestamp,
      email || "",
      guest.name || "Unknown",
      guest.attending ? "Yes" : "No",
      guest.mealChoice || "None",
      guest.isHalal ? "Yes" : "No",
      message || "",
    ]);

    await sheets.spreadsheets.values.append({
      spreadsheetId: googleSheetId,
      range,
      valueInputOption: "RAW",
      requestBody: {
        values,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("RSVP Error:", error);
    return NextResponse.json({ error: error.message || "Failed to submit RSVP" }, { status: 500 });
  }
}
