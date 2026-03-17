import type { WeddingSite } from "./types/wedding-site";

function escapeICS(str: string): string {
  return str.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function formatICSDate(iso: string): string {
  // Convert ISO date to ICS format: 20260801T140000Z
  const d = new Date(iso);
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function generateICS(site: WeddingSite): string {
  const start = site.weddingDate;
  if (!start) return "";

  const startDate = formatICSDate(start);
  // End date: use weddingEndDate or default to +4 hours
  const endDate = site.weddingEndDate
    ? formatICSDate(site.weddingEndDate)
    : formatICSDate(new Date(new Date(start).getTime() + 4 * 60 * 60 * 1000).toISOString());

  const summary = `${site.partner1Name} & ${site.partner2Name}'s Wedding`;
  const location = site.locationText || "";
  const description = site.dateDisplayText
    ? `${site.dateDisplayText}${location ? ` — ${location}` : ""}`
    : "";
  const url = `https://ithinkshewifey.com/${site.slug}`;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ithinkshewifey//wedding//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `DTSTART:${startDate}`,
    `DTEND:${endDate}`,
    `SUMMARY:${escapeICS(summary)}`,
    ...(location ? [`LOCATION:${escapeICS(location)}`] : []),
    ...(description ? [`DESCRIPTION:${escapeICS(description)}\\n\\nDetails: ${url}`] : [`DESCRIPTION:Details: ${url}`]),
    `URL:${url}`,
    `UID:${site.slug}@ithinkshewifey.com`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return lines.join("\r\n");
}

/** Build a Google Calendar add-event URL */
export function googleCalendarUrl(site: WeddingSite): string {
  if (!site.weddingDate) return "";

  const start = formatICSDate(site.weddingDate).replace("Z", "");
  const end = site.weddingEndDate
    ? formatICSDate(site.weddingEndDate).replace("Z", "")
    : formatICSDate(new Date(new Date(site.weddingDate).getTime() + 4 * 60 * 60 * 1000).toISOString()).replace("Z", "");

  const title = `${site.partner1Name} & ${site.partner2Name}'s Wedding`;
  const details = `Details: https://ithinkshewifey.com/${site.slug}`;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${start}/${end}`,
    details,
    location: site.locationText || "",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
