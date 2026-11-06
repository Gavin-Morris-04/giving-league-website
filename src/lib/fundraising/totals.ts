import type { FundraisingCampaignRecord, FundraisingReport } from "../types";

/**
 * Verified-donation arithmetic. Pure functions, no I/O — unit tested in tests/fundraising-totals.test.ts.
 *
 * Rules (from the product requirements):
 * 1. Only amounts reported by a charity's authorized system count. Clicks never count.
 * 2. Each report is a CUMULATIVE total for one campaign "as of" a date. The campaign's verified amount is its
 *    latest valid cumulative report — never the sum of historical snapshots.
 * 3. Corrections (refunds, chargebacks, adjustments) are new reports that supersede earlier ones; voided reports
 *    and reports that have been superseded are ignored.
 * 4. A campaign whose money is also counted inside another included campaign (`includedInCampaignId`) is left
 *    out of the overall total to prevent double counting.
 * 5. Draft campaigns, campaigns with no valid report, and invalid amounts are excluded — and reported as excluded.
 */

export type CampaignResult = {
  campaign: FundraisingCampaignRecord;
  amountCents: number;
  report: FundraisingReport;
};

export type ExcludedCampaign = {
  campaign: FundraisingCampaignRecord;
  reason: "draft" | "no_valid_report" | "counted_in_parent";
};

export type VerifiedTotals = {
  /** True only when at least one campaign has a valid, verified report. */
  hasVerifiedData: boolean;
  totalCents: number;
  byCharity: { charityId: string; amountCents: number; campaigns: CampaignResult[] }[];
  included: CampaignResult[];
  excluded: ExcludedCampaign[];
  /** Most recent verification timestamp among the reports used. */
  lastVerifiedAt: string | null;
};

function isValidAmount(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n) && Number.isInteger(n) && n >= 0;
}

/** The latest valid cumulative report for one campaign, or null. */
export function latestValidReport(reports: FundraisingReport[]): FundraisingReport | null {
  const live = reports.filter((r) => !r.voided && isValidAmount(r.reportedAmountCents));
  const superseded = new Set(live.map((r) => r.supersedesReportId).filter((id): id is string => Boolean(id)));
  const candidates = live.filter((r) => !superseded.has(r.id));
  if (!candidates.length) return null;
  return candidates.reduce((best, r) => {
    if (r.asOf !== best.asOf) return r.asOf > best.asOf ? r : best;
    return r.verifiedAt > best.verifiedAt ? r : best;
  });
}

export function computeVerifiedTotals(campaigns: FundraisingCampaignRecord[], reports: FundraisingReport[]): VerifiedTotals {
  const byCampaign = new Map<string, FundraisingReport[]>();
  for (const r of reports) {
    const list = byCampaign.get(r.campaignId) ?? [];
    list.push(r);
    byCampaign.set(r.campaignId, list);
  }

  const excluded: ExcludedCampaign[] = [];
  const results = new Map<string, CampaignResult>();

  for (const c of campaigns) {
    if (c.status === "draft") {
      excluded.push({ campaign: c, reason: "draft" });
      continue;
    }
    const latest = latestValidReport(byCampaign.get(c.id) ?? []);
    if (!latest) {
      excluded.push({ campaign: c, reason: "no_valid_report" });
      continue;
    }
    results.set(c.id, { campaign: c, amountCents: latest.reportedAmountCents, report: latest });
  }

  // Double-counting guard: drop a campaign whose parent is itself included with a verified total.
  const included: CampaignResult[] = [];
  for (const r of results.values()) {
    const parent = r.campaign.includedInCampaignId;
    if (parent && results.has(parent)) {
      excluded.push({ campaign: r.campaign, reason: "counted_in_parent" });
      continue;
    }
    included.push(r);
  }

  const charityMap = new Map<string, CampaignResult[]>();
  for (const r of included) {
    const list = charityMap.get(r.campaign.charityId) ?? [];
    list.push(r);
    charityMap.set(r.campaign.charityId, list);
  }

  const totalCents = included.reduce((s, r) => s + r.amountCents, 0);
  const lastVerifiedAt = included.reduce<string | null>((m, r) => (!m || r.report.verifiedAt > m ? r.report.verifiedAt : m), null);

  return {
    hasVerifiedData: included.length > 0,
    totalCents,
    byCharity: [...charityMap.entries()]
      .map(([charityId, list]) => ({ charityId, amountCents: list.reduce((s, r) => s + r.amountCents, 0), campaigns: list }))
      .sort((a, b) => b.amountCents - a.amountCents),
    included,
    excluded,
    lastVerifiedAt,
  };
}

export function formatUsd(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: cents % 100 === 0 ? 0 : 2 }).format(
    cents / 100,
  );
}
