"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { ArrowUpRight, CalendarDays, ChevronLeft, ChevronRight, LayoutList, MapPin } from "lucide-react";
import { cities, universities } from "@/data/reference/geography";
import { cx, formatDateRange, parseISODate } from "@/lib/format";
import type { CityKey } from "@/lib/types";

export type DatedItem = {
  id: string;
  title: string;
  host: string;
  /** "ours" = organized by us; "listed" = another organization's event from our directory. */
  source: "ours" | "listed";
  startDate: string;
  endDate?: string;
  cityKey: CityKey;
  campuses: string[];
  href: string;
  external: boolean;
};

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function overlapsDay(item: DatedItem, y: number, m: number, d: number) {
  const day = Date.UTC(y, m, d);
  const s = parseISODate(item.startDate).getTime();
  const e = parseISODate(item.endDate ?? item.startDate).getTime();
  return day >= s && day <= e;
}

export function EventsBrowser({ items }: { items: DatedItem[] }) {
  const ids = useId();
  const [city, setCity] = useState("");
  const [campus, setCampus] = useState("");
  const [view, setView] = useState<"list" | "calendar">("list");
  const firstMonth = useMemo(() => {
    const firstUpcoming = items.map((i) => i.startDate).sort()[0] ?? "2027-01-01";
    const d = parseISODate(firstUpcoming);
    return { y: d.getUTCFullYear(), m: d.getUTCMonth() };
  }, [items]);
  const [month, setMonth] = useState(firstMonth);

  const filtered = items.filter((i) => {
    if (city && i.cityKey !== city && i.cityKey !== "statewide") return false;
    if (campus && !i.campuses.includes(campus)) return false;
    return true;
  });
  const ours = filtered.filter((i) => i.source === "ours");
  const listed = filtered.filter((i) => i.source === "listed");

  const cityOptions = Object.values(cities).filter((c) => c.key !== "statewide" && universities.some((u) => u.cityKey === c.key));

  const step = (dir: -1 | 1) =>
    setMonth(({ y, m }) => {
      const n = m + dir;
      return { y: y + Math.floor(n / 12), m: ((n % 12) + 12) % 12 };
    });

  const daysInMonth = new Date(Date.UTC(month.y, month.m + 1, 0)).getUTCDate();
  const lead = new Date(Date.UTC(month.y, month.m, 1)).getUTCDay();
  const monthItems = filtered.filter((i) => {
    const s = parseISODate(i.startDate);
    const e = parseISODate(i.endDate ?? i.startDate);
    const ms = Date.UTC(month.y, month.m, 1);
    const me = Date.UTC(month.y, month.m, daysInMonth);
    return s.getTime() <= me && e.getTime() >= ms;
  });

  return (
    <div>
      <div className="flex flex-col gap-4 rounded-md border border-hairline bg-paper p-4 md:flex-row md:items-end">
        <div className="grid flex-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={`${ids}-city`} className="text-label mb-2 block text-ink-muted">
              City
            </label>
            <select id={`${ids}-city`} className="field" value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="">All cities</option>
              {cityOptions.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={`${ids}-campus`} className="text-label mb-2 block text-ink-muted">
              University
            </label>
            <select id={`${ids}-campus`} className="field" value={campus} onChange={(e) => setCampus(e.target.value)}>
              <option value="">All universities</option>
              {universities.map((u) => (
                <option key={u.slug} value={u.slug}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div role="group" aria-label="View" className="flex shrink-0 rounded-sm border border-hairline-strong p-1">
          {(
            [
              { v: "list", label: "List", Icon: LayoutList },
              { v: "calendar", label: "Calendar", Icon: CalendarDays },
            ] as const
          ).map(({ v, label, Icon }) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              onClick={() => setView(v)}
              className={cx(
                "inline-flex min-h-10 items-center gap-2 rounded-[3px] px-4 text-[0.9375rem] font-semibold transition-colors",
                view === v ? "bg-navy text-ivory" : "text-ink hover:bg-sand",
              )}
            >
              <Icon aria-hidden className="size-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {view === "list" ? (
        <div className="mt-10 grid gap-12">
          <div>
            <h3 className="text-h3 text-navy">Our events</h3>
            {ours.length ? (
              <ul className="mt-5 grid gap-4">{ours.map((i) => <EventRow key={i.id} item={i} />)}</ul>
            ) : (
              <p className="mt-3 text-ink-muted">
                Nothing scheduled yet{city || campus ? " for this filter" : ""}. Our first events are being planned — get announcements below.
              </p>
            )}
          </div>
          <div>
            <h3 className="text-h3 text-navy">Dated events from organizations in our directory</h3>
            <p className="mt-2 text-[0.9375rem] text-ink-muted">Organized and run by these organizations, not by us. Register on their sites.</p>
            {listed.length ? (
              <ul className="mt-5 grid gap-4">{listed.map((i) => <EventRow key={i.id} item={i} />)}</ul>
            ) : (
              <p className="mt-4 text-ink-muted">No dated events match this filter.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-10">
          <div className="flex items-center justify-between gap-4">
            <button type="button" onClick={() => step(-1)} className="inline-flex min-h-11 items-center gap-1 rounded-sm px-3 font-semibold hover:bg-sand">
              <ChevronLeft aria-hidden className="size-5" />
              <span className="sr-only sm:not-sr-only">Previous</span>
              <span className="sr-only"> month</span>
            </button>
            <h3 className="text-h3 text-navy" aria-live="polite">
              {MONTHS[month.m]} {month.y}
            </h3>
            <button type="button" onClick={() => step(1)} className="inline-flex min-h-11 items-center gap-1 rounded-sm px-3 font-semibold hover:bg-sand">
              <span className="sr-only sm:not-sr-only">Next</span>
              <span className="sr-only"> month</span>
              <ChevronRight aria-hidden className="size-5" />
            </button>
          </div>
          {/* Visual month grid; the list below it is the accessible equivalent. */}
          <div className="mt-4 overflow-hidden rounded-md border border-hairline bg-paper" aria-hidden="true">
            <div className="grid grid-cols-7 border-b border-hairline bg-sand">
              {DAYS.map((d) => (
                <div key={d} className="text-label py-2 text-center text-ink-muted">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {Array.from({ length: lead }).map((_, i) => (
                <div key={`l${i}`} className="min-h-16 border-r border-b border-hairline bg-ivory/60 sm:min-h-24" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const d = i + 1;
                const dayItems = monthItems.filter((it) => overlapsDay(it, month.y, month.m, d));
                return (
                  <div key={d} className="min-h-16 border-r border-b border-hairline p-1.5 sm:min-h-24 sm:p-2">
                    <span className="tabular inline-grid size-7 place-items-center rounded-full text-[0.8125rem] text-ink-muted">
                      {d}
                    </span>
                    {dayItems.map((it) => (
                      <span
                        key={it.id}
                        className={cx("mt-1 block truncate rounded-[3px] px-1 py-0.5 text-[0.6875rem] font-semibold sm:text-[0.75rem]", it.source === "ours" ? "bg-forest text-white" : "bg-gold-tint text-gold-ink")}
                        title={it.title}
                      >
                        <span className="sm:hidden">●</span>
                        <span className="max-sm:hidden">{it.title}</span>
                      </span>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
          {monthItems.length ? (
            <ul className="mt-6 grid gap-4" aria-label={`Events in ${MONTHS[month.m]} ${month.y}`}>
              {monthItems.map((i) => (
                <EventRow key={i.id} item={i} />
              ))}
            </ul>
          ) : (
            <p className="mt-6 text-ink-muted">No dated events in {MONTHS[month.m]} {month.y}.</p>
          )}
        </div>
      )}
    </div>
  );
}

function EventRow({ item }: { item: DatedItem }) {
  const place = item.cityKey === "statewide" ? "Statewide" : cities[item.cityKey].name;
  const inner = (
    <>
      <div className="flex shrink-0 flex-col items-center justify-center rounded-sm border border-gold/60 bg-gold-tint px-4 py-3 text-center sm:w-32">
        <span className="text-[0.8125rem] font-semibold text-gold-ink">{formatDateRange(item.startDate, item.endDate)}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[0.875rem] font-semibold text-forest">{item.host}</p>
        <p className="text-h3 mt-0.5 text-navy">{item.title}</p>
        <p className="mt-1.5 flex items-center gap-1.5 text-[0.875rem] text-ink-muted">
          <MapPin aria-hidden className="size-4" />
          {place}
        </p>
      </div>
      <span className="inline-flex shrink-0 items-center gap-1 self-start font-semibold text-forest sm:self-center">
        {item.external ? "Register" : "Details"}
        <ArrowUpRight aria-hidden className="size-4" />
      </span>
    </>
  );
  const cls = "card-lift flex flex-col gap-4 rounded-md border border-hairline bg-paper p-4 sm:flex-row sm:items-center sm:gap-6 sm:p-5";
  return (
    <li>
      {item.external ? (
        <a href={item.href} target="_blank" rel="noopener noreferrer" className={cls}>
          {inner}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      ) : (
        <Link href={item.href} className={cls}>
          {inner}
        </Link>
      )}
    </li>
  );
}
