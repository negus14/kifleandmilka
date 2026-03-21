import { PutObjectCommand } from "@aws-sdk/client-s3";
import { ImageResponse } from "next/og";
import { r2, R2_BUCKET, R2_PUBLIC_URL } from "./r2";
import type { WeddingSite } from "./types/wedding-site";
import { getOgFont, ogFontConfig } from "./og-font";
import { getTheme } from "./themes";

export function ogImageKey(slug: string, style: "light" | "dark" = "light"): string {
  return `sites/${slug}/og-image-${style}-v4.png`;
}

export function ogImageUrl(slug: string, style: "light" | "dark" = "light"): string {
  return `${R2_PUBLIC_URL}/${ogImageKey(slug, style)}`;
}

/**
 * Resolves the OG image background and foreground colors
 * from the site's theme + custom overrides.
 */
export function resolveOgColors(site: WeddingSite, style?: "light" | "dark"): { bg: string; fg: string } {
  const theme = getTheme(site.templateId);
  const colors = { ...theme.colors, ...site.customColors };
  const mode = style ?? site.ogStyle ?? "light";
  return mode === "dark"
    ? { bg: colors.dark, fg: colors.primary }
    : { bg: colors.primary, fg: colors.dark };
}

function buildOgJsx(initials: string, bg: string, fg: string) {
  return (
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
        {initials}
      </span>
    </div>
  );
}

async function uploadOgVariant(
  site: WeddingSite,
  style: "light" | "dark",
  fontData: ArrayBuffer,
): Promise<void> {
  if (!r2 || !R2_BUCKET) return;

  const i1 = (site.partner1Name || "A").charAt(0).toUpperCase();
  const i2 = (site.partner2Name || "B").charAt(0).toUpperCase();
  const { bg, fg } = resolveOgColors(site, style);

  const response = new ImageResponse(
    buildOgJsx(`${i1} & ${i2}`, bg, fg),
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
      Key: ogImageKey(site.slug, style),
      Body: new Uint8Array(arrayBuffer),
      ContentType: "image/png",
      CacheControl: "public, max-age=31536000, immutable",
    })
  );
}

export async function generateAndUploadOgImage(site: WeddingSite): Promise<string | null> {
  if (!r2 || !R2_BUCKET || !R2_PUBLIC_URL) return null;

  const fontData = await getOgFont();

  // Generate both light and dark variants
  await Promise.all([
    uploadOgVariant(site, "light", fontData),
    uploadOgVariant(site, "dark", fontData),
  ]);

  const style = site.ogStyle ?? "light";
  return ogImageUrl(site.slug, style);
}
