import { NextResponse } from "next/server";
import { Resend } from "resend";
import { apiError } from "@/lib/api-response";
import { requirePaidAuth } from "@/lib/auth";
import { getSiteBySlug } from "@/lib/data/sites";
import { getBroadcastGroupsBySite, updateBroadcast, getBroadcastById } from "@/lib/data/broadcasts";
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
    const auth = await requirePaidAuth(slug);
    if (auth instanceof NextResponse) return auth;

    // Find the broadcast — query by ID directly instead of loading all
    const broadcast = await getBroadcastById(id);
    if (!broadcast) {
      return apiError("Broadcast not found", 404);
    }

    if (broadcast.status === "sent") {
      return apiError("Broadcast already sent", 400);
    }

    // Resolve group and recipients
    const groups = await getBroadcastGroupsBySite(slug);
    const group = groups.find((g) => g.id === broadcast.groupId);
    if (!group) {
      return apiError("Group not found", 404);
    }

    const recipients = await resolveGroupRecipients(group, slug);
    if (recipients.length === 0) {
      return apiError("No recipients in this group", 400);
    }

    const site = await getSiteBySlug(slug);
    if (!site) {
      return apiError("Site not found", 404);
    }

    // Mark as sending
    await updateBroadcast(id, { status: "sending" });

    try {
      if (broadcast.channel === "sms") {
        // ── SMS path ──
        const phoneRecipients = recipients.filter((r) => r.phone);
        if (phoneRecipients.length === 0) {
          await updateBroadcast(id, { status: "failed" });
          return apiError("No recipients with phone numbers in this group", 400);
        }

        const senderId = site.partner1Name && site.partner2Name
          ? `${site.partner1Name}&${site.partner2Name}`.slice(0, 11)
          : site.slug.slice(0, 11);
        const senderLine = site.partner1Name && site.partner2Name
          ? `${site.partner1Name} & ${site.partner2Name}\n\n`
          : "";

        const messageBody = broadcast.subject
          ? `${senderLine}${broadcast.subject}\n\n${broadcast.body}`
          : `${senderLine}${broadcast.body}`;

        const result = await sendSMSBroadcast(
          phoneRecipients.map((r) => ({ phone: r.phone!, name: r.name })),
          messageBody,
          senderId
        );

        await updateBroadcast(id, {
          status: result.sent > 0 ? "sent" : "failed",
          recipientCount: result.sent,
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
          return apiError("Email service not configured. Set RESEND_API_KEY in your environment.", 503);
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
          recipientCount: recipients.length,
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
      return apiError(`Failed to send ${broadcast.channel === "sms" ? "SMS messages" : "emails"}`);
    }
  } catch (error) {
    console.error("[API] POST Broadcast Send Error:", error);
    return apiError("Failed to send broadcast");
  }
}
