import { NextRequest } from "next/server";
import dns from "dns";
import { requirePaidAuth } from "@/lib/auth";
import { apiOk, apiError } from "@/lib/api-response";
import { getSiteByDomain } from "@/lib/data/sites";
import { Resend } from "resend";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "abel@ithinkshewifey.com";

/** Check if a domain is already registered (has DNS records). */
async function isDomainRegistered(domain: string): Promise<boolean> {
  try {
    await dns.promises.resolveAny(domain);
    return true; // has DNS records = registered
  } catch (err: any) {
    if (err.code === "ENOTFOUND" || err.code === "ENODATA") return false; // not registered
    return false; // DNS error = assume available, we'll verify manually
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const auth = await requirePaidAuth(slug);
  if (auth instanceof Response) return auth;

  const body = await request.json();
  const domain = body.domain?.trim().toLowerCase();

  if (!domain || !domain.includes(".")) {
    return apiError("Please enter a valid domain (e.g. milkaandkifle.com)", 400);
  }

  // Check if domain is already used on our platform
  const existingSite = await getSiteByDomain(domain);
  if (existingSite) {
    return apiError("This domain is already connected to another site on our platform", 400);
  }

  // Check if domain is already registered by someone else
  const registered = await isDomainRegistered(domain);
  if (registered) {
    return apiError("This domain is already registered. Please choose a different domain, or contact support if you already own it.", 400);
  }

  // Send notification email
  const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
  if (!resend) {
    console.error("[Domain Request] RESEND_API_KEY not set");
    return apiError("Email service unavailable", 500);
  }

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "noreply@ithinkshewifey.com",
      to: ADMIN_EMAIL,
      subject: `Domain Request: ${domain} for ${slug}`,
      html: `
        <h2>New Custom Domain Request</h2>
        <table style="border-collapse:collapse;font-family:sans-serif;">
          <tr><td style="padding:8px;font-weight:bold;color:#666;">Site</td><td style="padding:8px;">${slug}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;color:#666;">Requested Domain</td><td style="padding:8px;"><strong>${domain}</strong></td></tr>
          <tr><td style="padding:8px;font-weight:bold;color:#666;">Dashboard</td><td style="padding:8px;"><a href="https://ithinkshewifey.com/dashboard/${slug}">Open Dashboard</a></td></tr>
        </table>
        <h3>Setup Steps</h3>
        <ol>
          <li>Check availability and purchase <strong>${domain}</strong> on Cloudflare Registrar</li>
          <li>Add CNAME record: <code>@</code> → <code>proxy.ithinkshewifey.com</code></li>
          <li>Register custom hostname via Cloudflare for SaaS API</li>
          <li>Update site record: set customDomain to <code>${domain}</code></li>
          <li>Verify and mark as connected</li>
        </ol>
      `,
    });

    console.log(`[Domain Request] Email sent for ${slug} requesting ${domain}`);
    return apiOk({ message: "Request submitted" });
  } catch (error) {
    console.error("[Domain Request] Failed to send email:", error);
    return apiError("Failed to submit request", 500);
  }
}
