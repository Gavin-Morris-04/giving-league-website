import report from "@/data/discovery/report.json";

/**
 * Reads the reviewed daily-discovery report (merged via pull request). Listings whose official link failed on two
 * consecutive daily checks are hidden from every directory and city page until fixed. Other findings (possible
 * cancellations, differing age rules, new candidates) are for staff review only and never change the site on
 * their own.
 */
type Check = { status: string; consecutive_failures: number; flags: { type: string }[] };
const listings = ((report as { listings?: Record<string, Check> }).listings ?? {}) as Record<string, Check>;

export function isHiddenByDiscovery(kind: "opportunity" | "event", slug: string) {
  const c = listings[`${kind}:${slug}`];
  return Boolean(c?.flags.some((f) => f.type === "broken_link"));
}

export const discoveryGeneratedAt: string | null = (report as { generatedAt?: string }).generatedAt ?? null;
