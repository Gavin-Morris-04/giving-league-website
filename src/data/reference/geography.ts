import type { Cause, City, CityKey, RegionKey, University } from "@/lib/types";

/** City centroids (approximate) used for "near my campus" matching and sorting. */
export const cities: Record<CityKey, City> = {
  "baton-rouge": { key: "baton-rouge", name: "Baton Rouge", lat: 30.4515, lng: -91.1871, region: "capital" },
  "new-orleans": { key: "new-orleans", name: "New Orleans", lat: 29.9511, lng: -90.0715, region: "greater-new-orleans" },
  lafayette: { key: "lafayette", name: "Lafayette", lat: 30.2241, lng: -92.0198, region: "acadiana" },
  hammond: { key: "hammond", name: "Hammond", lat: 30.5044, lng: -90.4612, region: "northshore" },
  ruston: { key: "ruston", name: "Ruston", lat: 32.5232, lng: -92.6379, region: "north" },
  grambling: { key: "grambling", name: "Grambling", lat: 32.5277, lng: -92.714, region: "north" },
  monroe: { key: "monroe", name: "Monroe", lat: 32.5093, lng: -92.1193, region: "north" },
  natchitoches: { key: "natchitoches", name: "Natchitoches", lat: 31.7607, lng: -93.0863, region: "central" },
  "lake-charles": { key: "lake-charles", name: "Lake Charles", lat: 30.2266, lng: -93.2174, region: "southwest" },
  thibodaux: { key: "thibodaux", name: "Thibodaux", lat: 29.7958, lng: -90.8229, region: "bayou" },
  houma: { key: "houma", name: "Houma", lat: 29.5958, lng: -90.7195, region: "bayou" },
  alexandria: { key: "alexandria", name: "Alexandria", lat: 31.3113, lng: -92.4451, region: "central" },
  statewide: { key: "statewide", name: "Statewide", lat: 31.0, lng: -92.0, region: "statewide" },
};

export const regions: Record<RegionKey, string> = {
  capital: "Capital Region (Baton Rouge)",
  "greater-new-orleans": "Greater New Orleans",
  acadiana: "Acadiana",
  southwest: "Southwest Louisiana",
  north: "North Louisiana",
  central: "Central Louisiana",
  bayou: "Bayou Region",
  northshore: "Northshore & Florida Parishes",
  statewide: "Statewide",
};

/**
 * Louisiana universities used as geographic search options and prospective outreach targets.
 * NONE of these are partners. `status` stays "not_yet" until a campus organization formally joins.
 */
export const universities: University[] = [
  {
    slug: "lsu",
    name: "Louisiana State University",
    shortName: "LSU",
    city: "Baton Rouge",
    cityKey: "baton-rouge",
    lat: 30.4133,
    lng: -91.18,
    website: "https://www.lsu.edu",
    status: "not_yet",
    studentContact: null,
  },
  {
    slug: "southern",
    name: "Southern University and A&M College",
    shortName: "Southern",
    city: "Baton Rouge",
    cityKey: "baton-rouge",
    lat: 30.5236,
    lng: -91.191,
    website: "https://www.subr.edu",
    status: "not_yet",
    studentContact: null,
  },
  {
    slug: "tulane",
    name: "Tulane University",
    shortName: "Tulane",
    city: "New Orleans",
    cityKey: "new-orleans",
    lat: 29.94,
    lng: -90.1205,
    website: "https://tulane.edu",
    status: "not_yet",
    studentContact: null,
  },
  {
    slug: "uno",
    name: "University of New Orleans",
    shortName: "UNO",
    city: "New Orleans",
    cityKey: "new-orleans",
    lat: 30.0277,
    lng: -90.0675,
    website: "https://www.uno.edu",
    status: "not_yet",
    studentContact: null,
  },
  {
    slug: "loyola",
    name: "Loyola University New Orleans",
    shortName: "Loyola",
    city: "New Orleans",
    cityKey: "new-orleans",
    lat: 29.9349,
    lng: -90.1222,
    website: "https://www.loyno.edu",
    status: "not_yet",
    studentContact: null,
  },
  {
    slug: "ul-lafayette",
    name: "University of Louisiana at Lafayette",
    shortName: "UL Lafayette",
    city: "Lafayette",
    cityKey: "lafayette",
    lat: 30.2121,
    lng: -92.0193,
    website: "https://louisiana.edu",
    status: "not_yet",
    studentContact: null,
  },
  {
    slug: "southeastern",
    name: "Southeastern Louisiana University",
    shortName: "Southeastern",
    city: "Hammond",
    cityKey: "hammond",
    lat: 30.5157,
    lng: -90.4693,
    website: "https://www.southeastern.edu",
    status: "not_yet",
    studentContact: null,
  },
  {
    slug: "louisiana-tech",
    name: "Louisiana Tech University",
    shortName: "Louisiana Tech",
    city: "Ruston",
    cityKey: "ruston",
    lat: 32.5268,
    lng: -92.6487,
    website: "https://www.latech.edu",
    status: "not_yet",
    studentContact: null,
  },
  {
    slug: "ulm",
    name: "University of Louisiana at Monroe",
    shortName: "ULM",
    city: "Monroe",
    cityKey: "monroe",
    lat: 32.5282,
    lng: -92.0759,
    website: "https://www.ulm.edu",
    status: "not_yet",
    studentContact: null,
  },
  {
    slug: "grambling",
    name: "Grambling State University",
    shortName: "Grambling",
    city: "Grambling",
    cityKey: "grambling",
    lat: 32.524,
    lng: -92.7158,
    website: "https://www.gram.edu",
    status: "not_yet",
    studentContact: null,
  },
  {
    slug: "northwestern",
    name: "Northwestern State University",
    shortName: "Northwestern State",
    city: "Natchitoches",
    cityKey: "natchitoches",
    lat: 31.75,
    lng: -93.0977,
    website: "https://www.nsula.edu",
    status: "not_yet",
    studentContact: null,
  },
  {
    slug: "mcneese",
    name: "McNeese State University",
    shortName: "McNeese",
    city: "Lake Charles",
    cityKey: "lake-charles",
    lat: 30.1785,
    lng: -93.2141,
    website: "https://www.mcneese.edu",
    status: "not_yet",
    studentContact: null,
  },
  {
    slug: "nicholls",
    name: "Nicholls State University",
    shortName: "Nicholls",
    city: "Thibodaux",
    cityKey: "thibodaux",
    lat: 29.7911,
    lng: -90.8015,
    website: "https://www.nicholls.edu",
    status: "not_yet",
    studentContact: null,
  },
];

export const causes: Record<Cause, { label: string; description: string }> = {
  hunger: { label: "Hunger & food access", description: "Food banks, pantries, meal programs" },
  housing: { label: "Housing & rebuilding", description: "Home builds, repairs, ReStores" },
  animals: { label: "Animal welfare", description: "Shelters, adoption events, enrichment" },
  environment: { label: "Environment", description: "Cleanups, coastal restoration, planting" },
  disaster: { label: "Disaster recovery", description: "Response and long-term rebuilding" },
  youth: { label: "Youth & education", description: "Mentoring, tutoring, kids' programs" },
  seniors: { label: "Senior support", description: "Meal delivery, senior centers" },
  health: { label: "Health care", description: "Hospital and patient-support roles" },
  community: { label: "Community building", description: "Markets, neighborhood projects, events" },
};

export function getUniversity(slug: string | null | undefined) {
  return slug ? universities.find((u) => u.slug === slug) : undefined;
}

/** Great-circle distance in miles. */
export function milesBetween(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 3958.8;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** A listing counts as "near" a campus when its city centroid is within this many miles. */
export const NEARBY_RADIUS_MILES = 55;
