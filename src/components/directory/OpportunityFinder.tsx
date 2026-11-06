"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";
import { causes, cities, getUniversity, universities } from "@/data/reference/geography";
import {
  citiesWithListings,
  defaultFilters,
  distanceFromCampus,
  filterOpportunities,
  hiddenAsUnverified,
  opportunities,
  orgName,
  type DirectoryFilters,
} from "@/lib/directory";
import type { Cause } from "@/lib/types";
import { cx } from "@/lib/format";
import { buttonClass } from "@/components/ui/Button";
import { Segmented } from "./FilterControls";
import { OpportunityCard, OpportunityCardSkeleton } from "./OpportunityCard";

const causeKeys = Object.keys(causes) as Cause[];

function readParams(sp: URLSearchParams): DirectoryFilters {
  const pick = <T extends string>(key: string, allowed: readonly T[], fallback: T): T => {
    const v = sp.get(key) as T | null;
    return v && allowed.includes(v) ? v : fallback;
  };
  const campus = sp.get("campus") ?? "";
  return {
    q: sp.get("q") ?? "",
    campus: getUniversity(campus) ? campus : "",
    city: sp.get("city") && cities[sp.get("city") as keyof typeof cities] ? (sp.get("city") as string) : "",
    causes: (sp.get("cause") ?? "").split(",").filter((c): c is Cause => causeKeys.includes(c as Cause)),
    group: pick("group", ["any", "individuals", "groups"] as const, "any"),
    frequency: pick("when", ["any", "one_time", "recurring"] as const, "any"),
    format: pick("format", ["any", "in_person", "remote", "hybrid"] as const, "any"),
    level: pick("level", ["any", "high_school", "college"] as const, "any"),
    age: pick("age", ["any", "14", "16", "18"] as const, "any"),
    guardian: pick("guardian", ["any", "required", "not_required"] as const, "any"),
    includeUnverified: sp.get("unverified") === "1",
    days: pick("days", ["any", "weekdays", "weekends"] as const, "any"),
    serviceHours: sp.get("hours") === "1",
    sort: pick("sort", ["nearest", "az", "verified"] as const, "nearest"),
  };
}

function writeParams(f: DirectoryFilters) {
  const sp = new URLSearchParams();
  if (f.q) sp.set("q", f.q);
  if (f.campus) sp.set("campus", f.campus);
  if (f.city) sp.set("city", f.city);
  if (f.causes.length) sp.set("cause", f.causes.join(","));
  if (f.group !== "any") sp.set("group", f.group);
  if (f.frequency !== "any") sp.set("when", f.frequency);
  if (f.format !== "any") sp.set("format", f.format);
  if (f.level !== "any") sp.set("level", f.level);
  if (f.age !== "any") sp.set("age", f.age);
  if (f.guardian !== "any") sp.set("guardian", f.guardian);
  if (f.includeUnverified) sp.set("unverified", "1");
  if (f.days !== "any") sp.set("days", f.days);
  if (f.serviceHours) sp.set("hours", "1");
  if (f.sort !== "nearest") sp.set("sort", f.sort);
  return sp.toString();
}

/**
 * The volunteer finder. `mode="high_school"` is the High Schools experience: the same database, locked to
 * listings whose published rules allow high school students (18+ listings never appear), with city/area as the
 * location filter and extra filters for weekday/weekend and service-hour verification.
 */
export function OpportunityFinder({ mode = "all", defaultCity }: { mode?: "all" | "high_school"; defaultCity?: string }) {
  const searchParams = useSearchParams();
  const hs = mode === "high_school";
  const [filters, setFilters] = useState<DirectoryFilters>(() => {
    const f = readParams(new URLSearchParams(searchParams.toString()));
    if (hs) {
      f.level = "high_school";
      f.campus = "";
      if (!f.city && defaultCity) f.city = defaultCity;
    }
    return f;
  });
  const [panelOpen, setPanelOpen] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const ids = useId();

  // Keep the URL shareable without triggering a server round-trip.
  useEffect(() => {
    const qs = writeParams(filters);
    const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    if (url !== `${window.location.pathname}${window.location.search}`) window.history.replaceState(null, "", url);
  }, [filters]);

  const update = useCallback(<K extends keyof DirectoryFilters>(key: K, value: DirectoryFilters[K]) => {
    setFilters((f) => ({ ...f, [key]: value }));
  }, []);

  const results = useMemo(() => filterOpportunities(opportunities, filters), [filters]);
  const campus = getUniversity(filters.campus);
  const cityOptions = useMemo(() => citiesWithListings(), []);

  const activeCount =
    (filters.city ? 1 : 0) +
    filters.causes.length +
    (filters.group !== "any" ? 1 : 0) +
    (filters.frequency !== "any" ? 1 : 0) +
    (filters.format !== "any" ? 1 : 0) +
    (filters.level !== "any" && !hs ? 1 : 0) +
    (filters.age !== "any" ? 1 : 0) +
    (filters.guardian !== "any" ? 1 : 0) +
    (filters.days !== "any" ? 1 : 0) +
    (filters.serviceHours ? 1 : 0);

  const base = hs ? { ...defaultFilters, level: "high_school" as const } : defaultFilters;
  const resetAll = () => setFilters({ ...base });
  const resetRefinements = () => setFilters((f) => ({ ...base, q: f.q, campus: f.campus, city: hs ? f.city : "", sort: f.sort }));
  const hidden = hiddenAsUnverified(opportunities, filters);

  const toggleCause = (c: Cause) =>
    setFilters((f) => ({ ...f, causes: f.causes.includes(c) ? f.causes.filter((x) => x !== c) : [...f.causes, c] }));

  const chips: { key: string; label: string; clear: () => void }[] = [
    ...(filters.q ? [{ key: "q", label: `“${filters.q}”`, clear: () => update("q", "") }] : []),
    ...(campus ? [{ key: "campus", label: `Near ${campus.shortName}`, clear: () => update("campus", "") }] : []),
    ...(filters.city ? [{ key: "city", label: cities[filters.city as keyof typeof cities].name, clear: () => update("city", "") }] : []),
    ...filters.causes.map((c) => ({ key: `cause-${c}`, label: causes[c].label, clear: () => toggleCause(c) })),
    ...(filters.group !== "any"
      ? [{ key: "group", label: filters.group === "groups" ? "Groups welcome" : "Individuals", clear: () => update("group", "any") }]
      : []),
    ...(filters.frequency !== "any"
      ? [{ key: "when", label: filters.frequency === "one_time" ? "One-time" : "Recurring", clear: () => update("frequency", "any") }]
      : []),
    ...(filters.format !== "any"
      ? [
          {
            key: "format",
            label: filters.format === "remote" ? "Remote" : filters.format === "in_person" ? "In person" : "Hybrid",
            clear: () => update("format", "any"),
          },
        ]
      : []),
    ...(filters.level !== "any" && !hs
      ? [
          {
            key: "level",
            label: filters.level === "high_school" ? "High school students" : "College students",
            clear: () => update("level", "any"),
          },
        ]
      : []),
    ...(filters.age !== "any"
      ? [
          {
            key: "age",
            label: filters.age === "18" ? "Age 18+" : filters.age === "16" ? "Age 16–17" : "Age 14–15",
            clear: () => update("age", "any"),
          },
        ]
      : []),
    ...(filters.guardian !== "any"
      ? [
          {
            key: "guardian",
            label: filters.guardian === "required" ? "Guardian form required" : "No guardian form",
            clear: () => update("guardian", "any"),
          },
        ]
      : []),
    ...(filters.days !== "any"
      ? [{ key: "days", label: filters.days === "weekdays" ? "Weekdays" : "Weekends", clear: () => update("days", "any") }]
      : []),
    ...(filters.serviceHours ? [{ key: "hours", label: "Service hours verified", clear: () => update("serviceHours", false) }] : []),
  ];

  const filterPanel = (
    <div className="grid gap-7">
      {hs ? null : (
        <Segmented
          legend="I'm a"
          name={`${ids}-level`}
          value={filters.level}
          onChange={(v) => update("level", v)}
          options={[
            { value: "any", label: "Any student" },
            { value: "high_school", label: "High school student" },
            { value: "college", label: "College student" },
          ]}
        />
      )}
      <div>
        <label htmlFor={`${ids}-age`} className="text-label mb-2.5 block text-ink-muted">
          My age
        </label>
        <select
          id={`${ids}-age`}
          className="field"
          value={filters.age}
          onChange={(e) => update("age", e.target.value as DirectoryFilters["age"])}
        >
          <option value="any">{hs ? "Any high school age" : "Any age"}</option>
          <option value="14">14–15</option>
          <option value="16">16–17</option>
          <option value="18">18 or older</option>
        </select>
      </div>
      <Segmented
        legend="Parent / guardian permission"
        name={`${ids}-guardian`}
        value={filters.guardian}
        onChange={(v) => update("guardian", v)}
        options={[
          { value: "any", label: "Any" },
          { value: "required", label: "Form required" },
          { value: "not_required", label: "Not required" },
        ]}
      />
      {hs ? (
        <>
          <Segmented
            legend="Days"
            name={`${ids}-days`}
            value={filters.days}
            onChange={(v) => update("days", v)}
            options={[
              { value: "any", label: "Any day" },
              { value: "weekdays", label: "Weekdays" },
              { value: "weekends", label: "Weekends" },
            ]}
          />
          <label className="inline-flex min-h-11 cursor-pointer items-center gap-3 text-[0.9375rem] font-medium">
            <input
              type="checkbox"
              className="check"
              checked={filters.serviceHours}
              onChange={(e) => update("serviceHours", e.target.checked)}
            />
            Service hours verified by the organization
          </label>
        </>
      ) : null}
      <div>
        <label htmlFor={`${ids}-city`} className="text-label mb-2.5 block text-ink-muted">
          City &amp; surrounding area
        </label>
        <select id={`${ids}-city`} className="field" value={filters.city} onChange={(e) => update("city", e.target.value)}>
          <option value="">All cities</option>
          {cityOptions.map((c) => (
            <option key={c.key} value={c.key}>
              {c.key === "statewide" ? "Statewide only" : c.name}
            </option>
          ))}
        </select>
      </div>

      <fieldset>
        <legend className="text-label mb-2.5 text-ink-muted">Cause</legend>
        <div className="flex flex-wrap gap-1.5">
          {causeKeys.map((c) => (
            <label
              key={c}
              className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-sm border border-hairline-strong bg-paper px-3 text-[0.875rem] font-medium text-ink transition-colors hover:border-ink has-checked:border-forest has-checked:bg-forest-tint has-checked:text-forest-deep has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-forest"
            >
              <input type="checkbox" className="check size-4!" checked={filters.causes.includes(c)} onChange={() => toggleCause(c)} />
              {causes[c].label}
            </label>
          ))}
        </div>
      </fieldset>

      <Segmented
        legend="Who can volunteer"
        name={`${ids}-group`}
        value={filters.group}
        onChange={(v) => update("group", v)}
        options={[
          { value: "any", label: "Anyone" },
          { value: "individuals", label: "Individuals" },
          { value: "groups", label: "Groups & school clubs" },
        ]}
      />
      <Segmented
        legend="Opportunity type"
        name={`${ids}-when`}
        value={filters.frequency}
        onChange={(v) => update("frequency", v)}
        options={[
          { value: "any", label: "Any" },
          { value: "one_time", label: "One-time" },
          { value: "recurring", label: "Recurring" },
        ]}
      />
      <Segmented
        legend="Where"
        name={`${ids}-format`}
        value={filters.format}
        onChange={(v) => update("format", v)}
        options={[
          { value: "any", label: "Any" },
          { value: "in_person", label: "In person" },
          { value: "remote", label: "Remote" },
        ]}
      />
      {activeCount > 0 ? (
        <button
          type="button"
          onClick={resetRefinements}
          className="link inline-flex min-h-11 items-center gap-2 justify-self-start font-semibold"
        >
          <RotateCcw aria-hidden className="size-4" />
          Clear {activeCount} filter{activeCount === 1 ? "" : "s"}
        </button>
      ) : null}
    </div>
  );

  return (
    <div>
      {/* Search bar */}
      <div
        role="search"
        className={cx(
          "grid gap-3 rounded-md border border-hairline bg-paper p-3 shadow-[0_20px_50px_-30px_rgb(11_48_51/0.45)] sm:p-4",
          hs ? "md:grid-cols-[1.4fr_auto]" : "md:grid-cols-[1.4fr_1fr_auto]",
        )}
      >
        <div className="relative">
          <label htmlFor={`${ids}-q`} className="sr-only">
            Search by keyword
          </label>
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-ink-muted" />
          <input
            id={`${ids}-q`}
            type="search"
            value={filters.q}
            onChange={(e) => update("q", e.target.value)}
            placeholder="Search food banks, animals, tutoring…"
            className="field pl-11! text-[1.0625rem]"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            enterKeyHint="search"
          />
        </div>
        <div className={hs ? "hidden" : undefined}>
          <label htmlFor={`${ids}-campus`} className="sr-only">
            College or university
          </label>
          <select
            id={`${ids}-campus`}
            className="field text-[1.0625rem]"
            value={filters.campus}
            onChange={(e) => update("campus", e.target.value)}
          >
            <option value="">Any school or college</option>
            <optgroup label="Colleges & universities">
              {universities.map((u) => (
                <option key={u.slug} value={u.slug}>
                  Near {u.name}
                </option>
              ))}
            </optgroup>
          </select>
        </div>
        <div>
          <label htmlFor={`${ids}-sort`} className="sr-only">
            Sort results
          </label>
          <select
            id={`${ids}-sort`}
            className="field min-w-48"
            value={filters.sort}
            onChange={(e) => update("sort", e.target.value as DirectoryFilters["sort"])}
          >
            <option value="nearest">{campus ? "Sort: Nearest first" : "Sort: Recommended"}</option>
            <option value="az">Sort: Organization A–Z</option>
            <option value="verified">Sort: Recently verified</option>
          </select>
        </div>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-12">
        {/* Filters: rail on desktop, disclosure on mobile */}
        <aside className="lg:col-span-4 xl:col-span-3" aria-label="Filters">
          <button
            type="button"
            className={buttonClass({ variant: "secondary", className: "w-full lg:hidden" })}
            aria-expanded={panelOpen}
            aria-controls={`${ids}-panel`}
            onClick={() => setPanelOpen((v) => !v)}
          >
            <SlidersHorizontal aria-hidden className="size-4" />
            {panelOpen ? "Hide filters" : "Filters"}
            {activeCount ? <span className="rounded-sm bg-forest px-1.5 py-0.5 text-[0.75rem] text-white">{activeCount}</span> : null}
          </button>
          <div id={`${ids}-panel`} className={cx("mt-6 lg:mt-0 lg:block", panelOpen ? "block" : "hidden")}>
            <div className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
              <p className="text-h3 mb-6 hidden text-navy lg:block">Refine</p>
              {filterPanel}
            </div>
          </div>
        </aside>

        <div className="lg:col-span-8 xl:col-span-9" ref={resultsRef}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3">
            <p className="text-[1.0625rem] text-ink" aria-live="polite" aria-atomic="true">
              <span className="font-semibold tabular">{results.length}</span> {results.length === 1 ? "listing" : "listings"}
              {campus ? (
                <> within about 55 miles of {campus.shortName} or statewide</>
              ) : filters.city && filters.city !== "statewide" ? (
                <> in and around {cities[filters.city as keyof typeof cities].name}, plus statewide</>
              ) : null}
            </p>
            {chips.length ? (
              <button type="button" onClick={resetAll} className="link text-[0.9375rem] font-semibold">
                Reset everything
              </button>
            ) : null}
          </div>

          {chips.length ? (
            <ul className="mt-4 flex flex-wrap gap-2" aria-label="Active filters">
              {chips.map((c) => (
                <li key={c.key}>
                  <button
                    type="button"
                    onClick={c.clear}
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-sm bg-navy px-2.5 text-[0.8125rem] font-medium text-ivory hover:bg-navy-deep"
                  >
                    {c.label}
                    <X aria-hidden className="size-3.5" />
                    <span className="sr-only">Remove filter</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          {hidden > 0 ? (
            <div className="mt-4 flex flex-col gap-3 rounded-md border border-gold/60 bg-gold-tint p-4 text-[0.9375rem] sm:flex-row sm:items-center sm:justify-between">
              <p>
                <strong>{hidden}</strong> more listing{hidden === 1 ? " hasn't" : "s haven't"} published age rules, so we can&apos;t say
                whether they accept {filters.level === "high_school" ? "high school students" : "volunteers your age"}.
              </p>
              <button type="button" onClick={() => update("includeUnverified", true)} className="link shrink-0 font-semibold">
                Show them (check with organizer)
              </button>
            </div>
          ) : null}
          {results.length ? (
            <ul className="mt-6 grid gap-5 md:grid-cols-2">
              {results.map((o) => (
                <li key={o.slug}>
                  <OpportunityCard
                    o={o}
                    org={orgName(o)}
                    distance={campus ? distanceFromCampus(o, campus) : null}
                    unverifiedForYouth={
                      (filters.level === "high_school" || (filters.age !== "any" && filters.age !== "18")) &&
                      o.eligibility.minors === "unverified"
                    }
                    youthView={hs || filters.level === "high_school"}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-6 rounded-md border border-dashed border-hairline-strong bg-paper/60 px-6 py-12 text-center sm:px-12">
              <p className="text-h3 text-navy">No listings match those filters yet.</p>
              <p className="mx-auto mt-3 max-w-md text-ink-muted">
                {filters.format === "remote"
                  ? "We haven't verified any remote opportunities in Louisiana yet. Try in-person listings or check back soon."
                  : "Try removing a filter, searching a broader word, or including statewide listings. Our directory is new and growing."}
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                {activeCount ? (
                  <button type="button" onClick={resetRefinements} className={buttonClass({ variant: "primary" })}>
                    Clear filters
                  </button>
                ) : (
                  <button type="button" onClick={resetAll} className={buttonClass({ variant: "primary" })}>
                    Show all listings
                  </button>
                )}
                <Link href="/volunteer/submit" className={buttonClass({ variant: "secondary" })}>
                  Submit an opportunity
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function FinderSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading volunteer listings">
      <div className="h-[4.5rem] animate-pulse rounded-md border border-hairline bg-paper" />
      <div className="mt-10 grid gap-10 lg:grid-cols-12">
        <div className="hidden space-y-4 lg:col-span-4 lg:block xl:col-span-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-sm bg-sand" />
          ))}
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:col-span-8 xl:col-span-9">
          {Array.from({ length: 4 }).map((_, i) => (
            <OpportunityCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
