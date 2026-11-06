export type NavItem = { label: string; href: string; badge?: string };

/** Full navigation, in order. Mobile shows all of it; desktop groups the last items under "More". */
export const primaryNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Find Volunteering", href: "/volunteer" },
  { label: "Charity Events", href: "/events" },
  { label: "College Campuses", href: "/campuses" },
  { label: "High Schools", href: "/high-schools" },
  { label: "Donate", href: "/donations" },
  { label: "Geaux Give Week", href: "/geaux-give-week", badge: "Coming Soon" },
  { label: "About Us", href: "/about" },
];

/** Shown inside the desktop "More" menu (to keep the bar uncluttered). */
export const desktopMoreHrefs = new Set(["/geaux-give-week", "/about"]);

export const ctaNav: NavItem = { label: "Contact", href: "/contact" };

export const footerNav: { heading: string; items: NavItem[] }[] = [
  {
    heading: "Programs",
    items: [
      { label: "Find Volunteering", href: "/volunteer" },
      { label: "Charity Events", href: "/events" },
      { label: "Donate", href: "/donations" },
      { label: "Geaux Give Week (Coming Soon)", href: "/geaux-give-week" },
    ],
  },
  {
    heading: "Students",
    items: [
      { label: "College Campuses", href: "/campuses" },
      { label: "High Schools", href: "/high-schools" },
      { label: "Submit an Opportunity", href: "/volunteer/submit" },
      { label: "Submit a Charity Event", href: "/events/submit" },
    ],
  },
  {
    heading: "Organization",
    items: [
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Photo Credits", href: "/credits" },
    ],
  },
  {
    heading: "Legal",
    items: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms & Limitations", href: "/terms" },
    ],
  },
];
