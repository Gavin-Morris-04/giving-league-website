/**
 * Exports the site's verified data as JSON for the Python discovery job (no dependencies, no network).
 * Run: node --experimental-strip-types scripts/export-snapshot.ts
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { cities, universities } from "../src/data/reference/geography.ts";
import { serviceAreas } from "../src/data/reference/locations.ts";
import { charityEvents } from "../src/data/verified/charity-events.ts";
import { organizations } from "../src/data/verified/organizations.ts";
import { verifiedOpportunities } from "../src/data/verified/opportunities.ts";

const snapshot = {
  exportedAt: new Date().toISOString(),
  cities,
  universities: universities.map((u) => ({ slug: u.slug, name: u.name, cityKey: u.cityKey })),
  serviceAreas: serviceAreas.map((a) => ({ slug: a.slug, cityKey: a.cityKey, name: a.name, surrounding: a.surrounding })),
  organizations,
  opportunities: verifiedOpportunities.map((o) => ({
    slug: o.slug,
    orgSlug: o.orgSlug,
    title: o.title,
    cityKey: o.cityKey,
    signupUrl: o.signupUrl,
    infoUrl: o.infoUrl,
    minimumAge: o.eligibility.minimumAge,
    minors: o.eligibility.minors,
  })),
  events: charityEvents.map((e) => ({
    slug: e.slug,
    name: e.name,
    cityKey: e.cityKey,
    registrationUrl: e.registrationUrl,
    infoUrl: e.infoUrl,
    confirmed: e.confirmed ?? null,
    recurrence: e.recurrence,
  })),
};

mkdirSync("discovery/.cache", { recursive: true });
writeFileSync("discovery/.cache/snapshot.json", JSON.stringify(snapshot, null, 2));
console.log(`snapshot: ${snapshot.opportunities.length} opportunities, ${snapshot.events.length} events, ${snapshot.serviceAreas.length} areas`);
