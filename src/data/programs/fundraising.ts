import type { FundraisingCampaignRecord, FundraisingReport } from "@/lib/types";

/**
 * Verified fundraising campaigns and their reports — the ONLY source of the Donations page impact total.
 *
 * Both lists are intentionally empty: no charity has created an attributable fundraising campaign for us yet.
 * Do not add rows here (or in Supabase) unless the charity's authorized reporting system confirms the amount.
 * Link clicks are tracked separately and are never donations.
 *
 * When Supabase is configured, src/lib/fundraising/source.ts reads these tables from the database instead.
 */
export const fundraisingCampaigns: FundraisingCampaignRecord[] = [];
export const fundraisingReports: FundraisingReport[] = [];
