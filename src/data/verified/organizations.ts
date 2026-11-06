import type { Organization } from "@/lib/types";

/**
 * VERIFIED LIVE DATA — organizations whose official websites and volunteer pages were checked on the date in
 * each opportunity's `lastVerified` field. Listing an organization here does NOT mean it partners with us.
 */
export const organizations: Organization[] = [
  {
    slug: "greater-baton-rouge-food-bank",
    name: "Greater Baton Rouge Food Bank",
    website: "https://brfoodbank.org",
    summary: "Regional food bank serving the Baton Rouge area through partner agencies and programs.",
  },
  {
    slug: "second-harvest",
    name: "Second Harvest Food Bank of Greater New Orleans and Acadiana",
    website: "https://no-hunger.org",
    summary: "Food bank with volunteer operations in New Orleans, Lafayette, Lake Charles and Houma.",
  },
  {
    slug: "habitat-baton-rouge",
    name: "Habitat for Humanity of Greater Baton Rouge",
    website: "https://habitatbrla.org",
    summary: "Builds and repairs affordable homes with volunteers and operates two Baton Rouge ReStores.",
  },
  {
    slug: "habitat-new-orleans",
    name: "New Orleans Area Habitat for Humanity",
    website: "https://habitat-nola.org",
    summary: "Affordable homeownership organization in the New Orleans area; volunteer shifts are posted on GivePulse.",
  },
  {
    slug: "habitat-lafayette",
    name: "Lafayette Habitat for Humanity",
    website: "https://habitatlafayette.org",
    summary: "Builds homes alongside future homeowners in Lafayette and runs a ReStore.",
  },
  {
    slug: "companion-animal-alliance",
    name: "Companion Animal Alliance",
    website: "https://www.caabr.org",
    summary: "Baton Rouge's animal shelter and adoption organization.",
  },
  {
    slug: "louisiana-spca",
    name: "Louisiana SPCA",
    website: "https://www.louisianaspca.org",
    summary: "Animal welfare organization and shelter in New Orleans.",
  },
  {
    slug: "handson-new-orleans",
    name: "HandsOn New Orleans",
    website: "https://www.handsonneworleans.org",
    summary: "Volunteer center that runs resident-led service projects and recruits volunteers for 200+ nonprofit partners.",
  },
  {
    slug: "volunteer-louisiana",
    name: "Volunteer Louisiana",
    website: "https://volunteerlouisiana.gov",
    summary: "Louisiana's state service commission, housed in the Office of the Lieutenant Governor.",
  },
  {
    slug: "keep-louisiana-beautiful",
    name: "Keep Louisiana Beautiful",
    website: "https://keeplouisianabeautiful.org",
    summary: "State litter-prevention and beautification program that organizes Love the Boot Week.",
  },
  {
    slug: "crcl",
    name: "Coalition to Restore Coastal Louisiana",
    website: "https://www.crcl.org",
    summary: "Coastal restoration nonprofit running volunteer plantings, reef builds and oyster shell recycling.",
  },
  {
    slug: "strongward",
    name: "Strongward (formerly SBP)",
    website: "https://wearestrongward.org",
    summary: "Long-term disaster recovery organization that helps families rebuild and return home.",
  },
  {
    slug: "red-cross-louisiana",
    name: "American Red Cross Louisiana Region",
    website: "https://www.redcross.org/local/louisiana.html",
    summary: "Regional chapter of the American Red Cross.",
  },
  {
    slug: "food-bank-northeast-louisiana",
    name: "Food Bank of Northeast Louisiana",
    website: "https://foodbanknela.org",
    summary: "Food bank based in Monroe serving northeast Louisiana.",
  },
  {
    slug: "food-bank-central-louisiana",
    name: "The Food Bank of Central Louisiana",
    website: "https://www.fbcenla.org",
    summary: "Food bank based in Alexandria serving central Louisiana.",
  },
  {
    slug: "svdp-baton-rouge",
    name: "St. Vincent de Paul of Baton Rouge",
    website: "https://www.svdpbr.net",
    summary: "Runs a Dining Room open 365 days a year, shelters, a charitable pharmacy and thrift stores.",
  },
  {
    slug: "ebr-council-on-aging",
    name: "East Baton Rouge Council on Aging",
    website: "https://ebrcoa.org",
    summary: "Serves older adults in East Baton Rouge Parish through Meals on Wheels and senior centers.",
  },
  {
    slug: "big-buddy",
    name: "Big Buddy Program",
    website: "https://www.bigbuddyprogram.org",
    summary: "Baton Rouge youth mentoring nonprofit.",
  },
  {
    slug: "breada",
    name: "BREADA (Red Stick Farmers Market)",
    website: "https://breada.org",
    summary: "Nonprofit behind the Red Stick Farmers Market in Baton Rouge.",
  },
  {
    slug: "audubon",
    name: "Audubon Nature Institute",
    website: "https://audubonnatureinstitute.org",
    summary: "Runs the Audubon Zoo, Aquarium and other nature attractions in New Orleans.",
  },
  {
    slug: "ochsner",
    name: "Ochsner Health",
    website: "https://www.ochsner.org",
    summary: "Louisiana health system with a hospital volunteer program.",
  },
];

export function getOrganization(slug: string) {
  return organizations.find((o) => o.slug === slug);
}
