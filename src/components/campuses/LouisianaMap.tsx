import { cities } from "@/data/reference/geography";
import type { CityKey } from "@/lib/types";
import { cx } from "@/lib/format";

/**
 * Schematic Louisiana outline with campus-city stations plotted from real coordinates.
 * Purely visual: every station is also available as a real control in the index list beside it.
 */
const BOUNDS = { minLng: -94.15, maxLng: -88.85, minLat: 28.85, maxLat: 33.1 };
const K = Math.cos((31 * Math.PI) / 180);
const S = 100;
export const MAP_W = (BOUNDS.maxLng - BOUNDS.minLng) * K * S;
export const MAP_H = (BOUNDS.maxLat - BOUNDS.minLat) * S;

export function project(lng: number, lat: number) {
  return { x: (lng - BOUNDS.minLng) * K * S, y: (BOUNDS.maxLat - lat) * S };
}

const OUTLINE: [number, number][] = [
  [-94.043, 33.019], [-91.166, 33.004], [-91.13, 32.85], [-91.07, 32.6], [-90.95, 32.35], [-91.08, 32.1],
  [-91.35, 31.88], [-91.5, 31.6], [-91.52, 31.27], [-91.636, 31.0], [-89.73, 31.0], [-89.75, 30.75],
  [-89.68, 30.45], [-89.6, 30.18], [-89.45, 30.1], [-89.22, 30.02], [-89.4, 29.78], [-89.28, 29.56],
  [-89.55, 29.42], [-89.2, 29.3], [-89.02, 29.18], [-89.1, 29.0], [-89.4, 28.93], [-89.5, 29.15],
  [-89.8, 29.3], [-90.05, 29.15], [-90.25, 29.08], [-90.45, 29.25], [-90.75, 29.06], [-91.1, 29.2],
  [-91.3, 29.3], [-91.55, 29.52], [-91.85, 29.48], [-92.25, 29.55], [-92.6, 29.6], [-93.2, 29.77],
  [-93.84, 29.69], [-93.8, 29.98], [-93.72, 30.3], [-93.55, 30.6], [-93.55, 31.0], [-93.65, 31.25],
  [-93.82, 31.55], [-94.04, 31.99],
];

const LAKE: [number, number][] = [
  [-90.45, 30.22], [-90.3, 30.32], [-90.05, 30.37], [-89.85, 30.28], [-89.8, 30.18], [-89.95, 30.07],
  [-90.2, 30.04], [-90.4, 30.1],
];

const toPath = (pts: [number, number][]) =>
  pts
    .map(([lng, lat], i) => {
      const { x, y } = project(lng, lat);
      return `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ") + " Z";

export type Station = {
  cityKey: CityKey;
  label: string;
  /** 0..1 — scales the dot radius (dot size carries hierarchy: verified listings nearby). */
  weight: number;
  /** Label placement relative to the dot. */
  side?: "left" | "right" | "top" | "bottom";
};

export function LouisianaMap({
  stations,
  activeCity,
  tone = "light",
  className,
  title = "Map of Louisiana showing campus cities in our search area",
  showLabels = true,
}: {
  stations: Station[];
  activeCity?: CityKey | null;
  tone?: "light" | "dark";
  className?: string;
  title?: string;
  showLabels?: boolean;
}) {
  const dark = tone === "dark";
  return (
    <svg viewBox={`-20 -10 ${MAP_W + 40} ${MAP_H + 20}`} className={cx("h-auto w-full", className)} role="img" aria-label={title}>
      <path
        d={toPath(OUTLINE)}
        fill={dark ? "var(--color-navy-deep)" : "var(--color-paper)"}
        stroke={dark ? "var(--color-navy-line)" : "var(--color-hairline-strong)"}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d={toPath(LAKE)} fill={dark ? "var(--color-navy)" : "var(--color-sand)"} stroke="none" />

      {/* Route: connect stations north→south as one line */}
      <path
        d={stations
          .slice()
          .sort((a, b) => cities[b.cityKey].lat - cities[a.cityKey].lat)
          .map((s, i) => {
            const c = cities[s.cityKey];
            const { x, y } = project(c.lng, c.lat);
            return `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`;
          })
          .join(" ")}
        fill="none"
        stroke={dark ? "var(--color-gold)" : "var(--color-forest)"}
        strokeOpacity="0.35"
        strokeWidth="1.5"
        strokeDasharray="4 5"
      />

      {stations.map((s) => {
        const c = cities[s.cityKey];
        const { x, y } = project(c.lng, c.lat);
        const active = activeCity === s.cityKey;
        const r = 5 + s.weight * 7;
        const side = s.side ?? "right";
        const lx = side === "left" ? x - r - 6 : side === "right" ? x + r + 6 : x;
        const ly = side === "top" ? y - r - 7 : side === "bottom" ? y + r + 15 : y + 4.5;
        const anchor = side === "left" ? "end" : side === "right" ? "start" : "middle";
        return (
          <g key={s.cityKey}>
            {active ? (
              <circle cx={x} cy={y} r={r + 7} fill="none" stroke="var(--color-gold)" strokeWidth="2" opacity="0.9" />
            ) : null}
            <circle
              cx={x}
              cy={y}
              r={r}
              fill={active ? "var(--color-gold)" : dark ? "var(--color-navy)" : "var(--color-ivory)"}
              stroke={dark ? "var(--color-gold)" : "var(--color-forest)"}
              strokeWidth="2.5"
            />
            {showLabels ? (
              <text
                x={lx}
                y={ly}
                textAnchor={anchor}
                fontSize="13"
                fontWeight={active ? 700 : 600}
                fill={dark ? "var(--color-ivory)" : "var(--color-ink)"}
                style={{ fontFamily: "var(--font-sans)", paintOrder: "stroke" }}
                stroke={dark ? "var(--color-navy-deep)" : "var(--color-paper)"}
                strokeWidth="4"
                strokeLinejoin="round"
              >
                {s.label}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

/** Label sides chosen so nearby stations don't collide. */
export const stationSides: Partial<Record<CityKey, Station["side"]>> = {
  grambling: "left",
  ruston: "top",
  monroe: "right",
  natchitoches: "left",
  "lake-charles": "top",
  lafayette: "top",
  "baton-rouge": "top",
  hammond: "right",
  thibodaux: "left",
  "new-orleans": "bottom",
};
