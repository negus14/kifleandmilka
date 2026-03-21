import { ImageResponse } from "next/og";
import { getOgFont, ogFontConfig } from "@/lib/og-font";

export const runtime = "nodejs";
export const alt = "ITSW — Wedding Website Builder";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  const fontData = await getOgFont();

  return new ImageResponse(
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
          ITSW
        </span>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: ogFontConfig.name, data: fontData, style: ogFontConfig.style, weight: ogFontConfig.weight }],
    }
  );
}
