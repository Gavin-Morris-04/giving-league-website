"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Info } from "lucide-react";
import { causes, universities } from "@/data/reference/geography";
import { eventTypeLabels } from "@/lib/charity-events";
import { Consent, FormShell, RadioGroup, SelectField, TextArea, TextField } from "./FormKit";

const collegeOptions = universities.map((u) => ({ value: u.slug, label: u.name }));
const campusOptions = [...collegeOptions, { value: "other", label: "Another Louisiana college or university" }];

export const contactTopics = [
  { value: "general", label: "General Inquiry" },
  { value: "partnership", label: "Partnership" },
  { value: "submit_opportunity", label: "Submit a Volunteer Opportunity" },
  { value: "submit_event", label: "Submit a Charity Event" },
  { value: "feedback", label: "Website Feedback" },
  { value: "other", label: "Other" },
] as const;

/** The one general contact form. Partnership inquiries come through here (topic "Partnership"). */
export function ContactForm() {
  const sp = useSearchParams();
  const preset = contactTopics.some((t) => t.value === sp.get("topic")) ? (sp.get("topic") as string) : undefined;
  const [topic, setTopic] = useState(preset ?? "");
  return (
    <FormShell kind="contact" submitLabel="Send message" successTitle="Message received">
      <TextField name="name" label="Your name" required autoComplete="name" />
      <TextField name="email" label="Email" type="email" required autoComplete="email" inputMode="email" />
      <div
        className="contents"
        onChange={(e) => {
          const t = e.target as unknown as HTMLSelectElement;
          if (t.name === "topic") setTopic(t.value);
        }}
      >
        <SelectField name="topic" label="Subject" required options={[...contactTopics]} defaultValue={preset} />
      </div>
      <TextField
        name="organization"
        label="Organization"
        autoComplete="organization"
        hint={topic === "partnership" ? "Your business, nonprofit or school, if any." : undefined}
      />
      {topic === "submit_opportunity" || topic === "submit_event" ? (
        <p className="flex gap-2 rounded-md border border-hairline bg-sand p-4 text-[0.9375rem] sm:col-span-2">
          <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-forest" />
          <span>
            For a faster review, use the dedicated{" "}
            <Link href={topic === "submit_event" ? "/events/submit" : "/volunteer/submit"} className="link">
              {topic === "submit_event" ? "charity event form" : "volunteer opportunity form"}
            </Link>
            , which asks for the official sign-up link and age rules. You can also just send a message here.
          </span>
        </p>
      ) : null}
      <TextArea name="message" label="Message" required />
      <Consent label="I agree to be contacted by email about this message." />
    </FormShell>
  );
}

/**
 * School representative interest — for adults only (college students 18+, school and university staff, faculty
 * advisors, club sponsors, parents/guardians). Minors are asked to have a supervising adult reach out.
 * `mode="college"` limits the form to colleges and universities (used by Geaux Give Week, which is college-only).
 */
export function CampusRepForm({
  defaultCampus,
  defaultInterest = "representative",
  submitLabel = "Send school interest",
  mode = "all",
}: {
  defaultCampus?: string;
  defaultInterest?: string;
  submitLabel?: string;
  mode?: "all" | "college" | "high_school";
}) {
  const [campus, setCampus] = useState(defaultCampus ?? (mode === "high_school" ? "high_school" : ""));
  const schoolOptions =
    mode === "college"
      ? campusOptions
      : mode === "high_school"
        ? [{ value: "high_school", label: "A Louisiana high school" }]
        : [{ value: "high_school", label: "A Louisiana high school" }, ...campusOptions];
  const relationships =
    mode === "college"
      ? [
          { value: "college_student", label: "College student (18+)" },
          { value: "university_staff", label: "University faculty or staff" },
          { value: "community_adult", label: "Other adult" },
        ]
      : mode === "high_school"
        ? [
            { value: "high_school_staff", label: "Teacher, staff or club sponsor" },
            { value: "parent_guardian", label: "Parent or guardian" },
            { value: "community_adult", label: "Other authorized adult" },
          ]
        : [
            { value: "college_student", label: "College student (18+)" },
            { value: "university_staff", label: "University faculty or staff" },
            { value: "high_school_staff", label: "High school teacher, staff or club sponsor" },
            { value: "parent_guardian", label: "Parent or guardian" },
            { value: "community_adult", label: "Other adult" },
          ];
  const interests =
    mode === "college"
      ? [
          { value: "geaux_give_week", label: "Register interest in Geaux Give Week" },
          { value: "representative", label: "Become a campus representative" },
          { value: "student_government", label: "Connect through student government" },
          { value: "greek_life", label: "Involve a fraternity or sorority" },
          { value: "service_org", label: "Involve a service organization or club" },
          { value: "other", label: "Something else" },
        ]
      : [
          { value: "representative", label: mode === "high_school" ? "Get our school involved" : "Become a school representative" },
          { value: "school_club", label: "Involve a school club (student council, NHS, service club)" },
          ...(mode === "all"
            ? [
                { value: "student_government", label: "Connect through student government" },
                { value: "service_org", label: "Involve a service organization" },
              ]
            : []),
          { value: "other", label: "Something else" },
        ];
  return (
    <FormShell kind="campus_representative" submitLabel={submitLabel} successTitle="Interest received">
      <TextField name="name" label="Your name" required autoComplete="name" />
      <TextField
        name="email"
        label="Email"
        type="email"
        required
        autoComplete="email"
        hint={mode === "high_school" ? "Please use a school or work email." : "A school or work email helps us verify roles."}
      />
      <SelectField name="relationship" label="Your connection to the school" required full options={relationships} />
      <div
        className="contents"
        onChange={(e) => {
          const t = e.target as unknown as HTMLSelectElement;
          if (t.name === "campus") setCampus(t.value);
        }}
      >
        <SelectField
          name="campus"
          label="School"
          required
          options={schoolOptions}
          defaultValue={defaultCampus ?? (mode === "high_school" ? "high_school" : undefined)}
        />
      </div>
      <TextField name="role" label="Your role or organization" required hint="e.g. NHS advisor, SGA senator, club sponsor" />
      {campus === "high_school" ? <TextField name="schoolName" label="High school name and city" required full /> : null}
      {campus === "other" ? <TextField name="otherCampus" label="Which college or university?" required full /> : null}
      <SelectField name="interest" label="What would you like to do?" required full defaultValue={defaultInterest} options={interests} />
      <TextArea name="message" label="Anything we should know?" rows={4} hint="Goals, group size, the best time to talk. Please don't include students' personal details." />
      <div className="sm:col-span-2">
        <Consent label="I'm 18 or older." name="adult" />
        <p className="mt-2 pl-8 text-[0.8125rem] text-ink-muted">
          Under 18? Ask a teacher, club sponsor or parent to contact us for your group — we don&apos;t collect students&apos; contact details here.
        </p>
      </div>
      <Consent label="I agree to be contacted by email about this inquiry." />
    </FormShell>
  );
}

export function OpportunityForm() {
  const [kind, setKind] = useState("resource");
  return (
    <FormShell kind="opportunity_submission" submitLabel="Submit for review" successTitle="Submission received">
      <TextField name="orgName" label="Organization name" required autoComplete="organization" />
      <TextField name="orgWebsite" label="Organization website" type="url" required placeholder="https://" inputMode="url" />
      <TextField name="contactName" label="Contact name" required autoComplete="name" />
      <TextField name="contactEmail" label="Contact email" type="email" required autoComplete="email" hint="Not published. We use it to confirm details." />
      <TextField name="title" label="Opportunity title" required full hint="e.g. Saturday warehouse sorting shifts" />
      <TextArea name="description" label="What will volunteers do?" required hint="Two or three sentences. We may edit for length." />
      <SelectField name="cause" label="Cause" required options={Object.entries(causes).map(([value, c]) => ({ value, label: c.label }))} />
      <TextField name="city" label="City" required hint="Where volunteers report." autoComplete="address-level2" />
      <TextField
        name="signupUrl"
        label="Official sign-up link"
        type="url"
        required
        full
        placeholder="https://"
        inputMode="url"
        hint="Students will be sent straight here. It must be your organization's own registration page."
      />
      <div
        className="contents"
        onChange={(e) => {
          const t = e.target as unknown as HTMLInputElement;
          if (t.name === "kind") setKind(t.value);
        }}
      >
        <RadioGroup
          name="kind"
          legend="Is this ongoing or a dated event?"
          required
          defaultValue="resource"
          options={[
            { value: "resource", label: "Ongoing — volunteers choose a time" },
            { value: "event", label: "A dated event" },
          ]}
        />
      </div>
      {kind === "event" ? <TextField name="eventDate" label="Event date" type="date" required /> : null}
      <SelectField
        name="groupEligibility"
        label="Who can volunteer?"
        required
        options={[
          { value: "individuals", label: "Individuals" },
          { value: "groups", label: "Groups and school clubs" },
          { value: "both", label: "Individuals and groups" },
        ]}
      />
      <TextField name="minimumAge" label="Minimum age" inputMode="numeric" hint="Leave blank if there isn't one." />
      <TextArea name="requirements" label="Requirements for minors" rows={3} hint="Guardian waivers, supervision, training, background checks, service-hour forms." />
      <Consent label="I'm authorized to share this opportunity, and I agree to be contacted to verify it." />
    </FormShell>
  );
}

export function CharityEventForm() {
  const [recurrence, setRecurrence] = useState("annual");
  return (
    <FormShell kind="charity_event_submission" submitLabel="Submit for review" successTitle="Event submitted">
      <TextField name="orgName" label="Hosting organization" required autoComplete="organization" />
      <TextField name="orgWebsite" label="Organization website" type="url" required placeholder="https://" inputMode="url" />
      <TextField name="contactName" label="Contact name" required autoComplete="name" />
      <TextField name="contactEmail" label="Contact email" type="email" required autoComplete="email" hint="Not published. We use it to confirm details." />
      <TextField name="eventName" label="Event name" required full />
      <TextArea name="description" label="Describe the event" required hint="What happens, who it benefits, how people take part." />
      <SelectField name="eventType" label="Event type" required options={Object.entries(eventTypeLabels).map(([value, label]) => ({ value, label }))} />
      <SelectField name="cause" label="Cause" required options={Object.entries(causes).map(([value, c]) => ({ value, label: c.label }))} />
      <TextField name="city" label="City" required autoComplete="address-level2" />
      <div
        className="contents"
        onChange={(e) => {
          const t = e.target as unknown as HTMLSelectElement;
          if (t.name === "recurrence") setRecurrence(t.value);
        }}
      >
        <SelectField
          name="recurrence"
          label="How often?"
          required
          defaultValue="annual"
          options={[
            { value: "annual", label: "Every year" },
            { value: "seasonal", label: "Seasonal campaign" },
            { value: "one_time", label: "One-time event" },
          ]}
        />
      </div>
      <TextField
        name="eventDate"
        label={recurrence === "one_time" ? "Event date" : "Next confirmed date"}
        type="date"
        required={recurrence === "one_time"}
        hint={recurrence === "one_time" ? undefined : "Only if it's announced on your official site."}
      />
      {recurrence !== "one_time" ? <TextField name="typicalTiming" label="When it usually happens" hint="e.g. “Every October” — required if there's no confirmed date." /> : null}
      <TextField
        name="registrationUrl"
        label="Official registration or event page"
        type="url"
        required
        full
        placeholder="https://"
        inputMode="url"
      />
      <SelectField
        name="cost"
        label="Cost to take part"
        required
        options={[
          { value: "free", label: "Free" },
          { value: "paid", label: "Registration fee" },
          { value: "varies", label: "Varies" },
          { value: "unknown", label: "Not sure" },
        ]}
      />
      <TextArea name="ageRules" label="Age and supervision rules" rows={3} hint="Can high school students take part? Is a guardian or adult required? We only publish what you confirm." />
      <Consent label="I'm authorized to share this event, and I agree to be contacted to verify it." />
    </FormShell>
  );
}

export function UpdatesSignup({ tone = "light", campusField = true }: { tone?: "light" | "dark"; campusField?: boolean }) {
  return (
    <FormShell kind="updates" submitLabel="Get updates" compact tone={tone} successTitle="You're on the list">
      <TextField name="email" label="Email" type="email" required autoComplete="email" inputMode="email" />
      {campusField ? <SelectField name="campus" label="Your college" options={campusOptions} placeholder="Choose your college (optional)" /> : null}
    </FormShell>
  );
}
