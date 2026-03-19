import { ImageResponse } from "next/og";
import { getSiteBySlug } from "@/lib/data/sites";

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

  const initial1 = (site.partner1Name || "A").charAt(0).toUpperCase();
  const initial2 = (site.partner2Name || "B").charAt(0).toUpperCase();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#2d2b25",
          fontFamily: "serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative corner accents */}
        <div style={{ position: "absolute", top: 24, left: 24, width: 80, height: 80, borderTop: "2px solid #8b7355", borderLeft: "2px solid #8b7355", display: "flex" }} />
        <div style={{ position: "absolute", top: 24, right: 24, width: 80, height: 80, borderTop: "2px solid #8b7355", borderRight: "2px solid #8b7355", display: "flex" }} />
        <div style={{ position: "absolute", bottom: 24, left: 24, width: 80, height: 80, borderBottom: "2px solid #8b7355", borderLeft: "2px solid #8b7355", display: "flex" }} />
        <div style={{ position: "absolute", bottom: 24, right: 24, width: 80, height: 80, borderBottom: "2px solid #8b7355", borderRight: "2px solid #8b7355", display: "flex" }} />

        {/* Large initials monogram */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            marginBottom: 32,
          }}
        >
          <div style={{ fontSize: 160, fontWeight: 300, color: "#faf1e1", lineHeight: 1, fontStyle: "italic", letterSpacing: "-0.02em", display: "flex" }}>
            {initial1}
          </div>
          <div style={{ fontSize: 60, color: "#8b7355", fontStyle: "italic", lineHeight: 1, marginTop: 20, display: "flex" }}>
            &
          </div>
          <div style={{ fontSize: 160, fontWeight: 300, color: "#faf1e1", lineHeight: 1, fontStyle: "italic", letterSpacing: "-0.02em", display: "flex" }}>
            {initial2}
          </div>
        </div>

        {/* Decorative line */}
        <div style={{ width: 80, height: 1, backgroundColor: "#8b7355", marginBottom: 20, display: "flex" }} />

        {/* Full names */}
        <div style={{ fontSize: 28, color: "#c4b5a0", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12, display: "flex" }}>
          {site.partner1Name} & {site.partner2Name}
        </div>

        {/* Date and location */}
        <div style={{ fontSize: 18, color: "#8b7355", letterSpacing: "0.05em", display: "flex" }}>
          {site.dateDisplayText}{site.locationText ? ` — ${site.locationText}` : ""}
        </div>

        {/* ITSW branding */}
        <div style={{ position: "absolute", bottom: 28, fontSize: 10, color: "#5a5549", letterSpacing: "0.3em", textTransform: "uppercase", display: "flex" }}>
          ithinkshewifey.com
        </div>
      </div>
    ),
    { ...size }
  );
}
