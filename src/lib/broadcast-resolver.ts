import { getRSVPsBySite } from "./data/rsvps";
import type { BroadcastGroupRecord } from "./data/broadcasts";

export interface Recipient {
  email: string;
  name: string;
  phone?: string;
}

export async function resolveGroupRecipients(
  group: BroadcastGroupRecord
): Promise<Recipient[]> {
  if (!group.siteSlug) return [];

  if (group.type === "smart") {
    const rsvps = await getRSVPsBySite(group.siteSlug);
    const filter = group.filter as { status?: string } | null;
    const status = filter?.status || "all";

    const recipients: Recipient[] = [];
    for (const rsvp of rsvps) {
      if (!rsvp.email) continue;

      const guests = rsvp.guests as any[];
      const recipient: Recipient = { email: rsvp.email, name: guests[0]?.name || rsvp.email, phone: rsvp.phone || undefined };
      if (status === "all") {
        recipients.push(recipient);
      } else if (status === "attending") {
        const hasAttending = guests.some((g) => g.attending === true || g.attending === "yes");
        if (hasAttending) recipients.push(recipient);
      } else if (status === "declined") {
        const allDeclined = guests.every((g) => g.attending === false || g.attending === "no");
        if (allDeclined) recipients.push(recipient);
      }
    }

    // Deduplicate by email
    const seen = new Set<string>();
    return recipients.filter((r) => {
      const lower = r.email.toLowerCase();
      if (seen.has(lower)) return false;
      seen.add(lower);
      return true;
    });
  }

  if (group.type === "custom") {
    const memberEmails = (group.members as string[]) || [];
    if (memberEmails.length === 0) return [];

    // Resolve names and phones from RSVP data
    const rsvps = await getRSVPsBySite(group.siteSlug);
    const emailToInfo = new Map<string, { name: string; phone?: string }>();
    for (const rsvp of rsvps) {
      if (rsvp.email) {
        const guests = rsvp.guests as any[];
        emailToInfo.set(rsvp.email.toLowerCase(), {
          name: guests[0]?.name || rsvp.email,
          phone: rsvp.phone || undefined,
        });
      }
    }

    return memberEmails.map((email) => {
      const info = emailToInfo.get(email.toLowerCase());
      return { email, name: info?.name || email, phone: info?.phone };
    });
  }

  return [];
}
