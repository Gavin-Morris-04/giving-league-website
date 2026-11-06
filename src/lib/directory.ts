import { cities, getUniversity, milesBetween, NEARBY_RADIUS_MILES, universities } from "@/data/reference/geography";
import { getOrganization } from "@/data/verified/organizations";
import { verifiedOpportunities } from "@/data/verified/opportunities";
import type { Cause, Format, Frequency, GroupEligibility, ListingKind, Opportunity, University } from "@/lib/types";

/** Campuses within NEARBY_RADIUS_MILES of a city. Statewide listings are near every campus. */
function campusesNear(cityKey: Opportunity["cityKey"]): string[] {
  if (cityKey === "statewide") return universities.map((u) => u.slug);
  const c = cities[cityKey];
  return universities.filter((u) => milesBetween(u, c) <= NEARBY_RADIUS_MILES).map((u) => u.slug);
}

/** All publishable listings. Only `provenance: "verified"` rows are ever shown. */
export const opportunities: Opportunity[] = verifiedOpportunities
  .filter((o) => o.provenance === "verified")
  .map((o) => ({ ...o, nearbyCampuses: o.nearbyCampuses ?? campusesNear(o.cityKey) }));

export function getOpportunity(slug: string) {
  return opportunities.find((o) => o.slug === slug);
}

export function opportunitiesNearCampus(slug: string) {
  return opportunities.filter((o) => o.nearbyCampuses.includes(slug));
}

export function localOpportunitiesNearCampus(slug: string) {
  return opportunities.filter((o) => o.cityKey !== "statewide" && o.nearbyCampuses.includes(slug));
}

export function distanceFromCampus(o: Opportunity, campus: University) {
  if (o.cityKey === "statewide") return 0;
  return milesBetween(campus, cities[o.cityKey]);
}

export function orgName(o: Opportunity) {
  return getOrganization(o.orgSlug)?.name ?? o.orgSlug;
}

export type DirectoryFilters = {
  q: string;
  campus: string;
  city: string;
  causes: Cause[];
  group: "any" | Exclude<GroupEligibility, "both">;
  frequency: "any" | Exclude<Frequency, "flexible">;
  format: "any" | Format;
  kind: "any" | ListingKind;
  sort: "nearest" | "az" | "verified";
};

export const defaultFilters: DirectoryFilters = {
  q: "",
  campus: "",
  city: "",
  causes: [],
  group: "any",
  frequency: "any",
  format: "any",
  kind: "any",
  sort: "nearest",
};

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

export function filterOpportunities(list: Opportunity[], f: DirectoryFilters): Opportunity[] {
  const campus = getUniversity(f.campus);
  const terms = norm(f.q).split(/\s+/).filter(Boolean);

  const out = list.filter((o) => {
    if (campus && !o.nearbyCampuses.includes(campus.slug)) return false;
    // Statewide listings stay visible under any city, since they serve every city.
    if (f.city && o.cityKey !== f.city && o.cityKey !== "statewide") return false;
    if (f.causes.length && !f.causes.some((c) => c === o.cause || o.secondaryCauses?.includes(c))) return false;
    if (f.group === "groups" && o.groupEligibility === "individuals") return false;
    if (f.group === "individuals" && o.groupEligibility === "groups") return false;
    // "flexible" listings accept both one-time and recurring volunteers.
    if (f.frequency !== "any" && o.frequency !== "flexible" && o.frequency !== f.frequency) return false;
    if (f.format === "remote" && o.format === "in_person") return false;
    if (f.format === "in_person" && o.format === "remote") return false;
    if (f.format === "hybrid" && o.format !== "hybrid") return false;
    if (f.kind !== "any" && o.kind !== f.kind) return false;
    if (terms.length) {
      const hay = norm(
        [o.title, o.summary, o.description, orgName(o), o.serviceArea, o.location, cities[o.cityKey].name, o.cause].join(" "),
      );
      if (!terms.every((t) => hay.includes(t))) return false;
    }
    return true;
  });

  const byName = (a: Opportunity, b: Opportunity) => orgName(a).localeCompare(orgName(b)) || a.title.localeCompare(b.title);

  if (f.sort === "az") return out.sort(byName);
  if (f.sort === "verified") return out.sort((a, b) => b.lastVerified.localeCompare(a.lastVerified) || byName(a, b));
  // nearest: local listings by distance from the chosen campus, statewide listings after them.
  if (campus) {
    return out.sort((a, b) => {
      const sa = a.cityKey === "statewide" ? 1 : 0;
      const sb = b.cityKey === "statewide" ? 1 : 0;
      if (sa !== sb) return sa - sb;
      return distanceFromCampus(a, campus) - distanceFromCampus(b, campus) || byName(a, b);
    });
  }
  // No campus chosen: dated events first, then local listings, then statewide.
  return out.sort((a, b) => {
    const ka = a.kind === "event" ? 0 : a.cityKey === "statewide" ? 2 : 1;
    const kb = b.kind === "event" ? 0 : b.cityKey === "statewide" ? 2 : 1;
    return ka - kb || byName(a, b);
  });
}

/** Cities that actually have listings, for the city filter. */
export function citiesWithListings() {
  const keys = new Set(opportunities.map((o) => o.cityKey));
  return Object.values(cities).filter((c) => keys.has(c.key));
}

export const labels = {
  kind: { resource: "Ongoing resource", event: "Dated event" } satisfies Record<ListingKind, string>,
  group: { individuals: "Individuals", groups: "Groups", both: "Individuals & groups" } satisfies Record<GroupEligibility, string>,
  frequency: { one_time: "One-time", recurring: "Recurring", flexible: "One-time or recurring" } satisfies Record<Frequency, string>,
  format: { in_person: "In person", remote: "Remote", hybrid: "In person or remote" } satisfies Record<Format, string>,
};
