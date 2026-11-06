import assert from "node:assert/strict";
import { test } from "node:test";
import { isEndedListing, lastListingDay, laterDate } from "../src/lib/listing-dates.ts";

test("ongoing resources never end", () => {
  assert.equal(lastListingDay({ kind: "resource" }), null);
  assert.equal(isEndedListing({ kind: "resource" }, "2099-01-01"), false);
});

test("a dated listing stays up through its last day and drops off the day after", () => {
  const o = { kind: "event" as const, startDate: "2026-11-30", endDate: "2026-12-22" };
  assert.equal(isEndedListing(o, "2026-12-22"), false);
  assert.equal(isEndedListing(o, "2026-12-23"), true);
});

test("a one-day listing without an end date uses its start date", () => {
  assert.equal(isEndedListing({ kind: "event", startDate: "2026-12-25" }, "2026-12-26"), true);
  assert.equal(isEndedListing({ kind: "event", startDate: "2026-12-25" }, "2026-12-25"), false);
});

test("laterDate picks the newest known date", () => {
  assert.equal(laterDate("2026-11-06", "2026-11-09"), "2026-11-09");
  assert.equal(laterDate("2026-11-06", null), "2026-11-06");
});
