import { ImageResponse } from "next/og";
import { getSiteBySlug } from "@/lib/data/sites";
import { ogImageUrl, generateAndUploadOgImage, resolveOgColors } from "@/lib/og-image";
import { R2_PUBLIC_URL } from "@/lib/r2";
import { getOgFont, ogFontConfig } from "@/lib/og-font";

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

  const style = site.ogStyle ?? "light";

  // Try to serve from R2 (proxy, not redirect — scrapers don't follow redirects)
  if (R2_PUBLIC_URL) {
    const r2Url = ogImageUrl(slug, style);
    try {
      const res = await fetch(r2Url);
      if (res.ok) {
        return new Response(res.body, {
          headers: {
            "Content-Type": "image/png",
            "Cache-Control": "public, max-age=86400",
          },
        });
      }
    } catch {
      // Fall through
    }
  }

  const i1 = (site.partner1Name || "A").charAt(0).toUpperCase();
  const i2 = (site.partner2Name || "B").charAt(0).toUpperCase();
  const fontData = await getOgFont();
  const { bg, fg } = resolveOgColors(site);

  const response = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: bg,
          fontFamily: "'Playfair Display', serif",
        }}
      >
        <span
          style={{
            fontSize: 140,
            fontWeight: 700,
            fontStyle: "italic",
            color: fg,
          }}
        >
          {i1} & {i2}
        </span>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: ogFontConfig.name, data: fontData, style: ogFontConfig.style, weight: ogFontConfig.weight }],
    }
  );

  // Upload both variants to R2 in background for next time
  if (R2_PUBLIC_URL) {
    generateAndUploadOgImage(site).catch(() => {});
  }

  return response;
}
