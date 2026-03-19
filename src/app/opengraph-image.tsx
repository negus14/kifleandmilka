import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "I Think She Wifey — Wedding Website Builder";
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
          }}
        >
          {/* Logo */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: 12,
              backgroundColor: "#2d2b25",
              marginBottom: 32,
            }}
          >
            <span
              style={{
                fontSize: 20,
                fontWeight: 700,
                fontStyle: "italic",
                color: "#faf1e1",
                letterSpacing: "0.05em",
              }}
            >
              ITSW
            </span>
          </div>
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              fontStyle: "italic",
              color: "#2d2b25",
              textAlign: "center",
              lineHeight: 1.1,
              marginBottom: 24,
            }}
          >
            I Think She Wifey
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 24,
            }}
          >
            <div style={{ width: 60, height: 1, backgroundColor: "#8b7355" }} />
            <div
              style={{
                fontSize: 20,
                color: "#8b7355",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}
            >
              Wedding Website Builder
            </div>
            <div style={{ width: 60, height: 1, backgroundColor: "#8b7355" }} />
          </div>
          <div
            style={{
              fontSize: 22,
              color: "#5a5549",
              textAlign: "center",
              maxWidth: 600,
              lineHeight: 1.5,
            }}
          >
            Create a fully customisable wedding website in minutes
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
