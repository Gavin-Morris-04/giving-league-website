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

const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || /^https?:\/\/\S+\.\S+/i.test(v), "Enter a full link starting with https://")
  .optional();

const consent = z.literal("on", { error: "Please confirm so we can contact you about this." });

const campusSlugs = universities.map((u) => u.slug) as [string, ...string[]];

export const contactSchema = z.object({
  name: trimmed("your name", 120),
  email,
  topic: z.enum(["general", "volunteering", "campus", "partnership", "press", "other"], { error: "Choose a topic." }),
  message: trimmed("a message", 4000),
  consent,
});

export const campusRepSchema = z.object({
  name: trimmed("your name", 120),
  email,
  campus: z.enum([...campusSlugs, "other"], { error: "Choose your campus." }),
  otherCampus: optional(160),
  role: trimmed("your role or organization", 160),
  interest: z.enum(["representative", "student_government", "greek_life", "service_org", "geaux_give_week", "other"], {
    error: "Choose what you're interested in.",
  }),
  message: optional(3000),
  consent,
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

export const partnershipSchema = z.object({
  name: trimmed("your name", 120),
  email,
  organization: trimmed("your business or organization", 160),
  website: optionalUrl,
  type: z.enum(["business", "nonprofit", "university", "community", "other"], { error: "Choose an organization type." }),
  interest: z.enum(["events", "resources", "matching", "geaux_give_week", "volunteering", "other"], {
    error: "Choose an area of interest.",
  }),
  message: trimmed("a short note about what you have in mind", 3000),
  consent,
});

export const updatesSchema = z.object({
  email,
  campus: z.enum([...campusSlugs, "other", ""]).optional(),
  topics: z.string().optional(),
});

export type SchemaKey = "contact" | "campus_representative" | "opportunity_submission" | "partnership" | "updates";

export const schemas = {
  contact: contactSchema,
  campus_representative: campusRepSchema,
  opportunity_submission: opportunitySchema,
  partnership: partnershipSchema,
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
