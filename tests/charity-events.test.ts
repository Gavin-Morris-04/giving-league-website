// Seasonal / recurring event date logic. Run with: npm test
import assert from "node:assert/strict";
import { test } from "node:test";
import { eventTiming, filterEvents, defaultEventFilters } from "../src/lib/charity-events.ts";
import type { CharityEvent } from "../src/lib/types.ts";

const base: CharityEvent = {
  slug: "x",
  name: "Example Walk",
  host: "Example Org",
  hostUrl: "https://example.org",
  description: "",
  summary: "",
  type: "walk_run",
  cause: "health",
  cityKey: "baton-rouge",
  location: "Baton Rouge",
  recurrence: "annual",
  typicalMonths: [9],
  typicalTiming: "Typically held in September",
  participation: ["participate"],
  cost: "unverified",
  audience: { highSchool: "unverified", college: "yes" },
  registrationUrl: "https://example.org",
  infoUrl: "https://example.org",
  lastVerified: "2026-11-06",
  provenance: "verified",
};

test("annual event with no confirmed date stays listed as awaiting its next date", () => {
  const t = eventTiming(base, "2026-11-06");
  assert.equal(t.state, "awaiting");
});

test("a confirmed future date is upcoming", () => {
  const t = eventTiming({ ...base, confirmed: { startDate: "2027-04-17", endDate: "2027-04-25", source: "official" } }, "2026-11-06");
  assert.equal(t.state, "upcoming");
});

test("a confirmed range that includes today is happening", () => {
  const t = eventTiming({ ...base, confirmed: { startDate: "2027-04-17", endDate: "2027-04-25", source: "official" } }, "2027-04-20");
  assert.equal(t.state, "happening");
});

test("after a confirmed annual edition ends, it returns to awaiting — last year's date is never shown as next", () => {
  const t = eventTiming({ ...base, confirmed: { startDate: "2027-04-17", endDate: "2027-04-25", source: "official" } }, "2027-05-01");
  assert.equal(t.state, "awaiting");
  assert.equal(t.state === "awaiting" && t.lastHeld?.startDate, "2027-04-17");
});

test("a one-time event that has ended is past", () => {
  const t = eventTiming({ ...base, recurrence: "one_time", confirmed: { startDate: "2026-09-10", source: "official" } }, "2026-11-06");
  assert.equal(t.state, "past");
});

test("timing filter separates upcoming from awaiting", () => {
  const upcoming = { ...base, slug: "u", confirmed: { startDate: "2027-04-17", source: "official" } };
  const awaiting = { ...base, slug: "a" };
  const up = filterEvents([upcoming, awaiting], { ...defaultEventFilters, timing: "upcoming" }, "2026-11-06").map((e) => e.slug);
  const aw = filterEvents([upcoming, awaiting], { ...defaultEventFilters, timing: "awaiting" }, "2026-11-06").map((e) => e.slug);
  assert.deepEqual(up, ["u"]);
  assert.deepEqual(aw, ["a"]);
});

test("high school filter excludes events whose age rules aren't published", () => {
  const open = { ...base, slug: "open", audience: { highSchool: "yes" as const, college: "yes" as const } };
  const unknown = { ...base, slug: "unknown" };
  const r = filterEvents([open, unknown], { ...defaultEventFilters, level: "high_school" }, "2026-11-06").map((e) => e.slug);
  assert.deepEqual(r, ["open"]);
});

test("month filter matches typical months and confirmed ranges that span months", () => {
  const spanning = { ...base, slug: "s", typicalMonths: [], confirmed: { startDate: "2027-11-25", endDate: "2028-01-05", source: "official" } };
  const dec = filterEvents([spanning], { ...defaultEventFilters, month: "12" }, "2026-11-06").map((e) => e.slug);
  assert.deepEqual(dec, ["s"]);
});
