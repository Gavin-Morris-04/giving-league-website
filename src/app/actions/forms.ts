"use server";

import { headers } from "next/headers";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/server";
import { fieldErrorsFrom, schemas, type SchemaKey } from "@/lib/validation";
import type { FormState } from "@/lib/types";

const TABLES: Record<SchemaKey, string> = {
  contact: "contact_messages",
  campus_representative: "campus_interest",
  opportunity_submission: "submitted_opportunities",
  charity_event_submission: "submitted_charity_events",
  updates: "update_subscribers",
};

const SUCCESS: Record<SchemaKey, string> = {
  contact: "Thanks — your message is in. A member of the team will reply by email.",
  campus_representative:
    "Thanks — your interest is recorded. We review every campus inquiry and will email you about next steps.",
  opportunity_submission:
    "Thanks — your opportunity is in our review queue. We check every listing against your official page before it appears in the directory, and we'll email you if we have questions.",
  charity_event_submission:
    "Thanks — your event is in our review queue. We check every listing against your official event page before it's published, and we'll email you if we have questions.",
  updates: "You're on the list. We'll only email you about announcements you asked for.",
};

const NOT_CONFIGURED =
  "This preview site isn't connected to a database yet, so nothing was saved. Your entry passed validation — once the organization switches on submissions, this form will store it for review.";

/** Columns the database expects for each form. Everything else (consent, honeypot) is dropped. */
function toRow(kind: SchemaKey, data: Record<string, unknown>, source: string): Record<string, unknown> {
  const { consent: _consent, ...rest } = data as Record<string, unknown> & { consent?: string };
  void _consent;
  const base = { ...rest, source_path: source.slice(0, 200) };
  switch (kind) {
    case "opportunity_submission":
      return {
        org_name: rest.orgName,
        org_website: rest.orgWebsite,
        contact_name: rest.contactName,
        contact_email: rest.contactEmail,
        title: rest.title,
        description: rest.description,
        cause: rest.cause,
        city: rest.city,
        signup_url: rest.signupUrl,
        kind: rest.kind,
        event_date: rest.eventDate || null,
        group_eligibility: rest.groupEligibility,
        minimum_age: rest.minimumAge ? Number(rest.minimumAge) : null,
        requirements: rest.requirements || null,
        status: "pending_review",
        source_path: base.source_path,
      };
    case "charity_event_submission":
      return {
        org_name: rest.orgName,
        org_website: rest.orgWebsite,
        contact_name: rest.contactName,
        contact_email: rest.contactEmail,
        event_name: rest.eventName,
        description: rest.description,
        event_type: rest.eventType,
        cause: rest.cause,
        city: rest.city,
        recurrence: rest.recurrence,
        event_date: rest.eventDate || null,
        typical_timing: rest.typicalTiming || null,
        registration_url: rest.registrationUrl,
        cost: rest.cost,
        age_rules: rest.ageRules || null,
        status: "pending_review",
        source_path: base.source_path,
      };
    case "campus_representative":
      return {
        name: rest.name,
        email: rest.email,
        relationship: rest.relationship,
        campus_slug: rest.campus,
        school_name: rest.schoolName || null,
        other_campus: rest.otherCampus || null,
        role: rest.role,
        interest: rest.interest,
        message: rest.message || null,
        status: "new",
        source_path: base.source_path,
      };
    case "updates":
      return {
        email: String(rest.email).toLowerCase(),
        campus_slug: rest.campus || null,
        topics: rest.topics ? String(rest.topics).split(",").filter(Boolean) : [],
        source_path: base.source_path,
      };
    case "contact":
    default:
      return {
        name: rest.name,
        email: rest.email,
        topic: rest.topic,
        organization: rest.organization || null,
        message: rest.message,
        status: "new",
        source_path: base.source_path,
      };
  }
}

export async function submitForm(kind: SchemaKey, _prev: FormState, formData: FormData): Promise<FormState> {
  const raw: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value !== "string") continue;
    // Multi-value fields (checkbox groups) are joined with commas.
    raw[key] = raw[key] ? `${raw[key]},${value}` : value;
  }

  // Honeypot: real people never see or fill this field.
  if (raw.company_website) {
    return { status: "success", message: SUCCESS[kind] };
  }
  const source = raw.source_path ?? "";
  delete raw.company_website;
  delete raw.source_path;

  const schema = schemas[kind];
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please fix the highlighted fields and try again.",
      fieldErrors: fieldErrorsFrom(parsed.error),
      values: raw,
    };
  }

  if (!isSupabaseConfigured()) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[forms] ${kind} passed validation (not saved — Supabase not configured). Fields:`, Object.keys(parsed.data));
    }
    return { status: "not_configured", message: NOT_CONFIGURED };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) return { status: "not_configured", message: NOT_CONFIGURED };

  const h = await headers();
  const row = { ...toRow(kind, parsed.data as Record<string, unknown>, source), user_agent: h.get("user-agent")?.slice(0, 300) ?? null };

  const table = TABLES[kind];
  const result =
    kind === "updates"
      ? await supabase.from(table).upsert(row, { onConflict: "email", ignoreDuplicates: false })
      : await supabase.from(table).insert(row);

  if (result.error) {
    console.error(`[forms] ${kind} insert failed:`, result.error.code, result.error.message);
    return {
      status: "error",
      message: "Something went wrong on our side and your entry wasn't saved. Please try again in a few minutes.",
      values: raw,
    };
  }

  return { status: "success", message: SUCCESS[kind] };
}
