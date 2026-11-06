export type NavItem = { label: string; href: string };

export const primaryNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Find Volunteering", href: "/volunteer" },
  { label: "Events", href: "/events" },
  { label: "Campuses", href: "/campuses" },
  { label: "Geaux Give Week", href: "/geaux-give-week" },
  { label: "About", href: "/about" },
];

export const ctaNav: NavItem = { label: "Get Involved", href: "/partners" };

export const footerNav: { heading: string; items: NavItem[] }[] = [
  {
    heading: "Programs",
    items: [
      { label: "Find Volunteering", href: "/volunteer" },
      { label: "Community Events", href: "/events" },
      { label: "Geaux Give Week", href: "/geaux-give-week" },
    ],
  },
  {
    heading: "Get involved",
    items: [
      { label: "Volunteer Finder", href: "/volunteer" },
      { label: "Campus Directory", href: "/campuses" },
      { label: "Submit an Opportunity", href: "/volunteer/submit" },
      { label: "Partner With Us", href: "/partners" },
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
