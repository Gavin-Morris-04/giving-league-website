import { ImageResponse } from "next/og";
import { site } from "@/config/site";

export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  const stops = Array.from({ length: 10 });
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#122A3A", padding: 72, color: "#F8F6F0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg width="56" height="56" viewBox="0 0 32 32">
            <path d="M6 24 H15 L26 9" fill="none" stroke="#D5A653" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="6" cy="24" r="4" fill="#F8F6F0" />
            <circle cx="26" cy="9" r="4" fill="#F8F6F0" />
            <circle cx="15" cy="24" r="2.25" fill="#D5A653" />
          </svg>
          <div style={{ fontSize: 36, fontWeight: 700 }}>{site.name}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 96, fontWeight: 800, lineHeight: 1, letterSpacing: -3 }}>Good Starts With You.</div>
          <div style={{ fontSize: 34, marginTop: 24, color: "#A9B7BE" }}>{site.tagline}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", position: "relative", height: 24 }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 11, height: 3, background: "#D5A653" }} />
          <div style={{ display: "flex", width: "100%", justifyContent: "space-between" }}>
            {stops.map((_, i) => (
              <div key={i} style={{ width: i === 6 ? 24 : 18, height: i === 6 ? 24 : 18, borderRadius: 999, border: "3px solid #D5A653", background: i === 6 ? "#D5A653" : "#0C1E2A" }} />
            ))}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
