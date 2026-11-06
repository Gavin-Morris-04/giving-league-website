/**
 * Shared data models. These mirror the Supabase schema in `supabase/migrations/0001_init.sql` so the static
 * data files can later be replaced by database reads without touching components.
 */

export type CampusStatus = "participating" | "launching" | "not_yet";

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

export type City = { key: CityKey; name: string; lat: number; lng: number };

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
 * `event` — a specific dated volunteer event announced by the organization.
 */
export type ListingKind = "resource" | "event";

export type Organization = {
  slug: string;
  name: string;
  website: string;
  summary: string;
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
  groupEligibility: GroupEligibility;
  groupNotes?: string;
  frequency: Frequency;
  format: Format;
  /** Official registration or sign-up page on the organization's own system. */
  signupUrl: string;
  /** Official page describing the opportunity (may equal signupUrl). */
  infoUrl: string;
  /** Dates only for `event` listings, ISO yyyy-mm-dd. */
  startDate?: string;
  endDate?: string;
  status: "active" | "seasonal" | "paused";
  /** ISO date of the last manual check of every link and fact on this listing. */
  lastVerified: string;
  /** Data provenance. `verified` rows were checked against the official site; `example` rows are never shown. */
  provenance: "verified" | "example";
};

export type EventStatus = "concept" | "scheduled" | "completed" | "cancelled";

export type CommunityEvent = {
  slug: string;
  title: string;
  series: string;
  summary: string;
  description: string;
  cause: Cause;
  status: EventStatus;
  /** Only for scheduled/completed events. */
  startDate?: string;
  endDate?: string;
  cityKey?: CityKey;
  campuses?: string[];
  hostNote?: string;
  registrationUrl?: string;
  whatToExpect: string[];
  waysToHelp: string[];
};

/** Future Geaux Give Week campaign. All values null until an official campaign is live. */
export type FundraisingCampaign = {
  year: number;
  status: "planning" | "live" | "closed";
  beneficiary: string | null;
  startDate: string | null;
  endDate: string | null;
  /** Verified totals reported by the beneficiary's platform, keyed by university slug. */
  totals: Record<string, { raised: number; enrolled: number }> | null;
  topOrganizations: { name: string; university: string; raised: number }[] | null;
};

/** Form submissions (persisted to Supabase when configured). */
export type InquiryKind =
  | "contact"
  | "campus_representative"
  | "opportunity_submission"
  | "partnership"
  | "updates";

export type FormState = {
  status: "idle" | "success" | "error" | "not_configured";
  message?: string;
  fieldErrors?: Record<string, string>;
  /** Echo of submitted values so the form keeps them after a validation error. */
  values?: Record<string, string>;
};
