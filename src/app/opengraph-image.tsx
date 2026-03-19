import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "ITSW — Wedding Website Builder";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
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
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 180,
            height: 180,
            borderRadius: 36,
            backgroundColor: "#2d2b25",
            border: "3px solid #faf1e1",
          }}
        >
          <span
            style={{
              fontSize: 56,
              fontWeight: 700,
              fontStyle: "italic",
              color: "#faf1e1",
              fontFamily: "serif",
              letterSpacing: "0.05em",
            }}
          >
            ITSW
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
