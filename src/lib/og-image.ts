import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2, R2_BUCKET, R2_PUBLIC_URL } from "./r2";
import type { WeddingSite } from "./types/wedding-site";
import sharp from "sharp";

function generateOgSvg(site: WeddingSite): string {
  const i1 = (site.partner1Name || "A").charAt(0).toUpperCase();
  const i2 = (site.partner2Name || "B").charAt(0).toUpperCase();

  return `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#2d2b25"/>
  <text x="600" y="340" text-anchor="middle" font-family="Georgia, serif" font-size="120" font-weight="bold" font-style="italic" fill="#faf1e1">${i1} &amp; ${i2}</text>
</svg>`;
}

export function ogImageKey(slug: string): string {
  return `sites/${slug}/og-image.png`;
}

export function ogImageUrl(slug: string): string {
  return `${R2_PUBLIC_URL}/${ogImageKey(slug)}`;
}

export async function generateAndUploadOgImage(site: WeddingSite): Promise<string | null> {
  if (!r2 || !R2_BUCKET || !R2_PUBLIC_URL) return null;

  const svg = generateOgSvg(site);
  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();

  await r2.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: ogImageKey(site.slug),
      Body: pngBuffer,
      ContentType: "image/png",
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  return ogImageUrl(site.slug);
}
