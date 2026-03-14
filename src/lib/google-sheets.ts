import { google } from "googleapis";
import { markRSVPSynced, type GuestInput } from "./data/rsvps";

function extractSheetId(url: string) {
  const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : url;
}

export async function syncRSVPToGoogleSheets(
  site: any,
  email: string,
  guests: GuestInput[],
  message: string | undefined,
  rsvpId: string,
  createdAt?: Date
) {
  try {
    const googleSheetId = (site?.rsvpEmbedUrl ? extractSheetId(site.rsvpEmbedUrl) : null) || site?.googleSheetId;
    if (!googleSheetId) {
      console.warn("No Google Sheet ID configured for site:", site.slug);
      return false;
    }

    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;

    if (!clientEmail || !privateKey) {
      console.warn("Skipping Google Sheets sync: Missing credentials");
      return false;
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const sheetName = site.googleSheetName || "Sheet1";
    const range = `'${sheetName}'!A:G`;

    const timestamp = createdAt ? createdAt.toISOString() : new Date().toISOString();
    const values = guests.map((guest: any) => [
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
      requestBody: { values },
    });

    await markRSVPSynced(rsvpId);
    return true;
  } catch (error) {
    console.error(`Google Sheets Sync Failed for RSVP ${rsvpId}:`, error);
    return false;
  }
}
