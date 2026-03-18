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
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px 80px",
            maxWidth: "100%",
          }}
        >
          <div
            style={{
              fontSize: 28,
              color: "#8b7355",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              marginBottom: 24,
            }}
          >
            You&apos;re Invited
          </div>
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: "#2d2b25",
              textAlign: "center",
              lineHeight: 1.1,
              marginBottom: 32,
            }}
          >
            {site.partner1Name} & {site.partner2Name}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                width: 60,
                height: 1,
                backgroundColor: "#8b7355",
              }}
            />
            <div
              style={{
                fontSize: 24,
                color: "#5a5549",
                letterSpacing: "0.05em",
              }}
            >
              {site.dateDisplayText}
            </div>
            <div
              style={{
                width: 60,
                height: 1,
                backgroundColor: "#8b7355",
              }}
            />
          </div>
          <div
            style={{
              fontSize: 22,
              color: "#5a5549",
            }}
          >
            {site.locationText}
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 24,
            width: 40,
            height: 2,
            backgroundColor: "#c4b5a0",
            borderRadius: 1,
          }}
        />
      </div>
    ),
    { ...size }
  );
}
