/**
 * Central brand + organization configuration.
 *
 * EVERYTHING that names or describes the organization lives here so it can be changed in one place when the
 * official name, domain, contacts and legal status are decided. Values marked `provisional` are development
 * placeholders and must be replaced before launch.
 */

export const site = {
  /** Official name. The pelican emblem lives in src/assets/brand and public/brand. */
  name: "The Cause Krewe",
  /** Short form used in tight spaces (mobile header, OG image). */
  shortName: "Cause Krewe",
  nameIsProvisional: false,

  tagline: "Connecting Students. Strengthening Communities.",

  mission:
    "To empower high school and college students across Louisiana to create meaningful change through accessible volunteer opportunities, community service, charitable giving, and collaboration.",

  vision:
    "To build Louisiana's leading student-driven service network, connecting young people with the organizations, resources, and opportunities needed to make a lasting difference.",

  /** Organization description (used in metadata and the homepage). */
  description:
    "We connect Louisiana high school and college students with meaningful opportunities to volunteer, support charitable causes, and strengthen their communities.",

  /** Who we serve. Geaux Give Week is the exception: it is college-only. */
  audience: "High school and college students throughout Louisiana",

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

  /** Official social accounts. Instagram is the only one. */
  social: {
    instagram: "https://www.instagram.com/thecausekrewe/",
    instagramHandle: "@thecausekrewe",
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

  /**
   * Geaux Give Week — a FUTURE, college-only statewide fundraising competition. High schools and high school
   * students do not take part. Nothing here is confirmed; the UI labels it "Coming Soon".
   */
  flagship: {
    name: "Geaux Give Week",
    status: "Coming Soon",
    statusLong: "Coming Soon — details will be announced as plans and partnerships are finalized",
    collegeOnly: true,
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
