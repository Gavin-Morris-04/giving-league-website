"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useId, useMemo, useState } from "react";
import { RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";
import { Segmented } from "@/components/directory/FilterControls";
import { buttonClass } from "@/components/ui/Button";
import { causes, cities, regions } from "@/data/reference/geography";
import { charityEvents } from "@/data/verified/charity-events";
import { defaultEventFilters, eventTypeLabels, filterEvents, MONTHS, type EventFilters } from "@/lib/charity-events";
import { cx } from "@/lib/format";
import type { CharityEventType } from "@/lib/types";
import { useToday } from "@/lib/use-today";
import { CharityEventCard } from "./CharityEventCard";

const KEYS = ["q", "city", "region", "month", "cause", "type", "level", "cost", "timing"] as const;

function read(sp: URLSearchParams): EventFilters {
  const f = { ...defaultEventFilters };
  for (const k of KEYS) {
    const v = sp.get(k);
    if (v) (f as Record<string, string>)[k] = v;
  }
  if (!["any", "high_school", "college"].includes(f.level)) f.level = "any";
  if (!["any", "free", "paid"].includes(f.cost)) f.cost = "any";
  if (!["any", "upcoming", "awaiting"].includes(f.timing)) f.timing = "any";
  return f;
}

export function EventsDirectory() {
  const sp = useSearchParams();
  const [f, setF] = useState<EventFilters>(() => read(new URLSearchParams(sp.toString())));
  const [open, setOpen] = useState(false);
  const today = useToday();
  const ids = useId();

  useEffect(() => {
    const q = new URLSearchParams();
    for (const k of KEYS) if (f[k] && f[k] !== (defaultEventFilters as Record<string, string>)[k]) q.set(k, String(f[k]));
    const qs = q.toString();
    const url = qs ? `${location.pathname}?${qs}` : location.pathname;
    if (url !== `${location.pathname}${location.search}`) history.replaceState(null, "", url);
  }, [f]);

  const set = <K extends keyof EventFilters>(k: K, v: EventFilters[K]) => setF((s) => ({ ...s, [k]: v }));
  const results = useMemo(() => filterEvents(charityEvents, f, today), [f, today]);
  const types = useMemo(() => [...new Set(charityEvents.map((e) => e.type))] as CharityEventType[], []);
  const eventCities = useMemo(() => [...new Set(charityEvents.map((e) => e.cityKey))].map((k) => cities[k]), []);
  const eventCauses = useMemo(() => [...new Set(charityEvents.map((e) => e.cause))], []);
  const active = KEYS.filter((k) => k !== "q" && f[k] !== defaultEventFilters[k]).length;

  const chipLabel: Partial<Record<keyof EventFilters, string>> = {
    city: f.city ? (f.city === "statewide" ? "Statewide" : cities[f.city as keyof typeof cities]?.name) : undefined,
    region: f.region ? regions[f.region as keyof typeof regions] : undefined,
    month: f.month ? MONTHS[Number(f.month) - 1] : undefined,
    cause: f.cause ? causes[f.cause as keyof typeof causes]?.label : undefined,
    type: f.type ? eventTypeLabels[f.type as CharityEventType] : undefined,
    level: f.level !== "any" ? (f.level === "high_school" ? "High school students" : "College students") : undefined,
    cost: f.cost !== "any" ? (f.cost === "free" ? "Free" : "Registration fee") : undefined,
    timing: f.timing !== "any" ? (f.timing === "upcoming" ? "Upcoming dates" : "Awaiting next date") : undefined,
  };

  const select = (key: keyof EventFilters, label: string, options: { value: string; label: string }[], all: string) => (
    <div>
      <label htmlFor={`${ids}-${key}`} className="text-label mb-2.5 block text-ink-muted">
        {label}
      </label>
      <select id={`${ids}-${key}`} className="field" value={String(f[key])} onChange={(e) => set(key, e.target.value as never)}>
        <option value="">{all}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );

  const panel = (
    <div className="grid gap-7">
      <Segmented
        legend="When"
        name={`${ids}-timing`}
        value={f.timing}
        onChange={(v) => set("timing", v)}
        options={[
          { value: "any", label: "All" },
          { value: "upcoming", label: "Upcoming dates" },
          { value: "awaiting", label: "Annual · next date TBA" },
        ]}
      />
      <Segmented
        legend="I'm a"
        name={`${ids}-level`}
        value={f.level}
        onChange={(v) => set("level", v)}
        options={[
          { value: "any", label: "Any student" },
          { value: "high_school", label: "High school student" },
          { value: "college", label: "College student" },
        ]}
      />
      {select("month", "Month", MONTHS.map((m, i) => ({ value: String(i + 1), label: m })), "Any month")}
      {select("region", "Region", Object.entries(regions).filter(([k]) => k !== "statewide").map(([value, label]) => ({ value, label })), "All regions")}
      {select("city", "City", eventCities.map((c) => ({ value: c.key, label: c.key === "statewide" ? "Statewide only" : c.name })), "All cities")}
      {select("cause", "Cause", eventCauses.map((c) => ({ value: c, label: causes[c].label })), "All causes")}
      {select("type", "Event type", types.map((t) => ({ value: t, label: eventTypeLabels[t] })), "All event types")}
      <Segmented
        legend="Cost to take part"
        name={`${ids}-cost`}
        value={f.cost}
        onChange={(v) => set("cost", v)}
        options={[
          { value: "any", label: "Any" },
          { value: "free", label: "Free" },
          { value: "paid", label: "Registration fee" },
        ]}
      />
      {active ? (
        <button type="button" onClick={() => setF((s) => ({ ...defaultEventFilters, q: s.q }))} className="link inline-flex min-h-11 items-center gap-2 justify-self-start font-semibold">
          <RotateCcw aria-hidden className="size-4" />
          Clear {active} filter{active === 1 ? "" : "s"}
        </button>
      ) : null}
    </div>
  );

  return (
    <div>
      <div role="search" className="relative rounded-md border border-hairline bg-paper p-3 shadow-[0_20px_50px_-30px_rgb(11_48_51/0.45)] sm:p-4">
        <label htmlFor={`${ids}-q`} className="sr-only">
          Search charity events
        </label>
        <Search aria-hidden className="pointer-events-none absolute top-1/2 left-7 size-5 -translate-y-1/2 text-ink-muted sm:left-8" />
        <input
          id={`${ids}-q`}
          type="search"
          value={f.q}
          onChange={(e) => set("q", e.target.value)}
          placeholder="Search walks, toy drives, cleanups, hosts…"
          className="field pl-11! text-[1.0625rem]"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          enterKeyHint="search"
        />
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-12">
        <aside className="lg:col-span-4 xl:col-span-3" aria-label="Event filters">
          <button
            type="button"
            className={buttonClass({ variant: "secondary", className: "w-full lg:hidden" })}
            aria-expanded={open}
            aria-controls={`${ids}-panel`}
            onClick={() => setOpen((v) => !v)}
          >
            <SlidersHorizontal aria-hidden className="size-4" />
            {open ? "Hide filters" : "Filters"}
            {active ? <span className="rounded-sm bg-forest px-1.5 py-0.5 text-[0.75rem] text-white">{active}</span> : null}
          </button>
          <div id={`${ids}-panel`} className={cx("mt-6 lg:mt-0 lg:block", open ? "block" : "hidden")}>
            <div className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
              <p className="text-h3 mb-6 hidden text-navy lg:block">Refine</p>
              {panel}
            </div>
          </div>
        </aside>

        <div className="min-w-0 lg:col-span-8 xl:col-span-9">
          <p className="text-[1.0625rem] text-ink" aria-live="polite" aria-atomic="true">
            <span className="font-semibold tabular">{results.length}</span> {results.length === 1 ? "event" : "events"}
          </p>
          {active ? (
            <ul className="mt-4 flex flex-wrap gap-2" aria-label="Active filters">
              {(Object.entries(chipLabel) as [keyof EventFilters, string | undefined][])
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <li key={k}>
                    <button
                      type="button"
                      onClick={() => set(k, defaultEventFilters[k] as never)}
                      className="inline-flex min-h-9 items-center gap-1.5 rounded-sm bg-navy px-2.5 text-[0.8125rem] font-medium text-ivory hover:bg-navy-deep"
                    >
                      {v}
                      <X aria-hidden className="size-3.5" />
                      <span className="sr-only">Remove filter</span>
                    </button>
                  </li>
                ))}
            </ul>
          ) : null}
          {results.length ? (
            <ul className="mt-6 grid gap-5 md:grid-cols-2">
              {results.map((e) => (
                <li key={e.slug}>
                  <CharityEventCard e={e} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-6 rounded-md border border-dashed border-hairline-strong bg-paper/60 px-6 py-12 text-center sm:px-12">
              <p className="text-h3 text-navy">No events match those filters yet.</p>
              <p className="mx-auto mt-3 max-w-md text-ink-muted">
                {f.level === "high_school"
                  ? "Few organizers publish age rules for events, so we only show high school students events where they do. Try all students, or check with an organizer directly."
                  : "Try removing a filter or searching a broader word. We add events only after checking the organizer's official site."}
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <button type="button" onClick={() => setF({ ...defaultEventFilters })} className={buttonClass({ variant: "primary" })}>
                  Show all events
                </button>
                <Link href="/events/submit" className={buttonClass({ variant: "secondary" })}>
                  Submit a charity event
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function EventsDirectorySkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading charity events">
      <div className="h-[4.5rem] animate-pulse rounded-md border border-hairline bg-paper" />
      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:ml-[33%]">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-72 animate-pulse rounded-md border border-hairline bg-paper" />
        ))}
      </div>
    </div>
  );
}
