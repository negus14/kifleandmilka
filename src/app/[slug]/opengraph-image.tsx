import { getSiteBySlug } from "@/lib/data/sites";
import { ogImageUrl, generateAndUploadOgImage } from "@/lib/og-image";
import { R2_PUBLIC_URL } from "@/lib/r2";
import sharp from "sharp";

export const runtime = "nodejs";
export const alt = "Wedding invitation preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (slug.includes(".") || !/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
    return new Response("Not found", { status: 404 });
  }

  const site = await getSiteBySlug(slug);
  if (!site || !site.isPublished) {
    return new Response("Not found", { status: 404 });
  }

  // Try to serve from R2
  if (R2_PUBLIC_URL) {
    const r2Url = ogImageUrl(slug);
    try {
      const res = await fetch(r2Url, { method: "HEAD" });
      if (res.ok) {
        return Response.redirect(r2Url, 302);
      }
    } catch {
      // Fall through
    }

    // Generate, upload to R2, and serve
    generateAndUploadOgImage(site).catch(() => {});
  }

  // Generate inline with sharp (same style as R2 version)
  const i1 = (site.partner1Name || "A").charAt(0).toUpperCase();
  const i2 = (site.partner2Name || "B").charAt(0).toUpperCase();

  const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#2d2b25"/>
  <text x="600" y="340" text-anchor="middle" font-family="Georgia, serif" font-size="120" font-weight="bold" font-style="italic" fill="#faf1e1">${i1} &amp; ${i2}</text>
</svg>`;

  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();

  return new Response(new Uint8Array(pngBuffer), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
