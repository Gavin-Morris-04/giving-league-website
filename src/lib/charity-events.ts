import { cities } from "../data/reference/geography.ts";
import type { CharityEvent, CharityEventType, Participation, Recurrence } from "./types.ts";

/**
 * Date logic for the charity events directory.
 *
 * `today` is always passed in (ISO yyyy-mm-dd) so the same function runs at build time and in the browser.
 *  - upcoming   — a confirmed date in the future
 *  - happening  — a confirmed date range that includes today
 *  - awaiting   — annual / seasonal (or unconfirmed-recurrence) event whose next date isn't announced,
 *                 including events whose confirmed date has now passed
 *  - past       — a one-time event that's over
 * A past `confirmed` date is never shown as the next date.
 */
export type EventTiming =
  | { state: "upcoming"; startDate: string; endDate?: string; time?: string }
  | { state: "happening"; startDate: string; endDate?: string; time?: string }
  | { state: "awaiting"; typicalTiming: string; lastHeld?: CharityEvent["lastHeld"]; justEnded?: string }
  | { state: "past"; lastHeld?: CharityEvent["lastHeld"] };

export function eventTiming(e: CharityEvent, today: string): EventTiming {
  const c = e.confirmed;
  if (c) {
    const end = c.endDate ?? c.startDate;
    if (c.startDate > today) return { state: "upcoming", startDate: c.startDate, endDate: c.endDate, time: c.time };
    if (end >= today) return { state: "happening", startDate: c.startDate, endDate: c.endDate, time: c.time };
    // The confirmed edition is over: fall back to recurring / past handling, remembering it as last held.
    const lastHeld = { startDate: c.startDate, endDate: c.endDate, source: c.source };
    if (e.recurrence === "one_time") return { state: "past", lastHeld };
    return { state: "awaiting", typicalTiming: e.typicalTiming, lastHeld, justEnded: end };
  }
  if (e.recurrence === "one_time") return { state: "past", lastHeld: e.lastHeld };
  return { state: "awaiting", typicalTiming: e.typicalTiming, lastHeld: e.lastHeld };
}

/** Sort key: upcoming/happening by date first, then awaiting by next typical month, then past. */
export function timingSortKey(e: CharityEvent, today: string) {
  const t = eventTiming(e, today);
  if (t.state === "happening") return `0-${t.startDate}`;
  if (t.state === "upcoming") return `1-${t.startDate}`;
  if (t.state === "awaiting") {
    const month = Number(today.slice(5, 7));
    const next = e.typicalMonths.length ? Math.min(...e.typicalMonths.map((m) => (m - month + 12) % 12)) : 99;
    return `2-${String(next).padStart(2, "0")}-${e.name}`;
  }
  return `3-${e.name}`;
}

export type EventFilters = {
  q: string;
  city: string;
  region: string;
  month: string; // "1".."12" or ""
  cause: string;
  type: string;
  level: "any" | "high_school" | "college";
  cost: "any" | "free" | "paid";
  timing: "any" | "upcoming" | "awaiting";
};

export const defaultEventFilters: EventFilters = {
  q: "",
  city: "",
  region: "",
  month: "",
  cause: "",
  type: "",
  level: "any",
  cost: "any",
  timing: "any",
};

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

export function eventMonths(e: CharityEvent): number[] {
  const set = new Set(e.typicalMonths);
  if (e.confirmed) {
    const s = Number(e.confirmed.startDate.slice(5, 7));
    const en = Number((e.confirmed.endDate ?? e.confirmed.startDate).slice(5, 7));
    for (let m = s; ; m = (m % 12) + 1) {
      set.add(m);
      if (m === en) break;
    }
  }
  return [...set];
}

export function filterEvents(list: CharityEvent[], f: EventFilters, today: string) {
  const terms = norm(f.q).split(/\s+/).filter(Boolean);
  return list
    .filter((e) => {
      const region = cities[e.cityKey].region;
      if (f.city && e.cityKey !== f.city && e.cityKey !== "statewide") return false;
      if (f.region && region !== f.region && e.cityKey !== "statewide") return false;
      if (f.month && !eventMonths(e).includes(Number(f.month))) return false;
      if (f.cause && e.cause !== f.cause) return false;
      if (f.type && e.type !== f.type) return false;
      if (f.level === "high_school" && !["yes", "with_guardian", "with_adult"].includes(e.audience.highSchool)) return false;
      if (f.level === "college" && e.audience.college !== "yes") return false;
      if (f.cost !== "any" && e.cost !== f.cost) return false;
      if (f.timing !== "any") {
        const t = eventTiming(e, today).state;
        if (f.timing === "upcoming" && t !== "upcoming" && t !== "happening") return false;
        if (f.timing === "awaiting" && t !== "awaiting") return false;
      }
      if (terms.length) {
        const hay = norm([e.name, e.host, e.summary, e.description, e.location, cities[e.cityKey].name].join(" "));
        if (!terms.every((t) => hay.includes(t))) return false;
      }
      return true;
    })
    .sort((a, b) => timingSortKey(a, today).localeCompare(timingSortKey(b, today)));
}

export const eventTypeLabels: Record<CharityEventType, string> = {
  walk_run: "Walk / run",
  ride: "Bike ride",
  golf: "Golf tournament",
  gala: "Gala or dinner",
  collection_drive: "Collection drive",
  toy_drive: "Toy drive",
  cleanup: "Community cleanup",
  build: "Home build",
  other: "Other",
};

export const recurrenceLabels: Record<Recurrence, string> = {
  one_time: "One-time",
  annual: "Annual",
  seasonal: "Seasonal",
  unconfirmed: "Recurrence not announced",
};

export const participationLabels: Record<Participation, string> = {
  participate: "Walk, run or ride",
  donate_items: "Donate items",
  volunteer: "Volunteer",
  fundraise: "Fundraise",
  attend: "Attend",
};

export const costLabels: Record<CharityEvent["cost"], string> = {
  free: "Free to take part",
  paid: "Registration fee",
  varies: "Cost varies",
  unverified: "Cost: check with organizer",
};

export function audienceLabel(e: CharityEvent) {
  const hs = e.audience.highSchool;
  if (hs === "yes") return "Open to high school & college students";
  if (hs === "with_guardian") return "High school students with guardian permission";
  if (hs === "with_adult") return "High school students with an adult";
  if (hs === "no") return "Adults only";
  return "Age rules: check with organizer";
}

export const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** True only when the organizer's published policy supports high school participation. */
export function openToHighSchool(e: CharityEvent) {
  return e.audience.highSchool === "yes" || e.audience.highSchool === "with_guardian" || e.audience.highSchool === "with_adult";
}

/** Events in or near a city (same ~55 mile radius as volunteer listings), plus statewide events. */
export function eventsNearCity(list: CharityEvent[], cityKey: CharityEvent["cityKey"]) {
  const c = cities[cityKey];
  const R = 3958.8;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const miles = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
    const h = Math.sin(toRad(b.lat - a.lat) / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(toRad(b.lng - a.lng) / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  };
  return list.filter((e) => e.cityKey === "statewide" || e.cityKey === cityKey || miles(cities[e.cityKey], c) <= 55);
}
