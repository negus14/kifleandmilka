import type { WeddingSite } from "./types/wedding-site";
import { googleCalendarUrl } from "./calendar";

interface GuestInfo {
  name: string;
  attending: boolean;
  mealChoice?: string;
  isHalal?: boolean;
  dietaryPreference?: string;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function siteUrl(site: WeddingSite): string {
  return site.customDomain
    ? `https://${site.customDomain}`
    : `https://${site.slug}.ithinkshewifey.com`;
}

function siteUrlDisplay(site: WeddingSite): string {
  return site.customDomain || `${site.slug}.ithinkshewifey.com`;
}

function baseLayout(content: string, site: WeddingSite) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f7f6f3;font-family:Georgia,'Times New Roman',serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f6f3;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:4px;overflow:hidden;max-width:100%;">
  <tr><td style="padding:40px 40px 0;text-align:center;">
    <a href="https://www.ithinkshewifey.com" style="font-family:'Playfair Display',Georgia,serif;font-size:18px;font-weight:bold;font-style:italic;color:#2d2b25;text-decoration:none;">ITSW</a>
    <p style="font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#8a8578;margin:12px 0 8px;">
      ${escapeHtml(site.partner1Name)} &amp; ${escapeHtml(site.partner2Name)}
    </p>
  </td></tr>
  <tr><td style="padding:24px 40px 40px;">
    ${content}
  </td></tr>
  <tr><td style="padding:24px 40px;border-top:1px solid #e8e6e1;text-align:center;">
    <p style="font-size:11px;color:#8a8578;margin:0;">
      Sent from <a href="${siteUrl(site)}" style="color:#8a8578;">${escapeHtml(siteUrlDisplay(site))}</a>
    </p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

export function rsvpConfirmationHtml(
  site: WeddingSite,
  guests: GuestInfo[],
  message?: string
) {
  const attending = guests.filter((g) => g.attending);
  const declined = guests.filter((g) => !g.attending);

  const customMsg = site.rsvpConfirmationMessage
    ? `<p style="font-size:15px;color:#2d2b25;line-height:1.7;margin:0 0 20px;">${escapeHtml(site.rsvpConfirmationMessage)}</p>`
    : "";

  let guestRows = "";
  for (const g of guests) {
    const status = g.attending ? "Attending" : "Declined";
    const meal = g.mealChoice ? ` — ${escapeHtml(g.mealChoice)}${g.isHalal ? " (Halal)" : ""}` : "";
    const dietary = g.dietaryPreference ? `<br><span style="font-size:13px;color:#8a8578;">Dietary: ${escapeHtml(g.dietaryPreference)}</span>` : "";
    guestRows += `<tr>
      <td style="padding:10px 0;border-bottom:1px solid #f0eeea;font-size:14px;color:#2d2b25;">${escapeHtml(g.name)}</td>
      <td style="padding:10px 0;border-bottom:1px solid #f0eeea;font-size:14px;color:#8a8578;text-align:right;">${status}${meal}${dietary}</td>
    </tr>`;
  }

  const content = `
    <h1 style="font-size:22px;font-weight:normal;color:#2d2b25;text-align:center;margin:0 0 24px;">Thank you for your RSVP!</h1>
    ${customMsg}
    <p style="font-size:15px;color:#2d2b25;line-height:1.7;margin:0 0 8px;">
      ${attending.length > 0 ? `We're delighted ${attending.length === 1 ? "you" : `all ${attending.length} of you`} can join us!` : "We're sorry you won't be able to make it."}
    </p>
    ${site.dateDisplayText ? `<p style="font-size:14px;color:#8a8578;margin:0 0 4px;">${escapeHtml(site.dateDisplayText)}</p>` : ""}
    ${site.locationText ? `<p style="font-size:14px;color:#8a8578;margin:0 0 24px;">${escapeHtml(site.locationText)}</p>` : ""}
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">${guestRows}</table>
    ${message ? `<div style="background:#f7f6f3;padding:16px;border-radius:4px;margin:0 0 24px;"><p style="font-size:13px;color:#8a8578;margin:0 0 4px;">Your message:</p><p style="font-size:14px;color:#2d2b25;margin:0;font-style:italic;">"${escapeHtml(message)}"</p></div>` : ""}
    ${attending.length > 0 && site.weddingDate ? `<div style="text-align:center;margin:0 0 24px;"><a href="${googleCalendarUrl(site)}" target="_blank" style="display:inline-block;padding:12px 28px;background:#2d2b25;color:#fdfcf9;font-size:13px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;text-decoration:none;border-radius:3px;">Add to Calendar</a><p style="font-size:11px;color:#8a8578;margin:8px 0 0;">An .ics file is also attached for Apple &amp; Outlook calendars</p></div>` : ""}
    <p style="font-size:13px;color:#8a8578;margin:0;text-align:center;">You can view the full wedding details at<br><a href="${siteUrl(site)}" style="color:#2d2b25;">${escapeHtml(siteUrlDisplay(site))}</a></p>
  `;

  return baseLayout(content, site);
}

export function rsvpNotificationHtml(
  site: WeddingSite,
  email: string,
  guests: GuestInfo[],
  message?: string
) {
  const attending = guests.filter((g) => g.attending);
  const declined = guests.filter((g) => !g.attending);

  let guestList = "";
  for (const g of guests) {
    const status = g.attending ? "Attending" : "Declined";
    const meal = g.mealChoice ? ` — ${escapeHtml(g.mealChoice)}${g.isHalal ? " (Halal)" : ""}` : "";
    guestList += `<li style="font-size:14px;color:#2d2b25;padding:4px 0;">${escapeHtml(g.name)}: <strong>${status}</strong>${meal}</li>`;
  }

  const content = `
    <h1 style="font-size:22px;font-weight:normal;color:#2d2b25;text-align:center;margin:0 0 24px;">New RSVP Received</h1>
    <p style="font-size:15px;color:#2d2b25;line-height:1.7;margin:0 0 8px;">
      <strong>${escapeHtml(email)}</strong> just submitted an RSVP:
    </p>
    <p style="font-size:14px;color:#8a8578;margin:0 0 16px;">
      ${attending.length} attending${declined.length > 0 ? `, ${declined.length} declined` : ""}
    </p>
    <ul style="list-style:none;padding:0;margin:0 0 24px;">${guestList}</ul>
    ${message ? `<div style="background:#f7f6f3;padding:16px;border-radius:4px;margin:0 0 24px;"><p style="font-size:13px;color:#8a8578;margin:0 0 4px;">Message:</p><p style="font-size:14px;color:#2d2b25;margin:0;font-style:italic;">"${escapeHtml(message)}"</p></div>` : ""}
    <p style="font-size:13px;color:#8a8578;margin:0;text-align:center;">
      <a href="https://ithinkshewifey.com/dashboard/${escapeHtml(site.slug)}" style="color:#2d2b25;">View all RSVPs in dashboard</a>
    </p>
  `;

  return baseLayout(content, site);
}

export function broadcastEmailHtml(
  site: WeddingSite,
  subject: string,
  body: string
) {
  // Convert newlines to paragraphs
  const paragraphs = body
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p style="font-size:15px;color:#2d2b25;line-height:1.7;margin:0 0 16px;">${escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
    .join("");

  const content = `
    <h1 style="font-size:22px;font-weight:normal;color:#2d2b25;text-align:center;margin:0 0 24px;">${escapeHtml(subject)}</h1>
    ${paragraphs}
    <p style="font-size:13px;color:#8a8578;margin:24px 0 0;text-align:center;">
      <a href="${siteUrl(site)}" style="color:#2d2b25;">View wedding details</a>
    </p>
  `;

  return baseLayout(content, site);
}

export function inviteEmailDefaults(site: WeddingSite): { subject: string; body: string } {
  const names = `${site.partner1Name} & ${site.partner2Name}`;
  const subject = `You're Invited — ${names}`;
  const body = `We are delighted to invite you to celebrate our wedding!\n\n${site.dateDisplayText ? `Date: ${site.dateDisplayText}\n` : ""}${site.locationText ? `Venue: ${site.locationText}\n` : ""}\nPlease visit our wedding website for all the details and to RSVP:\n${siteUrl(site)}\n\nWe can't wait to celebrate with you!\n\nWith love,\n${names}`;
  return { subject, body };
}
