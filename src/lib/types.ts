/**
 * Shared data models. These mirror the Supabase schema in `supabase/migrations/` so the static data files can
 * later be replaced by database reads without touching components.
 */

export type CampusStatus = "participating" | "launching" | "not_yet";
export type SchoolLevel = "high_school" | "college";

/** A Louisiana college or university. High schools are discovered by city (see /schools). */
export type University = {
  slug: string;
  name: string;
  shortName: string;
  city: string;
  /** City key used to join with opportunities (see `cities.ts`). */
  cityKey: CityKey;
  lat: number;
  lng: number;
  website: string;
  /** Default `not_yet`. Only change after a written agreement with a campus organization. */
  status: CampusStatus;
  /** Confirmed student leadership contact. `null` until someone has formally agreed to be listed. */
  studentContact: { name: string; role: string; email?: string } | null;
};

export type CityKey =
  | "baton-rouge"
  | "new-orleans"
  | "lafayette"
  | "hammond"
  | "ruston"
  | "grambling"
  | "monroe"
  | "natchitoches"
  | "lake-charles"
  | "thibodaux"
  | "houma"
  | "alexandria"
  | "statewide";

export type RegionKey = "capital" | "greater-new-orleans" | "acadiana" | "southwest" | "north" | "central" | "bayou" | "northshore" | "statewide";

export type City = { key: CityKey; name: string; lat: number; lng: number; region: RegionKey };

export type Cause =
  | "hunger"
  | "housing"
  | "animals"
  | "environment"
  | "disaster"
  | "youth"
  | "seniors"
  | "health"
  | "community";

export type GroupEligibility = "individuals" | "groups" | "both";
export type Frequency = "one_time" | "recurring" | "flexible";
export type Format = "in_person" | "remote" | "hybrid";

/**
 * `resource` — an ongoing way to volunteer with an organization (no specific date; check their calendar).
 * `event` — a specific dated volunteer event announced by the organization. (Charity events live in their own
 * directory — see CharityEvent — so the volunteer finder now holds ongoing resources only.)
 */
export type ListingKind = "resource" | "event";

/**
 * Youth eligibility as published by the hosting organization. Never inferred: if the organization doesn't say,
 * the value is "unverified" and the UI shows "Check with organizer".
 */
export type MinorPolicy =
  | "allowed" // minors may volunteer on their own (above any minimum age)
  | "with_guardian_consent" // minors need a signed parent/guardian waiver or consent form
  | "with_adult" // minors must be accompanied by an adult
  | "youth_program" // the organization runs a separate teen / junior / youth-group track
  | "adults_only" // 18+ only
  | "unverified";

export type Eligibility = {
  /** Minimum age stated by the organization, or null when none is stated. */
  minimumAge: number | null;
  minors: MinorPolicy;
  /** Parent/guardian permission needed for volunteers under 18? */
  guardianPermission: "required" | "not_required" | "unverified";
  /** Group / school-club volunteering explicitly supported? */
  schoolGroups: "yes" | "no" | "unverified";
  /** Short, factual note copied from the organization's rules (e.g. "Ages 12–15 must be with a parent"). */
  note?: string;
  /** When shifts run, as published. */
  days?: "weekdays" | "weekends" | "both" | "unverified";
  /** "yes" only when the organization says it records/verifies volunteer hours. */
  serviceHours?: "yes" | "unverified";
};

export type Organization = {
  slug: string;
  name: string;
  website: string;
  summary: string;
};

export type OpportunityRole = {
  name: string;
  /** Plain-language date and time, as published by the organizer. */
  when: string;
  /** The organizer's age rule for this role, verbatim in meaning — e.g. "Ages 14+ with an adult", "18+". */
  ages: string;
  signupUrl: string;
};

export type Opportunity = {
  slug: string;
  orgSlug: string;
  kind: ListingKind;
  title: string;
  /** One or two sentences, factual, drawn from the organization's own volunteer page. */
  summary: string;
  description: string;
  cause: Cause;
  secondaryCauses?: Cause[];
  cityKey: CityKey;
  /** Human-readable service area, e.g. "Greater Baton Rouge". */
  serviceArea: string;
  /** Street or district only — never a full postal address. */
  location: string;
  nearbyCampuses: string[];
  timeCommitment: string;
  requirements: string[];
  minimumAge: number | null;
  eligibility: Eligibility;
  groupEligibility: GroupEligibility;
  groupNotes?: string;
  frequency: Frequency;
  format: Format;
  /** Official registration or sign-up page on the organization's own system. */
  signupUrl: string;
  /** Official page describing the opportunity (may equal signupUrl). */
  infoUrl: string;
  /** Dates only for `event` listings, ISO yyyy-mm-dd. Listings drop off the site after `endDate`. */
  startDate?: string;
  endDate?: string;
  /** Individual roles or shifts, each with its own sign-up page and its own age rule as the organizer states it. */
  roles?: OpportunityRole[];
  status: "active" | "seasonal" | "paused";
  /** ISO date of the last manual check of every link and fact on this listing. */
  lastVerified: string;
  /** Data provenance. `verified` rows were checked against the official site; `example` rows are never shown. */
  provenance: "verified" | "example";
};

/* ── Charity events directory ──────────────────────────────────────────── */

export type CharityEventType =
  | "walk_run"
  | "ride"
  | "golf"
  | "gala"
  | "collection_drive"
  | "toy_drive"
  | "cleanup"
  | "build"
  | "other";

/**
 * `one_time` — a single event; `annual` — held once a year; `seasonal` — runs for a season (e.g. holiday toy
 * drives); `unconfirmed` — held before, but the organizer hasn't said it will repeat.
 */
export type Recurrence = "one_time" | "annual" | "seasonal" | "unconfirmed";

export type Participation = "participate" | "donate_items" | "volunteer" | "fundraise" | "attend";

/**
 * A scheduled or recurring charitable gathering, campaign, fundraiser, run, walk or community initiative hosted
 * by an established organization. Separate from volunteer Opportunities on purpose.
 */
export type CharityEvent = {
  slug: string;
  name: string;
  host: string;
  hostUrl: string;
  description: string;
  summary: string;
  type: CharityEventType;
  cause: Cause;
  cityKey: CityKey;
  /** Street or district only. */
  location: string;
  recurrence: Recurrence;
  /** Months (1–12) the event typically happens, from the organizer's past editions. */
  typicalMonths: number[];
  /** Plain-language timing, e.g. "Typically held in early fall". */
  typicalTiming: string;
  /**
   * The NEXT occurrence, only when confirmed on the organizer's official site. Never last year's date.
   * `time` is optional, local time text as published.
   */
  confirmed?: { startDate: string; endDate?: string; time?: string; source: string };
  /** The most recent past occurrence, when known — shown as history, never as the next date. */
  lastHeld?: { startDate: string; endDate?: string; source: string };
  participation: Participation[];
  cost: "free" | "paid" | "varies" | "unverified";
  /** Who may take part, as published. "unverified" shows "Check with organizer". */
  audience: {
    highSchool: "yes" | "with_guardian" | "with_adult" | "no" | "unverified";
    college: "yes" | "unverified";
    note?: string;
  };
  registrationUrl: string;
  infoUrl: string;
  lastVerified: string;
  provenance: "verified" | "example";
};

/* ── Donations ─────────────────────────────────────────────────────────── */

export type CharityCause =
  | "childrens_health"
  | "medical_research"
  | "als_support"
  | "hunger"
  | "animals"
  | "environment"
  | "housing"
  | "community";

export type Charity = {
  id: string;
  name: string;
  /** Used in the button label, e.g. "Donate to Team Gleason". */
  shortName: string;
  description: string;
  cause: CharityCause;
  scope: string;
  websiteUrl: string;
  /** The charity's own official donation page. */
  officialDonationUrl: string;
  /** A dedicated fundraising page created for our organization, once the charity provides one. */
  campaignDonationUrl: string | null;
  /** "none" until an attributable campaign exists; "manual" / "integration" once totals can be verified. */
  trackingStatus: "none" | "pending_setup" | "manual" | "integration";
  verificationStatus: "verified" | "unverified";
  lastVerified: string;
  /* Optional corporate-giving information — populated only from the charity's own official pages. */
  corporateGivingAvailable?: boolean;
  /** Information or inquiry page for business giving (NOT a payment page). */
  corporateGivingUrl?: string | null;
  workplaceGivingUrl?: string | null;
  matchingGiftUrl?: string | null;
  corporateGivingDescription?: string | null;
};

export type VerificationMethod = "charity_campaign_report" | "approved_integration" | "manual_official_report";

/** A fundraising campaign a charity created for us (Method A), possibly fed by an integration (Method B). */
export type FundraisingCampaignRecord = {
  id: string;
  charityId: string;
  campaignName: string;
  /** The charity platform's own campaign/page identifier. */
  campaignIdentifier: string;
  campaignUrl: string;
  currency: "USD";
  verificationMethod: VerificationMethod;
  reportingPeriod: { start: string; end: string | null };
  status: "draft" | "active" | "closed";
  /** Set when this campaign's money is ALSO counted inside another included campaign (prevents double counting). */
  includedInCampaignId?: string | null;
};

/**
 * One verified report of a campaign's CUMULATIVE total, as stated by the charity's authorized system.
 * Reports are append-only history. A correction (refund, chargeback, adjustment) is a new report with a new
 * cumulative total and `supersedesReportId`; `voided` reports are ignored.
 */
export type FundraisingReport = {
  id: string;
  campaignId: string;
  /** Cumulative verified total in cents, as of `asOf`. */
  reportedAmountCents: number;
  asOf: string;
  verifiedAt: string;
  sourceReference: string;
  enteredBy: string;
  kind: "cumulative" | "correction";
  supersedesReportId?: string | null;
  voided?: boolean;
  note?: string;
};

/** Geaux Give Week (college-only). All values null until an official campaign exists. */
export type GgwCampaign = {
  year: number | null;
  status: "planning" | "live" | "closed";
  beneficiary: string | null;
  startDate: string | null;
  endDate: string | null;
};

/* ── Forms ─────────────────────────────────────────────────────────────── */

export type InquiryKind =
  | "contact"
  | "campus_representative"
  | "opportunity_submission"
  | "charity_event_submission"
  | "updates";

export type FormState = {
  status: "idle" | "success" | "error" | "not_configured";
  message?: string;
  fieldErrors?: Record<string, string>;
  /** Echo of submitted values so the form keeps them after a validation error. */
  values?: Record<string, string>;
};
