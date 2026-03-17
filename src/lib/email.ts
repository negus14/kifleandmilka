import { Resend } from "resend";
import { rsvpConfirmationHtml, rsvpNotificationHtml } from "./email-templates";
import type { WeddingSite } from "./types/wedding-site";
import { generateICS } from "./calendar";

let _resend: Resend | null = null;
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[Email] RESEND_API_KEY not set — emails disabled");
    return null;
  }
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

const EMAIL_FROM = process.env.EMAIL_FROM || "noreply@ithinkshewifey.com";

interface GuestInfo {
  name: string;
  attending: boolean;
  mealChoice?: string;
  isHalal?: boolean;
  dietaryPreference?: string;
}

export async function sendRSVPConfirmation(
  site: WeddingSite,
  email: string,
  guests: GuestInfo[],
  message?: string
) {
  const resend = getResend();
  if (!resend) return false;

  try {
    const hasAttending = guests.some((g) => g.attending);
    const icsContent = hasAttending && site.weddingDate ? generateICS(site) : "";

    const emailOptions: any = {
      from: EMAIL_FROM,
      to: email,
      subject: `RSVP Confirmed — ${site.partner1Name} & ${site.partner2Name}`,
      html: rsvpConfirmationHtml(site, guests, message),
    };

    if (icsContent) {
      emailOptions.attachments = [
        {
          filename: `${site.partner1Name}-${site.partner2Name}-wedding.ics`,
          content: Buffer.from(icsContent).toString("base64"),
          content_type: "text/calendar",
        },
      ];
    }

    await resend.emails.send(emailOptions);
    return true;
  } catch (error) {
    console.error("[Email] Failed to send RSVP confirmation:", error);
    return false;
  }
}

export async function sendRSVPNotification(
  site: WeddingSite,
  guestEmail: string,
  guests: GuestInfo[],
  message?: string
) {
  const coupleEmail = site.coupleEmail;
  if (!coupleEmail) return false;

  const resend = getResend();
  if (!resend) return false;

  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: coupleEmail,
      subject: `New RSVP: ${guests.map((g) => g.name).join(", ")}`,
      html: rsvpNotificationHtml(site, guestEmail, guests, message),
    });
    return true;
  } catch (error) {
    console.error("[Email] Failed to send RSVP notification:", error);
    return false;
  }
}
