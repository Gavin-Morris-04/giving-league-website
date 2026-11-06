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
  opportunities,
  orgName,
  type DirectoryFilters,
} from "@/lib/directory";
import type { Cause } from "@/lib/types";
import { cx } from "@/lib/format";
import { buttonClass } from "@/components/ui/Button";
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
    causes: (sp.get("cause") ?? "")
      .split(",")
      .filter((c): c is Cause => causeKeys.includes(c as Cause)),
    group: pick("group", ["any", "individuals", "groups"] as const, "any"),
    frequency: pick("when", ["any", "one_time", "recurring"] as const, "any"),
    format: pick("format", ["any", "in_person", "remote", "hybrid"] as const, "any"),
    kind: pick("type", ["any", "resource", "event"] as const, "any"),
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
  if (f.kind !== "any") sp.set("type", f.kind);
  if (f.sort !== "nearest") sp.set("sort", f.sort);
  return sp.toString();
}

function Segmented<T extends string>({
  legend,
  name,
  value,
  options,
  onChange,
}: {
  legend: string;
  name: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <fieldset>
      <legend className="text-label mb-2.5 text-ink-muted">{legend}</legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <label
            key={o.value}
            className="relative inline-flex min-h-10 cursor-pointer items-center rounded-sm border border-hairline-strong bg-paper px-3 text-[0.875rem] font-medium text-ink transition-colors hover:border-ink has-checked:border-forest has-checked:bg-forest has-checked:text-white has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-forest"
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              className="sr-only"
            />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function OpportunityFinder() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<DirectoryFilters>(() => readParams(new URLSearchParams(searchParams.toString())));
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
    (filters.kind !== "any" ? 1 : 0);

  const resetAll = () => setFilters({ ...defaultFilters });
  const resetRefinements = () =>
    setFilters((f) => ({ ...defaultFilters, q: f.q, campus: f.campus, sort: f.sort }));

  const toggleCause = (c: Cause) =>
    setFilters((f) => ({ ...f, causes: f.causes.includes(c) ? f.causes.filter((x) => x !== c) : [...f.causes, c] }));

  const chips: { key: string; label: string; clear: () => void }[] = [
    ...(filters.q ? [{ key: "q", label: `“${filters.q}”`, clear: () => update("q", "") }] : []),
    ...(campus ? [{ key: "campus", label: `Near ${campus.shortName}`, clear: () => update("campus", "") }] : []),
    ...(filters.city ? [{ key: "city", label: cities[filters.city as keyof typeof cities].name, clear: () => update("city", "") }] : []),
    ...filters.causes.map((c) => ({ key: `cause-${c}`, label: causes[c].label, clear: () => toggleCause(c) })),
    ...(filters.group !== "any" ? [{ key: "group", label: filters.group === "groups" ? "Groups welcome" : "Individuals", clear: () => update("group", "any") }] : []),
    ...(filters.frequency !== "any" ? [{ key: "when", label: filters.frequency === "one_time" ? "One-time" : "Recurring", clear: () => update("frequency", "any") }] : []),
    ...(filters.format !== "any" ? [{ key: "format", label: filters.format === "remote" ? "Remote" : filters.format === "in_person" ? "In person" : "Hybrid", clear: () => update("format", "any") }] : []),
    ...(filters.kind !== "any" ? [{ key: "type", label: filters.kind === "event" ? "Dated events" : "Ongoing resources", clear: () => update("kind", "any") }] : []),
  ];

  const filterPanel = (
    <div className="grid gap-7">
      <div>
        <label htmlFor={`${ids}-city`} className="text-label mb-2.5 block text-ink-muted">
          City
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
          { value: "groups", label: "Groups welcome" },
        ]}
      />
      <Segmented
        legend="Commitment"
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
      <Segmented
        legend="Listing type"
        name={`${ids}-type`}
        value={filters.kind}
        onChange={(v) => update("kind", v)}
        options={[
          { value: "any", label: "All" },
          { value: "resource", label: "Ongoing resources" },
          { value: "event", label: "Dated events" },
        ]}
      />
      {activeCount > 0 ? (
        <button type="button" onClick={resetRefinements} className="link inline-flex min-h-11 items-center gap-2 justify-self-start font-semibold">
          <RotateCcw aria-hidden className="size-4" />
          Clear {activeCount} filter{activeCount === 1 ? "" : "s"}
        </button>
      ) : null}
    </div>
  );

  return (
    <div>
      {/* Search bar */}
      <div role="search" className="grid gap-3 rounded-md border border-hairline bg-paper p-3 shadow-[0_20px_50px_-30px_rgb(18_42_58/0.45)] sm:p-4 md:grid-cols-[1.4fr_1fr_auto]">
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
        <div>
          <label htmlFor={`${ids}-campus`} className="sr-only">
            University
          </label>
          <select id={`${ids}-campus`} className="field text-[1.0625rem]" value={filters.campus} onChange={(e) => update("campus", e.target.value)}>
            <option value="">Any university</option>
            {universities.map((u) => (
              <option key={u.slug} value={u.slug}>
                Near {u.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${ids}-sort`} className="sr-only">
            Sort results
          </label>
          <select id={`${ids}-sort`} className="field min-w-48" value={filters.sort} onChange={(e) => update("sort", e.target.value as DirectoryFilters["sort"])}>
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
              <span className="font-semibold tabular">{results.length}</span>{" "}
              {results.length === 1 ? "listing" : "listings"}
              {campus ? <> within about 55 miles of {campus.shortName} or statewide</> : null}
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

          {results.length ? (
            <ul className="mt-6 grid gap-5 md:grid-cols-2">
              {results.map((o) => (
                <li key={o.slug}>
                  <OpportunityCard o={o} org={orgName(o)} distance={campus ? distanceFromCampus(o, campus) : null} />
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
