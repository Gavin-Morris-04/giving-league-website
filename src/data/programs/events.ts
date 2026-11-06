import type { CommunityEvent } from "@/lib/types";

/**
 * PROGRAM CONCEPTS — event series we intend to run. None is scheduled. When an event is confirmed, add a
 * new entry with status "scheduled", real dates, city, host campus(es) and a registration link.
 * Past events go in with status "completed" and appear in the Past Events section automatically.
 */
export const communityEvents: CommunityEvent[] = [
  {
    slug: "community-cleanup-day",
    title: "Community Cleanup Day",
    series: "Community Cleanup Day",
    summary: "Students from one or more campuses clean up a park, bayou bank or neighborhood alongside local partners.",
    description:
      "A half-day cleanup organized with a campus group and a local partner such as a parish beautification program. We would supply the plan, the sign-up and the follow-up; partners supply the site and the know-how.",
    cause: "environment",
    status: "concept",
    whatToExpect: ["A two- to three-hour shift outdoors", "Gloves, bags and a safety briefing from the host", "Work alongside students from other campuses"],
    waysToHelp: ["Suggest a site that needs attention", "Bring your student organization", "Help us find a local host partner"],
  },
  {
    slug: "campus-food-drive",
    title: "Campus Food Drive",
    series: "Campus Food Drive",
    summary: "A collection drive run by campus organizations, with every donation delivered to a local food bank.",
    description:
      "Student organizations collect non-perishable food over a set week and deliver it to an established food bank. Drives can run on one campus or as a friendly challenge between several.",
    cause: "hunger",
    status: "concept",
    whatToExpect: ["Collection bins in campus buildings", "A delivery day at a partner food bank", "A short tally shared with participating groups"],
    waysToHelp: ["Host a bin in your hall or chapter house", "Volunteer on delivery day", "Connect us with a food bank contact"],
  },
  {
    slug: "geaux-serve-day",
    title: "Geaux Serve Day",
    series: "Geaux Serve Day",
    summary: "One day, many sites: students spread across a city to volunteer with several nonprofits at once.",
    description:
      "A single service day where volunteers split into teams and serve at multiple nonprofit sites in the same city, then come back together at the end of the day.",
    cause: "community",
    status: "concept",
    whatToExpect: ["Team assignments at several nonprofit sites", "A morning kickoff and an afternoon wrap-up", "Projects for individuals and whole organizations"],
    waysToHelp: ["Recommend a nonprofit that could host a team", "Lead a team from your organization", "Help plan logistics"],
  },
  {
    slug: "community-rebuilding-day",
    title: "Community Rebuilding Day",
    series: "Community Rebuilding Day",
    summary: "A hands-on build or repair day with an established housing or disaster-recovery organization.",
    description:
      "Students join an established housing or recovery nonprofit for a supervised build or repair day. The host organization runs the site, training and safety; we bring the volunteers.",
    cause: "housing",
    status: "concept",
    whatToExpect: ["A supervised build or repair site", "Tools and safety gear from the host", "No construction experience required (host rules apply)"],
    waysToHelp: ["Sign up for announcements", "Bring a team of 5–10", "Introduce us to a housing nonprofit"],
  },
  {
    slug: "holiday-giving-campaign",
    title: "Holiday Giving Campaign",
    series: "Holiday Giving Campaign",
    summary: "A season of giving drives — coats, toys, supplies — benefiting established local charities.",
    description:
      "Over the holiday season, campuses collect specific items requested by established local charities, such as coats, toys or shelter supplies, and deliver them before the end of the semester.",
    cause: "community",
    status: "concept",
    whatToExpect: ["A short list of items charities actually need", "Drop-off points on participating campuses", "A delivery before winter break"],
    waysToHelp: ["Run a collection point", "Ask a local business to sponsor supplies", "Help with delivery"],
  },
];

export function getEvent(slug: string) {
  return communityEvents.find((e) => e.slug === slug);
}

export const upcomingEvents = communityEvents.filter((e) => e.status === "scheduled");
export const pastEvents = communityEvents.filter((e) => e.status === "completed");
export const eventConcepts = communityEvents.filter((e) => e.status === "concept");
