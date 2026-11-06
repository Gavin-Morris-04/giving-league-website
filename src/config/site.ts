/**
 * Central brand + organization configuration.
 *
 * EVERYTHING that names or describes the organization lives here so it can be changed in one place when the
 * official name, domain, contacts and legal status are decided. Values marked `provisional` are development
 * placeholders and must be replaced before launch.
 */

export const site = {
  /** PROVISIONAL working name. The official nonprofit name has not been chosen. */
  name: "The Giving League",
  /** Short form used in tight spaces (mobile header, OG image). */
  shortName: "Giving League",
  /** Marks the name as a placeholder in development tooling and the README. */
  nameIsProvisional: true,

  tagline: "Connecting Students. Strengthening Communities.",

  mission:
    "To empower Louisiana college students to create meaningful change by connecting them with volunteer opportunities, organizing community service initiatives, and uniting universities in support of charitable causes.",

  vision:
    "To build Louisiana's leading student-driven community service network, where every college student has the opportunity, resources, and connections to make a positive impact in their community.",

  description:
    "A student-led initiative connecting Louisiana college students with volunteer opportunities, community service events, and Geaux Give Week — a statewide college fundraising challenge in development.",

  /** Honest one-line statement of legal status. Update when 501(c)(3) recognition is granted. */
  legalStatus:
    "An emerging, independent, student-led community service initiative. Not yet recognized by the IRS as a 501(c)(3) tax-exempt organization; contributions are not tax-deductible. Not affiliated with any university unless stated.",

  /** True only after an IRS determination letter is received. Several pages read this flag. */
  isTaxExempt: false,

  founded: {
    city: "Baton Rouge",
    /** Where the founder plans to run the organization after graduation. */
    futureHome: "New Orleans",
    state: "Louisiana",
  },

  /**
   * PROVISIONAL production URL. Used for canonical URLs, sitemap and Open Graph.
   * Set NEXT_PUBLIC_SITE_URL in the environment to override.
   */
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    // Vercel sets this automatically to the project's production domain.
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000"),

  /**
   * Contact channels. `null` means "not set up yet": the UI shows the contact form instead of inventing an
   * address. Set a value only after the inbox/account actually exists.
   */
  contact: {
    email: null as string | null,
    phone: null as string | null,
  },

  /** Social accounts. `null` = not created yet; the footer renders a "coming soon" label, not a dead link. */
  social: {
    instagram: null as string | null,
    tiktok: null as string | null,
    linkedin: null as string | null,
  },

  /**
   * Founder profile. Kept unpublished until the founder approves the text and photo.
   * Set `published: true` and fill the fields to show it on /about.
   */
  founder: {
    published: false as boolean,
    name: "" as string,
    role: "Founder",
    school: "Louisiana State University",
    bio: "" as string,
    photo: null as string | null,
  },

  /** Flagship event facts. Nothing here is confirmed; the UI labels it as in development. */
  flagship: {
    name: "Geaux Give Week",
    status: "In Development — Spring 2027",
    statusLong: "Planned for Spring 2027 — Details Coming Soon",
    /** Set to an ISO date only once confirmed with universities and the beneficiary. */
    startDate: null as string | null,
    /** Name of the approved beneficiary charity, once confirmed in writing. */
    beneficiary: null as string | null,
    days: 5,
  },

  /** Date the directory was last verified end-to-end (ISO). */
  directoryVerifiedOn: "2026-11-06",
} as const;

export type Site = typeof site;
