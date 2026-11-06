import { cities, getUniversity, milesBetween, NEARBY_RADIUS_MILES, universities } from "@/data/reference/geography";
import { getOrganization } from "@/data/verified/organizations";
import { verifiedOpportunities } from "@/data/verified/opportunities";
import { site } from "@/config/site";
import { discoveryGeneratedOn, isHiddenByDiscovery } from "@/lib/discovery";
import { isEndedListing, laterDate } from "@/lib/listing-dates";
import type { Cause, Format, Frequency, GroupEligibility, Opportunity, University } from "@/lib/types";

/** Campuses within NEARBY_RADIUS_MILES of a city. Statewide listings are near every campus. */
function campusesNear(cityKey: Opportunity["cityKey"]): string[] {
  if (cityKey === "statewide") return universities.map((u) => u.slug);
  const c = cities[cityKey];
  return universities.filter((u) => milesBetween(u, c) <= NEARBY_RADIUS_MILES).map((u) => u.slug);
}

/**
 * The newest date the build knows about (last manual verification or last merged discovery report). Pages are
 * static, so dated listings whose last day is before this are left out at build time; in the browser, the finder
 * and date badges also check the visitor's real date.
 */
export const directoryReferenceDate = laterDate(site.directoryVerifiedOn, discoveryGeneratedOn);

/** All publishable listings. Only `provenance: "verified"` rows are ever shown. */
export const opportunities: Opportunity[] = verifiedOpportunities
  .filter(
    (o) => o.provenance === "verified" && !isHiddenByDiscovery("opportunity", o.slug) && !isEndedListing(o, directoryReferenceDate),
  )
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

/** Listings within the nearby radius of a city (for high school, city-based discovery). */
export function opportunitiesNearCity(cityKey: Opportunity["cityKey"]) {
  const c = cities[cityKey];
  return opportunities.filter((o) => o.cityKey === "statewide" || o.cityKey === cityKey || milesBetween(cities[o.cityKey], c) <= NEARBY_RADIUS_MILES);
}

export function distanceFromCampus(o: Opportunity, campus: University) {
  if (o.cityKey === "statewide") return 0;
  return milesBetween(campus, cities[o.cityKey]);
}

export function orgName(o: Opportunity) {
  return getOrganization(o.orgSlug)?.name ?? o.orgSlug;
}

/* ── Youth eligibility (never assumed) ─────────────────────────────────── */

export type Fit = "yes" | "no" | "unverified";

/** Can a volunteer of `age` take part, per the organization's published rules? */
export function fitsAge(o: Opportunity, age: number): Fit {
  const e = o.eligibility;
  if (age >= 18) return e.minimumAge !== null && e.minimumAge > age ? "no" : "yes";
  if (e.minors === "adults_only") return "no";
  if (e.minimumAge !== null && age < e.minimumAge) return "no";
  if (e.minors === "unverified") return "unverified";
  return "yes";
}

/** High school students: ages 14–17. Eligible only when the organization publishes rules that allow it. */
export function fitsHighSchool(o: Opportunity): Fit {
  const e = o.eligibility;
  if (e.minors === "adults_only") return "no";
  if (e.minimumAge !== null && e.minimumAge >= 18) return "no";
  if (e.minors === "unverified") return "unverified";
  return "yes";
}

export function eligibilityLabel(o: Opportunity): { text: string; tone: "forest" | "gold" | "hollow" } {
  const e = o.eligibility;
  if (e.minors === "adults_only") return { text: "Ages 18+", tone: "hollow" };
  if (e.minors === "unverified") return { text: e.minimumAge ? `Ages ${e.minimumAge}+ · check with organizer` : "Eligibility not verified — check with organizer", tone: "hollow" };
  const min = e.minimumAge ? `Ages ${e.minimumAge}+` : null;
  switch (e.minors) {
    case "allowed":
      return { text: min ?? "Minors permitted", tone: "forest" };
    case "with_guardian_consent":
      return { text: min ?? "Minors permitted with guardian permission", tone: "forest" };
    case "with_adult":
      return { text: min ? `${min} · minors with an adult` : "Minors permitted with an adult", tone: "forest" };
    case "youth_program":
      return { text: "Teen / youth program available", tone: "forest" };
  }
}

/** Second label shown next to the age label, when it adds information. */
export function guardianLabel(o: Opportunity): string | null {
  if (o.eligibility.minors === "adults_only") return null;
  if (o.eligibility.guardianPermission === "required") return "Parent/guardian permission required";
  return null;
}

/* ── Filters ───────────────────────────────────────────────────────────── */

export type DirectoryFilters = {
  q: string;
  campus: string;
  city: string;
  level: "any" | "high_school" | "college";
  age: "any" | "14" | "16" | "18";
  guardian: "any" | "required" | "not_required";
  includeUnverified: boolean;
  days: "any" | "weekdays" | "weekends";
  serviceHours: boolean;
  causes: Cause[];
  group: "any" | Exclude<GroupEligibility, "both">;
  frequency: "any" | Exclude<Frequency, "flexible">;
  format: "any" | Format;
  sort: "nearest" | "az" | "verified";
};

export const defaultFilters: DirectoryFilters = {
  q: "",
  campus: "",
  city: "",
  level: "any",
  age: "any",
  guardian: "any",
  includeUnverified: false,
  days: "any",
  serviceHours: false,
  causes: [],
  group: "any",
  frequency: "any",
  format: "any",
  sort: "nearest",
};

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

function passesYouthFilters(o: Opportunity, f: DirectoryFilters) {
  const allow = (fit: Fit) => fit === "yes" || (fit === "unverified" && f.includeUnverified);
  if (f.level === "high_school" && !allow(fitsHighSchool(o))) return false;
  if (f.age !== "any" && !allow(fitsAge(o, Number(f.age)))) return false;
  if (f.guardian !== "any" && o.eligibility.guardianPermission !== f.guardian) return false;
  if (f.days !== "any") {
    const d = o.eligibility.days ?? "unverified";
    if (!(d === "both" || d === f.days || (d === "unverified" && f.includeUnverified))) return false;
  }
  if (f.serviceHours && o.eligibility.serviceHours !== "yes") return false;
  return true;
}

/** How many listings the youth filters hid only because the organization hasn't published age rules. */
export function hiddenAsUnverified(list: Opportunity[], f: DirectoryFilters) {
  if (f.includeUnverified || (f.level !== "high_school" && f.age === "any" && f.days === "any")) return 0;
  const strict = filterOpportunities(list, f).length;
  const loose = filterOpportunities(list, { ...f, includeUnverified: true }).length;
  return loose - strict;
}

export function filterOpportunities(list: Opportunity[], f: DirectoryFilters): Opportunity[] {
  const campus = getUniversity(f.campus);
  const terms = norm(f.q).split(/\s+/).filter(Boolean);
  const nearCity = f.city && f.city !== "statewide" ? new Set(opportunitiesNearCity(f.city as Opportunity["cityKey"]).map((o) => o.slug)) : null;

  const out = list.filter((o) => {
    if (campus && !o.nearbyCampuses.includes(campus.slug)) return false;
    // City filter = the city and its surrounding area; "statewide" = statewide programs only.
    if (f.city === "statewide" && o.cityKey !== "statewide") return false;
    if (nearCity && !nearCity.has(o.slug)) return false;
    if (!passesYouthFilters(o, f)) return false;
    if (f.causes.length && !f.causes.some((c) => c === o.cause || o.secondaryCauses?.includes(c))) return false;
    if (f.group === "groups" && o.groupEligibility === "individuals" && o.eligibility.schoolGroups !== "yes") return false;
    if (f.group === "individuals" && o.groupEligibility === "groups") return false;
    // "flexible" listings accept both one-time and recurring volunteers.
    if (f.frequency !== "any" && o.frequency !== "flexible" && o.frequency !== f.frequency) return false;
    if (f.format === "remote" && o.format === "in_person") return false;
    if (f.format === "in_person" && o.format === "remote") return false;
    if (f.format === "hybrid" && o.format !== "hybrid") return false;
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
  const origin = campus ?? (f.city && f.city !== "statewide" ? cities[f.city as Opportunity["cityKey"]] : null);
  if (origin) {
    return out.sort((a, b) => {
      const sa = a.cityKey === "statewide" ? 1 : 0;
      const sb = b.cityKey === "statewide" ? 1 : 0;
      if (sa !== sb) return sa - sb;
      return milesBetween(origin, cities[a.cityKey]) - milesBetween(origin, cities[b.cityKey]) || byName(a, b);
    });
  }
  // No location chosen: local listings first, statewide programs after.
  return out.sort((a, b) => (a.cityKey === "statewide" ? 1 : 0) - (b.cityKey === "statewide" ? 1 : 0) || byName(a, b));
}

/** Cities that actually have listings, for the city filter. */
export function citiesWithListings() {
  const keys = new Set(opportunities.map((o) => o.cityKey));
  for (const u of universities) keys.add(u.cityKey);
  return Object.values(cities).filter((c) => keys.has(c.key));
}

export const labels = {
  kind: { resource: "Ongoing opportunity", event: "Dated event" },
  group: { individuals: "Individuals", groups: "Groups", both: "Individuals & groups" } satisfies Record<GroupEligibility, string>,
  frequency: { one_time: "One-time", recurring: "Recurring", flexible: "One-time or recurring" } satisfies Record<Frequency, string>,
  format: { in_person: "In person", remote: "Remote", hybrid: "In person or remote" } satisfies Record<Format, string>,
  guardian: { required: "Guardian form required for minors", not_required: "No guardian form", unverified: "Guardian rules: check with organizer" },
};
