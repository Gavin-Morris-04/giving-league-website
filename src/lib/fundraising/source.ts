import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { fundraisingCampaigns, fundraisingReports } from "@/data/programs/fundraising";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/server";
import type { FundraisingCampaignRecord, FundraisingReport } from "@/lib/types";
import { computeVerifiedTotals, type VerifiedTotals } from "./totals";

type CampaignRow = {
  id: string;
  charity_id: string;
  campaign_name: string;
  campaign_identifier: string;
  campaign_url: string;
  currency: "USD";
  verification_method: FundraisingCampaignRecord["verificationMethod"];
  reporting_period_start: string;
  reporting_period_end: string | null;
  status: FundraisingCampaignRecord["status"];
  included_in_campaign_id: string | null;
};

type ReportRow = {
  id: string;
  campaign_id: string;
  reported_amount_cents: number;
  as_of: string;
  verified_at: string;
  source_reference: string;
  entered_by: string;
  kind: FundraisingReport["kind"];
  supersedes_report_id: string | null;
  voided: boolean;
  note: string | null;
};

/**
 * Verified donation totals for the Donations page.
 *
 * - Supabase configured → read `fundraising_campaigns` + `fundraising_reports` (append-only, staff-entered or
 *   imported from an approved integration).
 * - Not configured → the static records in src/data/programs/fundraising.ts (currently empty).
 *
 * Cached for an hour and tagged "fundraising" so an admin action can refresh it with revalidateTag.
 */
export async function getVerifiedTotals(): Promise<VerifiedTotals> {
  "use cache";
  cacheLife("hours");
  cacheTag("fundraising");

  if (!isSupabaseConfigured()) return computeVerifiedTotals(fundraisingCampaigns, fundraisingReports);

  const db = getSupabaseAdmin();
  if (!db) return computeVerifiedTotals(fundraisingCampaigns, fundraisingReports);

  const [campaignsRes, reportsRes] = await Promise.all([
    db.from("fundraising_campaigns").select("*").neq("status", "draft"),
    db.from("fundraising_reports").select("*"),
  ]);
  if (campaignsRes.error || reportsRes.error) {
    // Fail closed: show "coming soon" rather than a partial or wrong number.
    console.error("[fundraising] could not load verified totals", campaignsRes.error?.message, reportsRes.error?.message);
    return computeVerifiedTotals([], []);
  }

  const campaigns: FundraisingCampaignRecord[] = (campaignsRes.data as CampaignRow[]).map((r) => ({
    id: r.id,
    charityId: r.charity_id,
    campaignName: r.campaign_name,
    campaignIdentifier: r.campaign_identifier,
    campaignUrl: r.campaign_url,
    currency: r.currency,
    verificationMethod: r.verification_method,
    reportingPeriod: { start: r.reporting_period_start, end: r.reporting_period_end },
    status: r.status,
    includedInCampaignId: r.included_in_campaign_id,
  }));
  const reports: FundraisingReport[] = (reportsRes.data as ReportRow[]).map((r) => ({
    id: r.id,
    campaignId: r.campaign_id,
    reportedAmountCents: Number(r.reported_amount_cents),
    asOf: r.as_of,
    verifiedAt: r.verified_at,
    sourceReference: r.source_reference,
    enteredBy: r.entered_by,
    kind: r.kind,
    supersedesReportId: r.supersedes_report_id,
    voided: r.voided,
    note: r.note ?? undefined,
  }));
  return computeVerifiedTotals(campaigns, reports);
}
