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
        }}
      >
        <div
          style={{
            fontSize: 120,
            fontWeight: 700,
            fontStyle: "italic",
            color: "#faf1e1",
            display: "flex",
          }}
        >
          {initial1} & {initial2}
        </div>
      </div>
    ),
    { ...size }
  );
}
