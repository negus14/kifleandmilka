import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { getSiteBySlug } from "@/lib/data/sites";
import { getAuthenticatedClient } from "@/lib/google-auth";
import pool from "@/lib/db";

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

    let auth: any;

    // 1. Check if user has connected their OWN Google account (OAuth)
    if (site.googleTokens && site.googleTokens.refresh_token) {
      auth = await getAuthenticatedClient(site.googleTokens, async (newTokens) => {
        // Save refreshed tokens back to DB
        const updatedData = {
          ...site,
          googleTokens: {
            ...site.googleTokens,
            ...newTokens
          }
        };
        await pool.query(
          "UPDATE sites SET data = $1, updated_at = NOW() WHERE slug = $2",
          [updatedData, slug]
        );
      });
    } 
    // 2. Fallback to global Service Account
    else {
      const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
      const privateKey = process.env.GOOGLE_PRIVATE_KEY;

      if (!clientEmail || !privateKey) {
        console.error("RSVP Error: Missing Google Service Account credentials", {
          hasEmail: !!clientEmail,
          hasKey: !!privateKey,
        });
        return NextResponse.json({ 
          error: "Server configuration error: Google Sheets credentials are missing." 
        }, { status: 500 });
      }

      auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: clientEmail,
          private_key: privateKey.replace(/\\n/g, "\n"),
        },
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });
    }

    const sheets = google.sheets({ version: "v4", auth });
    const sheetName = site.googleSheetName || "Sheet1";
    const range = `'${sheetName}'!A:G`;

    console.log("RSVP Submission:", {
      spreadsheetId: googleSheetId,
      range,
      siteSlug: slug,
      authMethod: site.googleTokens?.refresh_token ? "OAuth" : "ServiceAccount"
    });

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
