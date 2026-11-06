import type { Opportunity } from "./types.ts";

type Dated = Pick<Opportunity, "kind" | "startDate" | "endDate">;

/** The last day a dated listing happens on, or null for ongoing resources. */
export function lastListingDay(o: Dated): string | null {
  return o.kind === "event" ? (o.endDate ?? o.startDate ?? null) : null;
}

/** True once every date of a dated listing is in the past. `today` is ISO yyyy-mm-dd. */
export function isEndedListing(o: Dated, today: string): boolean {
  const last = lastListingDay(o);
  return last !== null && last < today;
}

/** The later of two ISO dates (either may be missing). */
export function laterDate(a: string | null | undefined, b: string | null | undefined): string {
  return [a ?? "", b ?? ""].sort().at(-1) ?? "";
}
