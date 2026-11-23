import type { CharityEvent, Opportunity, Organization } from "@/lib/types";
import data from "./approved.json" with { type: "json" };

/**
 * Listings approved on a GitHub review issue (✅). The morning job proposes them, a person opens the official
 * page and ticks ✅, and scripts/review/cli.ts writes them to approved.json. The file is validated against
 * scripts/review/schema.ts before anything is written, so the cast below only restores the string unions that
 * JSON imports lose.
 */
export type ApprovedEntry<T> = { reviewId: string; approvedOn: string; reviewIssue: number | null; listing: T };

export type ApprovedListings = {
  organizations: Organization[];
  opportunities: ApprovedEntry<Omit<Opportunity, "nearbyCampuses">>[];
  events: ApprovedEntry<CharityEvent>[];
};

export const approved = data as unknown as ApprovedListings;
