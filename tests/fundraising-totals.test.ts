// Run with: npm test   (node --experimental-strip-types --test tests/)
import assert from "node:assert/strict";
import { test } from "node:test";
import { computeVerifiedTotals, latestValidReport } from "../src/lib/fundraising/totals.ts";
import type { FundraisingCampaignRecord, FundraisingReport } from "../src/lib/types.ts";

const campaign = (id: string, extra: Partial<FundraisingCampaignRecord> = {}): FundraisingCampaignRecord => ({
  id,
  charityId: extra.charityId ?? "st-jude",
  campaignName: `Campaign ${id}`,
  campaignIdentifier: `ext-${id}`,
  campaignUrl: `https://example.org/${id}`,
  currency: "USD",
  verificationMethod: "charity_campaign_report",
  reportingPeriod: { start: "2027-01-01", end: null },
  status: "active",
  ...extra,
});

let n = 0;
const report = (campaignId: string, cents: number, asOf: string, extra: Partial<FundraisingReport> = {}): FundraisingReport => ({
  id: extra.id ?? `r${++n}`,
  campaignId,
  reportedAmountCents: cents,
  asOf,
  verifiedAt: extra.verifiedAt ?? `${asOf}T12:00:00Z`,
  sourceReference: "official report",
  enteredBy: "admin@example.org",
  kind: "cumulative",
  ...extra,
});

test("no campaigns → no verified data (page shows 'Donation Tracking Coming Soon', never $0)", () => {
  const t = computeVerifiedTotals([], []);
  assert.equal(t.hasVerifiedData, false);
  assert.equal(t.totalCents, 0);
  assert.equal(t.lastVerifiedAt, null);
});

test("a campaign with no reports is excluded, not counted as $0", () => {
  const t = computeVerifiedTotals([campaign("a")], []);
  assert.equal(t.hasVerifiedData, false);
  assert.deepEqual(t.excluded.map((e) => e.reason), ["no_valid_report"]);
});

test("uses the latest cumulative report, not the sum of snapshots", () => {
  const t = computeVerifiedTotals([campaign("a")], [report("a", 10_000, "2027-03-01"), report("a", 25_000, "2027-03-15"), report("a", 40_000, "2027-04-01")]);
  assert.equal(t.totalCents, 40_000);
  assert.equal(t.lastVerifiedAt, "2027-04-01T12:00:00Z");
});

test("a correction (e.g. refund) supersedes the report it replaces, even with the same as-of date", () => {
  const original = report("a", 50_000, "2027-04-01", { id: "orig" });
  const corrected = report("a", 47_500, "2027-04-01", { id: "fix", kind: "correction", supersedesReportId: "orig", verifiedAt: "2027-04-03T09:00:00Z" });
  const t = computeVerifiedTotals([campaign("a")], [original, corrected]);
  assert.equal(t.totalCents, 47_500);
});

test("voided reports and invalid amounts are ignored", () => {
  const good = report("a", 20_000, "2027-03-01");
  const voided = report("a", 99_999, "2027-03-10", { voided: true });
  const negative = report("a", -5, "2027-03-11");
  const fractional = report("a", 12.5, "2027-03-12");
  assert.equal(latestValidReport([good, voided, negative, fractional])?.id, good.id);
});

test("a voided correction restores the report it tried to supersede", () => {
  const original = report("a", 30_000, "2027-03-01", { id: "o" });
  const badFix = report("a", 1_000, "2027-03-02", { id: "b", supersedesReportId: "o", voided: true });
  assert.equal(computeVerifiedTotals([campaign("a")], [original, badFix]).totalCents, 30_000);
});

test("sums across campaigns and groups by charity", () => {
  const t = computeVerifiedTotals(
    [campaign("a", { charityId: "st-jude" }), campaign("b", { charityId: "make-a-wish" }), campaign("c", { charityId: "st-jude" })],
    [report("a", 10_000, "2027-04-01"), report("b", 7_000, "2027-04-01"), report("c", 3_000, "2027-04-02")],
  );
  assert.equal(t.totalCents, 20_000);
  assert.deepEqual(
    t.byCharity.map((c) => [c.charityId, c.amountCents]),
    [
      ["st-jude", 13_000],
      ["make-a-wish", 7_000],
    ],
  );
});

test("a sub-campaign counted inside a parent campaign is not double counted", () => {
  const parent = campaign("week", { charityId: "st-jude" });
  const child = campaign("team-x", { charityId: "st-jude", includedInCampaignId: "week" });
  const t = computeVerifiedTotals([parent, child], [report("week", 100_000, "2027-04-05"), report("team-x", 15_000, "2027-04-05")]);
  assert.equal(t.totalCents, 100_000);
  assert.deepEqual(t.excluded.map((e) => [e.campaign.id, e.reason]), [["team-x", "counted_in_parent"]]);
});

test("a sub-campaign counts on its own when its parent has no verified report", () => {
  const t = computeVerifiedTotals(
    [campaign("week"), campaign("team-x", { includedInCampaignId: "week" })],
    [report("team-x", 15_000, "2027-04-05")],
  );
  assert.equal(t.totalCents, 15_000);
});

test("draft campaigns never count", () => {
  const t = computeVerifiedTotals([campaign("d", { status: "draft" })], [report("d", 5_000, "2027-01-02")]);
  assert.equal(t.hasVerifiedData, false);
  assert.equal(t.totalCents, 0);
});
