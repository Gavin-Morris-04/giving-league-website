import "server-only";
import { revalidateTag } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { providerFor } from "./providers";

/**
 * Method C — verified manual reporting, and the Method B import job.
 *
 * These functions are server-only building blocks for the future staff dashboard. They are NOT exposed as
 * public routes or server actions. Before wiring them to a UI:
 *   1. Authenticate staff with Supabase Auth and confirm `public.is_staff('editor')` for the session.
 *   2. Call these from a server action that performs that check first.
 * The database enforces the same rule independently: `record_fundraising_report()` is SECURITY DEFINER and
 * refuses callers who aren't staff, and fundraising_reports is append-only (no UPDATE/DELETE policies).
 */
export type ManualReportInput = {
  campaignId: string;
  /** Cumulative total in cents, exactly as shown in the charity's official report. */
  reportedAmountCents: number;
  asOf: string;
  sourceReference: string;
  /** Staff user id (auth.users.id) of the person entering the report. */
  enteredBy: string;
  kind?: "cumulative" | "correction";
  supersedesReportId?: string | null;
  note?: string;
};

export async function recordVerifiedReport(input: ManualReportInput) {
  if (!Number.isInteger(input.reportedAmountCents) || input.reportedAmountCents < 0) {
    throw new Error("Reported amount must be a non-negative whole number of cents.");
  }
  if (!input.sourceReference.trim()) throw new Error("A source reference from the charity's report is required.");
  const db = getSupabaseAdmin();
  if (!db) throw new Error("Supabase is not configured.");
  const { error } = await db.rpc("record_fundraising_report", {
    p_campaign_id: input.campaignId,
    p_amount_cents: input.reportedAmountCents,
    p_as_of: input.asOf,
    p_source_reference: input.sourceReference,
    p_entered_by: input.enteredBy,
    p_kind: input.kind ?? "cumulative",
    p_supersedes_report_id: input.supersedesReportId ?? null,
    p_note: input.note ?? null,
  });
  if (error) throw new Error(`Could not record report: ${error.message}`);
  revalidateTag("fundraising", "max");
}

/** Import totals from approved integrations. Safe to run on a schedule; skips anything not configured. */
export async function syncIntegrationTotals(systemUserId: string) {
  const db = getSupabaseAdmin();
  if (!db) return { synced: 0, skipped: 0 };
  const { data, error } = await db.from("fundraising_campaigns").select("*").eq("verification_method", "approved_integration").eq("status", "active");
  if (error || !data) return { synced: 0, skipped: 0 };
  let synced = 0;
  let skipped = 0;
  for (const row of data) {
    const campaign = {
      id: row.id,
      charityId: row.charity_id,
      campaignName: row.campaign_name,
      campaignIdentifier: row.campaign_identifier,
      campaignUrl: row.campaign_url,
      currency: "USD" as const,
      verificationMethod: row.verification_method,
      reportingPeriod: { start: row.reporting_period_start, end: row.reporting_period_end },
      status: row.status,
    };
    const provider = providerFor(campaign);
    if (!provider?.isConfigured()) {
      skipped++;
      continue;
    }
    const total = await provider.fetchCumulativeTotal(campaign);
    await recordVerifiedReport({
      campaignId: campaign.id,
      reportedAmountCents: total.amountCents,
      asOf: total.asOf,
      sourceReference: total.sourceReference,
      enteredBy: systemUserId,
    });
    synced++;
  }
  return { synced, skipped };
}
