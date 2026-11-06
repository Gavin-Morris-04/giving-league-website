"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import { LouisianaMap, stationSides, type Station } from "@/components/campuses/LouisianaMap";
import { buttonClass } from "@/components/ui/Button";
import { cities, universities } from "@/data/reference/geography";
import type { CityKey } from "@/lib/types";
import { cx } from "@/lib/format";

type Counts = Record<string, { local: number; statewide: number }>;

/** Grambling and Ruston are five miles apart; draw them as one station so dots don't overlap. */
const displayCity = (k: CityKey): CityKey => (k === "grambling" ? "ruston" : k);
const displayLabel = (k: CityKey) => (k === "ruston" ? "Ruston · Grambling" : cities[k].name);

/**
 * Homepage signature interaction: choose a campus (from the list, the select, or the map's index), see the
 * honest count of verified listings near it, and jump to the finder with the campus prefilled.
 */
export function CampusPicker({ counts }: { counts: Counts }) {
  const [campus, setCampus] = useState("lsu");
  const selected = universities.find((u) => u.slug === campus)!;
  const c = counts[campus] ?? { local: 0, statewide: 0 };

  const stations: Station[] = useMemo(() => {
    const byCity = new Map<CityKey, { label: string; max: number }>();
    for (const u of universities) {
      const n = counts[u.slug]?.local ?? 0;
      const key = displayCity(u.cityKey);
      const cur = byCity.get(key);
      byCity.set(key, { label: displayLabel(key), max: Math.max(cur?.max ?? 0, n) });
    }
    const top = Math.max(...[...byCity.values()].map((v) => v.max), 1);
    return [...byCity.entries()].map(([cityKey, v]) => ({
      cityKey,
      label: v.label,
      weight: v.max / top,
      side: stationSides[cityKey],
    }));
  }, [counts]);

  const grouped = useMemo(() => {
    const m = new Map<string, typeof universities>();
    for (const u of universities) m.set(u.city, [...(m.get(u.city) ?? []), u]);
    return [...m.entries()];
  }, []);

  return (
    <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-12">
      <div className="relative lg:col-span-7" data-reveal>
        <LouisianaMap stations={stations} activeCity={displayCity(selected.cityKey)} className="mx-auto max-w-[40rem]" />
        <p className="mt-3 text-center text-[0.8125rem] text-ink-muted">
          Station size reflects verified listings within about 55 miles. Not a list of partner schools.
        </p>
      </div>

      <div className="lg:col-span-5" data-reveal>
        <label htmlFor="campus-picker" className="text-label text-gold-ink">
          Choose your university
        </label>
        <select id="campus-picker" className="field mt-3 text-lg font-semibold" value={campus} onChange={(e) => setCampus(e.target.value)}>
          {grouped.map(([city, list]) => (
            <optgroup key={city} label={city}>
              {list.map((u) => (
                <option key={u.slug} value={u.slug}>
                  {u.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>

        <div className="mt-6 rounded-md border border-hairline bg-paper p-6" aria-live="polite">
          <p className="flex items-center gap-2 text-[0.9375rem] font-semibold text-ink">
            <MapPin aria-hidden className="size-4 text-forest" />
            {selected.city}
          </p>
          <p className="mt-3 font-display text-[2.75rem] leading-none font-semibold tracking-tight text-navy tabular [font-variation-settings:'wdth'_90]">
            {c.local + c.statewide}
          </p>
          <p className="mt-2 text-ink-muted">
            verified ways to volunteer near {selected.shortName}
            <span className="block text-[0.875rem]">
              {c.local} local · {c.statewide} statewide
            </span>
          </p>
          <Link href={`/volunteer?campus=${selected.slug}`} className={buttonClass({ variant: "primary", size: "lg", className: "mt-6 w-full" })}>
            Find Volunteer Opportunities
          </Link>
          {c.local === 0 ? (
            <p className="mt-4 text-[0.875rem] text-ink-muted">
              We haven&apos;t verified local listings here yet.{" "}
              <Link href="/volunteer/submit" className="link">
                Know one? Submit it.
              </Link>
            </p>
          ) : null}
        </div>

        <div className="mt-8">
          <p className="text-label text-ink-muted">Or jump to a campus</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {universities.map((u) => (
              <li key={u.slug}>
                <button
                  type="button"
                  onClick={() => setCampus(u.slug)}
                  aria-pressed={campus === u.slug}
                  className={cx(
                    "min-h-10 rounded-sm border px-3 text-[0.875rem] font-medium transition-colors",
                    campus === u.slug
                      ? "border-forest bg-forest text-white"
                      : "border-hairline-strong bg-paper text-ink hover:border-ink",
                  )}
                >
                  {u.shortName}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
