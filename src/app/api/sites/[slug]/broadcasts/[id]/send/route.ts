import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getSession } from "@/lib/auth";
import { getSiteBySlug } from "@/lib/data/sites";
import { getBroadcastGroupsBySite, updateBroadcast, getBroadcastsBySite } from "@/lib/data/broadcasts";
import { resolveGroupRecipients } from "@/lib/broadcast-resolver";
import { broadcastEmailHtml } from "@/lib/email-templates";
import { sendSMSBroadcast } from "@/lib/sms";

let _resend: Resend | null = null;
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}
const EMAIL_FROM = process.env.EMAIL_FROM || "noreply@ithinkshewifey.com";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const { slug, id } = await params;
    const session = await getSession();
    if (!session || session.slug !== slug) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.isPaid) {
      return NextResponse.json({ error: "Broadcasting requires a premium account. Upgrade to send emails and SMS." }, { status: 403 });
    }

    // Find the broadcast
    const allBroadcasts = await getBroadcastsBySite(slug);
    const broadcast = allBroadcasts.find((b) => b.id === id);
    if (!broadcast) {
      return NextResponse.json({ error: "Broadcast not found" }, { status: 404 });
    }

    if (broadcast.status === "sent") {
      return NextResponse.json({ error: "Broadcast already sent" }, { status: 400 });
    }

    // Resolve group and recipients
    const groups = await getBroadcastGroupsBySite(slug);
    const group = groups.find((g) => g.id === broadcast.groupId);
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    const recipients = await resolveGroupRecipients(group);
    if (recipients.length === 0) {
      return NextResponse.json({ error: "No recipients in this group" }, { status: 400 });
    }

    const site = await getSiteBySlug(slug);
    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    // Mark as sending
    await updateBroadcast(id, { status: "sending" });

    try {
      if (broadcast.channel === "sms") {
        // ── SMS path ──
        const phoneRecipients = recipients.filter((r) => r.phone);
        if (phoneRecipients.length === 0) {
          await updateBroadcast(id, { status: "failed" });
          return NextResponse.json({ error: "No recipients with phone numbers in this group" }, { status: 400 });
        }

        const messageBody = broadcast.subject
          ? `${senderLine}${broadcast.subject}\n\n${broadcast.body}`
          : `${senderLine}${broadcast.body}`;

        const senderId = site.partner1Name && site.partner2Name
          ? `${site.partner1Name}&${site.partner2Name}`.slice(0, 11)
          : site.slug.slice(0, 11);
        const senderLine = site.partner1Name && site.partner2Name
          ? `${site.partner1Name} & ${site.partner2Name}\n\n`
          : "";

        const result = await sendSMSBroadcast(
          phoneRecipients.map((r) => ({ phone: r.phone!, name: r.name })),
          messageBody,
          senderId
        );

        await updateBroadcast(id, {
          status: result.sent > 0 ? "sent" : "failed",
          recipientCount: String(result.sent),
          sentAt: new Date(),
        });

        return NextResponse.json({
          success: result.sent > 0,
          recipientCount: result.sent,
          failed: result.failed,
        });
      } else {
        // ── Email path ──
        const resend = getResend();
        if (!resend) {
          await updateBroadcast(id, { status: "failed" });
          return NextResponse.json({ error: "Email service not configured. Set RESEND_API_KEY in your environment." }, { status: 503 });
        }

        const html = broadcastEmailHtml(site, broadcast.subject, broadcast.body);
        const batches: { from: string; to: string; subject: string; html: string }[][] = [];

        for (let i = 0; i < recipients.length; i += 100) {
          batches.push(
            recipients.slice(i, i + 100).map((r) => ({
              from: EMAIL_FROM,
              to: r.email,
              subject: broadcast.subject,
              html,
            }))
          );
        }

        for (const batch of batches) {
          await resend.batch.send(batch);
        }

        await updateBroadcast(id, {
          status: "sent",
          recipientCount: String(recipients.length),
          sentAt: new Date(),
        });

        return NextResponse.json({
          success: true,
          recipientCount: recipients.length,
        });
      }
    } catch (sendError) {
      console.error("[Broadcast] Send failed:", sendError);
      await updateBroadcast(id, { status: "failed" });
      return NextResponse.json({ error: `Failed to send ${broadcast.channel === "sms" ? "SMS messages" : "emails"}` }, { status: 500 });
    }
  } catch (error) {
    console.error("[API] POST Broadcast Send Error:", error);
    return NextResponse.json({ error: "Failed to send broadcast" }, { status: 500 });
  }
}
