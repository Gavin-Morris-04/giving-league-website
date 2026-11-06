import { z } from "zod";
import { universities } from "@/data/reference/geography";

/**
 * Validation schemas shared by the client (instant feedback) and the server actions (authoritative).
 * Keep messages short, specific and recovery-oriented.
 */

const trimmed = (label: string, max = 200) =>
  z
    .string({ error: `Enter ${label}.` })
    .trim()
    .min(1, `Enter ${label}.`)
    .max(max, `Keep ${label} under ${max} characters.`);

const optional = (max = 500) => z.string().trim().max(max, `Keep this under ${max} characters.`).optional().or(z.literal(""));

const email = z.string().trim().min(1, "Enter your email address.").email("Enter an email address like name@example.edu.").max(254);

const url = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `Enter ${label}.`)
    .max(500)
    .refine((v) => /^https?:\/\/\S+\.\S+/i.test(v), "Enter a full link starting with https://");


const consent = z.literal("on", { error: "Please confirm so we can contact you about this." });

const campusSlugs = universities.map((u) => u.slug) as [string, ...string[]];

export const contactSchema = z.object({
  name: trimmed("your name", 120),
  email,
  topic: z.enum(["general", "partnership", "submit_opportunity", "submit_event", "feedback", "other"], { error: "Choose a subject." }),
  organization: optional(160),
  message: trimmed("a message", 4000),
  consent,
});

/**
 * School representative interest. Written for ADULTS: college students 18+, school/university staff, club
 * sponsors and parents/guardians. Students under 18 are asked to have a teacher, club sponsor or parent contact
 * us instead, so we don't collect minors' contact details through this form.
 */
export const campusRepSchema = z
  .object({
    name: trimmed("your name", 120),
    email,
    relationship: z.enum(["college_student", "university_staff", "high_school_staff", "parent_guardian", "community_adult"], {
      error: "Choose how you're connected to the school.",
    }),
    campus: z.enum([...campusSlugs, "high_school", "other"], { error: "Choose your school." }),
    schoolName: optional(160),
    otherCampus: optional(160),
    role: trimmed("your role or organization", 160),
    interest: z.enum(["representative", "student_government", "greek_life", "service_org", "school_club", "geaux_give_week", "other"], {
      error: "Choose what you're interested in.",
    }),
    message: optional(3000),
    adult: z.literal("on", { error: "Please confirm you're 18 or older. Under 18? Ask a teacher, club sponsor or parent to contact us." }),
    consent,
  })
  .superRefine((v, ctx) => {
    if (v.campus === "high_school" && !v.schoolName) {
      ctx.addIssue({ code: "custom", path: ["schoolName"], message: "Enter the name of the high school." });
    }
    if (v.campus === "other" && !v.otherCampus) {
      ctx.addIssue({ code: "custom", path: ["otherCampus"], message: "Enter the name of the college or university." });
    }
    // Geaux Give Week is exclusively for Louisiana colleges and universities.
    if (v.interest === "geaux_give_week" && (v.campus === "high_school" || v.relationship === "high_school_staff")) {
      ctx.addIssue({
        code: "custom",
        path: ["interest"],
        message: "Geaux Give Week is only for Louisiana colleges and universities. High schools can join our other programs.",
      });
    }
  });

export const charityEventSchema = z
  .object({
    orgName: trimmed("the hosting organization's name", 160),
    orgWebsite: url("the organization's website"),
    contactName: trimmed("a contact name", 120),
    contactEmail: email,
    eventName: trimmed("the event name", 160),
    description: trimmed("a short description", 3000),
    eventType: z.enum(["walk_run", "ride", "golf", "gala", "collection_drive", "toy_drive", "cleanup", "build", "other"], {
      error: "Choose an event type.",
    }),
    cause: z.enum(["hunger", "housing", "animals", "environment", "disaster", "youth", "seniors", "health", "community"], {
      error: "Choose a cause.",
    }),
    city: trimmed("the city", 120),
    recurrence: z.enum(["one_time", "annual", "seasonal"], { error: "Choose how often it happens." }),
    eventDate: z.string().trim().optional(),
    typicalTiming: optional(160),
    registrationUrl: url("the official registration or event page"),
    cost: z.enum(["free", "paid", "varies", "unknown"], { error: "Choose the cost to take part." }),
    ageRules: optional(1000),
    consent,
  })
  .superRefine((v, ctx) => {
    if (v.eventDate && !/^\d{4}-\d{2}-\d{2}$/.test(v.eventDate)) {
      ctx.addIssue({ code: "custom", path: ["eventDate"], message: "Enter the date as YYYY-MM-DD." });
    }
    if (v.recurrence === "one_time" && !v.eventDate) {
      ctx.addIssue({ code: "custom", path: ["eventDate"], message: "Enter the event date." });
    }
    if (v.recurrence !== "one_time" && !v.eventDate && !v.typicalTiming) {
      ctx.addIssue({ code: "custom", path: ["typicalTiming"], message: "Enter the next date, or when it usually happens (e.g. “every October”)." });
    }
  });

export const opportunitySchema = z.object({
  orgName: trimmed("your organization's name", 160),
  orgWebsite: url("your organization's website"),
  contactName: trimmed("a contact name", 120),
  contactEmail: email,
  title: trimmed("a title for the opportunity", 160),
  description: trimmed("a short description", 3000),
  cause: z.enum(["hunger", "housing", "animals", "environment", "disaster", "youth", "seniors", "health", "community"], {
    error: "Choose a cause.",
  }),
  city: trimmed("the city", 120),
  signupUrl: url("the official sign-up link"),
  kind: z.enum(["resource", "event"], { error: "Choose ongoing or dated." }),
  eventDate: z.string().trim().optional(),
  groupEligibility: z.enum(["individuals", "groups", "both"], { error: "Choose who can volunteer." }),
  minimumAge: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || (/^\d{1,2}$/.test(v) && Number(v) <= 21), "Enter an age between 0 and 21, or leave blank."),
  requirements: optional(2000),
  consent,
}).superRefine((v, ctx) => {
  if (v.kind === "event" && !v.eventDate) {
    ctx.addIssue({ code: "custom", path: ["eventDate"], message: "Enter the event date." });
  }
  if (v.eventDate && !/^\d{4}-\d{2}-\d{2}$/.test(v.eventDate)) {
    ctx.addIssue({ code: "custom", path: ["eventDate"], message: "Enter the date as YYYY-MM-DD." });
  }
});


export const updatesSchema = z.object({
  email,
  campus: z.enum([...campusSlugs, "other", ""]).optional(),
  topics: z.string().optional(),
});

export type SchemaKey = "contact" | "campus_representative" | "opportunity_submission" | "charity_event_submission" | "updates";

export const schemas = {
  contact: contactSchema,
  campus_representative: campusRepSchema,
  opportunity_submission: opportunitySchema,
  charity_event_submission: charityEventSchema,
  updates: updatesSchema,
} as const;

/** Flatten zod issues into { field: firstMessage }. */
export function fieldErrorsFrom(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
