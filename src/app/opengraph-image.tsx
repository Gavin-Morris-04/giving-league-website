import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/config/site";

export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const emblem = await readFile(join(process.cwd(), "src/assets/brand/cause-krewe-emblem.png"));
  const src = `data:image/png;base64,${emblem.toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", gap: 64, background: "#0B3033", padding: 72, color: "#FBE9CB" }}>
        <img src={src} width={420} height={420} alt="" />
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ fontSize: 34, color: "#D9A043", letterSpacing: 2, textTransform: "uppercase" }}>{site.name}</div>
          <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1, letterSpacing: -2, marginTop: 20 }}>Good Starts With You.</div>
          <div style={{ fontSize: 32, marginTop: 28, color: "#A9C2BF", lineHeight: 1.3 }}>
            Volunteer opportunities, charity events and ways to give for Louisiana high school and college students.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
