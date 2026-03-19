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
  const initials = `${initial1}&${initial2}`;

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
          backgroundColor: "#faf1e1",
          fontFamily: "serif",
        }}
      >
        {/* Logo box with initials */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 300,
            height: 300,
            borderRadius: 56,
            backgroundColor: "#2d2b25",
          }}
        >
          <span
            style={{
              fontSize: 96,
              fontWeight: 700,
              fontStyle: "italic",
              color: "#faf1e1",
            }}
          >
            {initials}
          </span>
        </div>

        {/* Couple names */}
        <div
          style={{
            fontSize: 28,
            color: "#2d2b25",
            letterSpacing: "8px",
            textTransform: "uppercase",
            marginTop: 40,
            display: "flex",
          }}
        >
          {site.partner1Name} & {site.partner2Name}
        </div>

        {/* Date */}
        {site.dateDisplayText && (
          <div
            style={{
              fontSize: 20,
              color: "#8b7355",
              marginTop: 12,
              display: "flex",
            }}
          >
            {site.dateDisplayText}
          </div>
        )}
      </div>
    ),
    { ...size }
  );
}
