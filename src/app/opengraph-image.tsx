import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Omar Shady – Director & Photographer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#050505",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          padding: "80px",
          position: "relative",
        }}
      >
        {/* Background image */}
        <img
          src="https://omarshadyy.vercel.app/hero.jpeg"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
          }}
        />

        {/* Dark gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.5) 100%)",
          }}
        />

        {/* Text content */}
        <div style={{ position: "relative", zIndex: 10 }}>
          <div
            style={{
              fontSize: 18,
              letterSpacing: "0.3em",
              color: "rgba(255,255,255,0.5)",
              textTransform: "uppercase",
              marginBottom: 16,
              fontFamily: "serif",
            }}
          >
            Director &amp; Photographer
          </div>
          <div
            style={{
              fontSize: 80,
              fontWeight: 700,
              color: "white",
              lineHeight: 1,
              fontFamily: "serif",
              marginBottom: 24,
            }}
          >
            Omar Shady
          </div>
          <div
            style={{
              fontSize: 20,
              color: "rgba(255,255,255,0.6)",
              fontWeight: 300,
              fontFamily: "sans-serif",
              maxWidth: 600,
            }}
          >
            Cinematic filmmaker, photographer and creative director — crafting visual stories worldwide.
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
