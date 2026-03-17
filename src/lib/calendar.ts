import type { WeddingSite } from "./types/wedding-site";

function formatICSDate(iso: string): string {
  const d = new Date(iso);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  const h = String(d.getUTCHours()).padStart(2, "0");
  const min = String(d.getUTCMinutes()).padStart(2, "0");
  const s = String(d.getUTCSeconds()).padStart(2, "0");
  return `${y}${m}${day}T${h}${min}${s}Z`;
}

export function generateICS(site: WeddingSite): string {
  const start = site.weddingDate;
  if (!start) return "";

  const startDate = formatICSDate(start);
  const endDate = site.weddingEndDate
    ? formatICSDate(site.weddingEndDate)
    : formatICSDate(new Date(new Date(start).getTime() + 4 * 60 * 60 * 1000).toISOString());
  const now = formatICSDate(new Date().toISOString());

  const summary = `${site.partner1Name} & ${site.partner2Name} Wedding`;
  const location = site.locationText || "";
  const url = `https://ithinkshewifey.com/${site.slug}`;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ithinkshewifey//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `DTSTAMP:${now}`,
    `DTSTART:${startDate}`,
    `DTEND:${endDate}`,
    `SUMMARY:${summary}`,
    ...(location ? [`LOCATION:${location}`] : []),
    `DESCRIPTION:Details: ${url}`,
    `URL:${url}`,
    `UID:${site.slug}@ithinkshewifey.com`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
    "",
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
