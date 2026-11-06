import { cities, regions, universities } from "./geography.ts";
import type { CityKey, University } from "../../lib/types.ts";

/**
 * ONE shared location configuration for College Campuses and High Schools.
 *
 * Service areas are derived from the college cities in `universities`. Adding a university in a new city
 * automatically creates the matching high school area and its /high-schools/<city> page. `areaDetails` only adds
 * optional extras (surrounding communities); an area without details still works.
 *
 * "Surrounding communities" help students outside city limits find their area; listings themselves are matched by
 * distance (about 55 miles), not by city name.
 */
export type ServiceArea = {
  slug: string;
  cityKey: CityKey;
  name: string;
  region: string;
  colleges: University[];
  surrounding: string[];
};

const areaDetails: Partial<Record<CityKey, { surrounding: string[] }>> = {
  "baton-rouge": { surrounding: ["Baker", "Central", "Zachary", "Denham Springs", "Walker", "Port Allen", "Prairieville", "Gonzales"] },
  "new-orleans": { surrounding: ["Metairie", "Kenner", "Gretna", "Marrero", "Chalmette", "Belle Chasse", "Slidell", "Mandeville"] },
  lafayette: { surrounding: ["Broussard", "Youngsville", "Carencro", "Scott", "Breaux Bridge", "New Iberia"] },
  hammond: { surrounding: ["Ponchatoula", "Amite City", "Independence", "Albany", "Springfield"] },
  ruston: { surrounding: ["Choudrant", "Dubach", "Simsboro", "Arcadia", "Farmerville"] },
  monroe: { surrounding: ["West Monroe", "Sterlington", "Calhoun", "Bastrop"] },
  grambling: { surrounding: ["Ruston", "Simsboro", "Arcadia"] },
  "lake-charles": { surrounding: ["Sulphur", "Westlake", "Moss Bluff", "Iowa", "DeQuincy"] },
  natchitoches: { surrounding: ["Campti", "Robeline", "Cloutierville"] },
  thibodaux: { surrounding: ["Houma", "Raceland", "Lockport", "Schriever", "Napoleonville"] },
};

const keys = [...new Set(universities.map((u) => u.cityKey))];

export const serviceAreas: ServiceArea[] = keys.map((cityKey) => ({
  slug: cityKey,
  cityKey,
  name: cities[cityKey].name,
  region: regions[cities[cityKey].region],
  colleges: universities.filter((u) => u.cityKey === cityKey),
  surrounding: areaDetails[cityKey]?.surrounding ?? [],
}));

export function getServiceArea(slug: string) {
  return serviceAreas.find((a) => a.slug === slug);
}
