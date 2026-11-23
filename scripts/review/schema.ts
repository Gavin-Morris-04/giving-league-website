/**
 * What the morning Claude job may propose. Mirrors `src/lib/types.ts` (Opportunity, CharityEvent, Organization)
 * minus the fields the review scripts fill in themselves: slug, nearbyCampuses, lastVerified, provenance.
 * Anything that doesn't match is dropped before it reaches the review issue.
 */
import { z } from "zod";

export const CITY_KEYS = [
  "baton-rouge",
  "new-orleans",
  "lafayette",
  "hammond",
  "ruston",
  "grambling",
  "monroe",
  "natchitoches",
  "lake-charles",
  "thibodaux",
  "houma",
  "alexandria",
  "statewide",
] as const;

const CAUSES = ["hunger", "housing", "animals", "environment", "disaster", "youth", "seniors", "health", "community"] as const;

const text = (max: number) => z.string().trim().min(1).max(max);
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use yyyy-mm-dd");
const webUrl = z
  .string()
  .trim()
  .max(500)
  .refine((v) => /^https?:\/\/[^\s/]+\.[^\s]+$/i.test(v), "Must be a full http(s) link");
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase words joined by hyphens").max(80);
const cityKey = z.enum(CITY_KEYS);
const cause = z.enum(CAUSES);

export const organizationSchema = z
  .object({ slug, name: text(120), website: webUrl, summary: text(240) })
  .strict();

const eligibilitySchema = z
  .object({
    minimumAge: z.number().int().min(0).max(99).nullable(),
    minors: z.enum(["allowed", "with_guardian_consent", "with_adult", "youth_program", "adults_only", "unverified"]),
    guardianPermission: z.enum(["required", "not_required", "unverified"]),
    schoolGroups: z.enum(["yes", "no", "unverified"]),
    note: text(400).optional(),
    days: z.enum(["weekdays", "weekends", "both", "unverified"]).optional(),
    serviceHours: z.enum(["yes", "unverified"]).optional(),
  })
  .strict();

const roleSchema = z.object({ name: text(120), when: text(240), ages: text(120), signupUrl: webUrl }).strict();

export const opportunityListingSchema = z
  .object({
    orgSlug: slug,
    kind: z.enum(["resource", "event"]),
    title: text(120),
    summary: text(320),
    description: text(1600),
    cause,
    secondaryCauses: z.array(cause).max(3).optional(),
    cityKey,
    serviceArea: text(80),
    location: text(160),
    timeCommitment: text(200),
    requirements: z.array(text(300)).max(8),
    minimumAge: z.number().int().min(0).max(99).nullable(),
    eligibility: eligibilitySchema,
    groupEligibility: z.enum(["individuals", "groups", "both"]),
    groupNotes: text(300).optional(),
    frequency: z.enum(["one_time", "recurring", "flexible"]),
    format: z.enum(["in_person", "remote", "hybrid"]),
    signupUrl: webUrl,
    infoUrl: webUrl,
    startDate: isoDate.optional(),
    endDate: isoDate.optional(),
    roles: z.array(roleSchema).max(12).optional(),
    status: z.enum(["active", "seasonal", "paused"]),
  })
  .strict()
  .refine((o) => o.kind !== "event" || Boolean(o.startDate), { message: "Dated volunteer events need a startDate", path: ["startDate"] })
  .refine((o) => !o.endDate || !o.startDate || o.endDate >= o.startDate, { message: "endDate is before startDate", path: ["endDate"] })
  .refine((o) => o.minimumAge === o.eligibility.minimumAge, { message: "minimumAge must match eligibility.minimumAge", path: ["minimumAge"] });

const datedSchema = z.object({ startDate: isoDate, endDate: isoDate.optional(), time: text(80).optional(), source: text(240) }).strict();

export const eventListingSchema = z
  .object({
    name: text(120),
    host: text(120),
    hostUrl: webUrl,
    summary: text(320),
    description: text(1600),
    type: z.enum(["walk_run", "ride", "golf", "gala", "collection_drive", "toy_drive", "cleanup", "build", "other"]),
    cause,
    cityKey,
    location: text(160),
    recurrence: z.enum(["one_time", "annual", "seasonal", "unconfirmed"]),
    typicalMonths: z.array(z.number().int().min(1).max(12)).max(12),
    typicalTiming: text(120),
    confirmed: datedSchema.optional(),
    lastHeld: datedSchema.omit({ time: true }).optional(),
    participation: z.array(z.enum(["participate", "donate_items", "volunteer", "fundraise", "attend"])).min(1),
    cost: z.enum(["free", "paid", "varies", "unverified"]),
    audience: z
      .object({
        highSchool: z.enum(["yes", "with_guardian", "with_adult", "no", "unverified"]),
        college: z.enum(["yes", "unverified"]),
        note: text(300).optional(),
      })
      .strict(),
    registrationUrl: webUrl,
    infoUrl: webUrl,
  })
  .strict()
  .refine((e) => Boolean(e.confirmed), { message: "New charity events need a confirmed upcoming date", path: ["confirmed"] })
  .refine((e) => !e.confirmed?.endDate || e.confirmed.endDate >= e.confirmed.startDate, { message: "endDate is before startDate", path: ["confirmed"] });

const common = {
  /** The organizer's own page Claude read the facts from. */
  sourceUrl: webUrl,
  /** One or two sentences: what Claude confirmed on that page (date, ages, sign-up). Shown on the review issue. */
  checked: text(400),
};

export const candidateSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("opportunity"), ...common, organization: organizationSchema.optional(), listing: opportunityListingSchema }).strict(),
  z.object({ type: z.literal("event"), ...common, listing: eventListingSchema }).strict(),
]);

export const claudeOutputSchema = z.object({ candidates: z.array(z.unknown()).max(40) }).strict();

export type Candidate = z.infer<typeof candidateSchema>;
export type OpportunityListing = z.infer<typeof opportunityListingSchema>;
export type EventListing = z.infer<typeof eventListingSchema>;
export type OrganizationInput = z.infer<typeof organizationSchema>;
