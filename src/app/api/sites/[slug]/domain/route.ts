import { NextResponse } from "next/server";
import { requirePaidAuth } from "@/lib/auth";
import { getSiteBySlug, getSiteByDomain, updateSite } from "@/lib/data/sites";
import { createCustomHostname, getCustomHostname } from "@/lib/cloudflare";
import { apiOk, apiError } from "@/lib/api-response";
import dns from "dns";

const EXPECTED_CNAME = "proxy.ithinkshewifey.com";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const auth = await requirePaidAuth(slug);
    if (auth instanceof NextResponse) return auth;

    const site = await getSiteBySlug(slug);
    if (!site) return apiError("Site not found", 404);

    if (!site.customDomain) {
      return NextResponse.json({ configured: false });
    }

    if (!site.cloudflareHostnameId) {
      return NextResponse.json({ configured: false, domain: site.customDomain });
    }

    try {
      const cfStatus = await getCustomHostname(site.cloudflareHostnameId);
      const isActive = cfStatus.status === "active" && cfStatus.ssl?.status === "active";
      return NextResponse.json({
        configured: isActive,
        pending: !isActive,
        domain: site.customDomain,
        sslStatus: cfStatus.ssl?.status || cfStatus.status,
      });
    } catch (err) {
      console.error("[Domain] Cloudflare status check failed:", err);
      return NextResponse.json({
        configured: false,
        pending: true,
        domain: site.customDomain,
        error: "Unable to check domain status",
      });
    }
  } catch (error) {
    console.error("[API] GET Domain Error:", error);
    return apiError("Failed to check domain status");
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const auth = await requirePaidAuth(slug);
    if (auth instanceof NextResponse) return auth;

    const site = await getSiteBySlug(slug);
    if (!site) return apiError("Site not found", 404);

    if (!site.customDomain) {
      return apiError("Set a custom domain in your site settings first", 400);
    }

    if (site.domainVerifiedAt) {
      return apiError("Domain already configured. Contact support to change it.", 400);
    }

    if (site.cloudflareHostnameId) {
      return apiError("Domain registration already in progress. Check status instead.", 400);
    }

    // Check domain uniqueness
    const existingSite = await getSiteByDomain(site.customDomain);
    if (existingSite && existingSite.slug !== slug) {
      return apiError("This domain is already registered with another site.", 409);
    }

    // Verify DNS — check CNAME first, then fall back to A record resolution
    // (Cloudflare-proxied domains hide the CNAME and return A records instead)
    let dnsVerified = false;
    try {
      const records = await dns.promises.resolveCname(site.customDomain);
      dnsVerified = records.some(
        (r) => r.toLowerCase() === EXPECTED_CNAME
      );
    } catch {
      // CNAME not found — try resolving A records (proxied Cloudflare domains)
      try {
        const aRecords = await dns.promises.resolve4(site.customDomain);
        dnsVerified = aRecords.length > 0;
      } catch {
        // No DNS records at all
      }
    }

    if (!dnsVerified) {
      return apiError(
        `DNS not configured for ${site.customDomain}. Add a CNAME record pointing to ${EXPECTED_CNAME} at your domain registrar.`,
        400
      );
    }

    // Register with Cloudflare
    const cfResult = await createCustomHostname(site.customDomain);

    // Lock the domain
    await updateSite(slug, {
      cloudflareHostnameId: cfResult.id,
      domainVerifiedAt: new Date(),
    } as any);

    return apiOk({ domain: site.customDomain, cloudflareStatus: cfResult.status });
  } catch (error) {
    console.error("[API] POST Domain Error:", error);
    return apiError("Failed to register domain. Please try again later.");
  }
}
