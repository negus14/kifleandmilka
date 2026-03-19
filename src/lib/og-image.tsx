import { PutObjectCommand } from "@aws-sdk/client-s3";
import { ImageResponse } from "next/og";
import { r2, R2_BUCKET, R2_PUBLIC_URL } from "./r2";
import type { WeddingSite } from "./types/wedding-site";
import { getOgFont, ogFontConfig } from "./og-font";

export function ogImageKey(slug: string): string {
  return `sites/${slug}/og-image.png`;
}

export function ogImageUrl(slug: string): string {
  return `${R2_PUBLIC_URL}/${ogImageKey(slug)}`;
}

export async function generateAndUploadOgImage(site: WeddingSite): Promise<string | null> {
  if (!r2 || !R2_BUCKET || !R2_PUBLIC_URL) return null;

  const i1 = (site.partner1Name || "A").charAt(0).toUpperCase();
  const i2 = (site.partner2Name || "B").charAt(0).toUpperCase();
  const fontData = await getOgFont();

  const response = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#2d2b25",
          fontFamily: "'Playfair Display', serif",
        }}
      >
        <span
          style={{
            fontSize: 140,
            fontWeight: 700,
            fontStyle: "italic",
            color: "#faf1e1",
          }}
        >
          {i1} & {i2}
        </span>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [{ name: ogFontConfig.name, data: fontData, style: ogFontConfig.style, weight: ogFontConfig.weight }],
    }
  );

  const arrayBuffer = await response.arrayBuffer();

  await r2.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: ogImageKey(site.slug),
      Body: new Uint8Array(arrayBuffer),
      ContentType: "image/png",
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  return ogImageUrl(site.slug);
}
