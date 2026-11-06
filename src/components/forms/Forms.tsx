"use client";

import { useState } from "react";
import { causes, universities } from "@/data/reference/geography";
import { Consent, FormShell, RadioGroup, SelectField, TextArea, TextField } from "./FormKit";

const campusOptions = [
  ...universities.map((u) => ({ value: u.slug, label: u.name })),
  { value: "other", label: "Another Louisiana college or university" },
];

export function ContactForm() {
  return (
    <FormShell kind="contact" submitLabel="Send message" successTitle="Message received">
      <TextField name="name" label="Your name" required autoComplete="name" />
      <TextField name="email" label="Email" type="email" required autoComplete="email" inputMode="email" />
      <SelectField
        name="topic"
        label="What's this about?"
        required
        full
        options={[
          { value: "general", label: "General question" },
          { value: "volunteering", label: "Finding a volunteer opportunity" },
          { value: "campus", label: "Bringing this to my campus" },
          { value: "partnership", label: "Partnering or sponsoring" },
          { value: "press", label: "Press or media" },
          { value: "other", label: "Something else" },
        ]}
      />
      <TextArea name="message" label="Message" required />
      <Consent label="I agree to be contacted by email about this message." />
    </FormShell>
  );
}

export function CampusRepForm({
  defaultCampus,
  defaultInterest = "representative",
  submitLabel = "Send campus interest",
}: {
  defaultCampus?: string;
  defaultInterest?: string;
  submitLabel?: string;
}) {
  const [campus, setCampus] = useState(defaultCampus ?? "");
  return (
    <FormShell kind="campus_representative" submitLabel={submitLabel} successTitle="Campus interest received">
      <TextField name="name" label="Your name" required autoComplete="name" />
      <TextField name="email" label="Email" type="email" required autoComplete="email" hint="Your .edu address helps us verify campus roles." />
      <div
        className="contents"
        onChange={(e) => {
          const t = e.target as unknown as HTMLSelectElement;
          if (t.name === "campus") setCampus(t.value);
        }}
      >
        <SelectField name="campus" label="Campus" required options={campusOptions} defaultValue={defaultCampus} />
      </div>
      <TextField name="role" label="Your role or organization" required hint="e.g. SGA senator, chapter philanthropy chair" />
      {campus === "other" ? <TextField name="otherCampus" label="Which college or university?" required full /> : null}
      <SelectField
        name="interest"
        label="What would you like to do?"
        required
        full
        defaultValue={defaultInterest}
        options={[
          { value: "representative", label: "Become a campus representative" },
          { value: "student_government", label: "Connect through student government" },
          { value: "greek_life", label: "Involve a fraternity or sorority" },
          { value: "service_org", label: "Involve a service organization or club" },
          { value: "geaux_give_week", label: "Register interest in Geaux Give Week" },
          { value: "other", label: "Something else" },
        ]}
      />
      <TextArea name="message" label="Anything we should know?" rows={4} hint="Your goals, your organization's size, the best time to talk." />
      <Consent label="I agree to be contacted by email about bringing this initiative to my campus." />
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
      <SelectField
        name="cause"
        label="Cause"
        required
        options={Object.entries(causes).map(([value, c]) => ({ value, label: c.label }))}
      />
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
          { value: "groups", label: "Groups" },
          { value: "both", label: "Individuals and groups" },
        ]}
      />
      <TextField name="minimumAge" label="Minimum age" inputMode="numeric" hint="Leave blank if there isn't one." />
      <TextArea name="requirements" label="Requirements" rows={3} hint="Waivers, training, dress code, background checks." />
      <Consent label="I'm authorized to share this opportunity, and I agree to be contacted to verify it." />
    </FormShell>
  );
}

export function PartnershipForm({ defaultInterest, submitLabel = "Send partnership inquiry" }: { defaultInterest?: string; submitLabel?: string }) {
  return (
    <FormShell kind="partnership" submitLabel={submitLabel} successTitle="Inquiry received">
      <TextField name="name" label="Your name" required autoComplete="name" />
      <TextField name="email" label="Email" type="email" required autoComplete="email" />
      <TextField name="organization" label="Business or organization" required autoComplete="organization" />
      <TextField name="website" label="Website" type="url" placeholder="https://" inputMode="url" />
      <SelectField
        name="type"
        label="Type of organization"
        required
        options={[
          { value: "business", label: "Business" },
          { value: "nonprofit", label: "Nonprofit" },
          { value: "university", label: "University office or department" },
          { value: "community", label: "Community or faith organization" },
          { value: "other", label: "Other" },
        ]}
      />
      <SelectField
        name="interest"
        label="Area of interest"
        required
        defaultValue={defaultInterest}
        options={[
          { value: "events", label: "Sponsoring a community event" },
          { value: "resources", label: "Providing supplies or resources" },
          { value: "matching", label: "Supporting an approved matching initiative" },
          { value: "geaux_give_week", label: "Geaux Give Week partnership" },
          { value: "volunteering", label: "Employee volunteering" },
          { value: "other", label: "Something else" },
        ]}
      />
      <TextArea name="message" label="What do you have in mind?" required rows={4} />
      <Consent label="I agree to be contacted by email about this inquiry." />
    </FormShell>
  );
}

export function UpdatesSignup({ tone = "light", campusField = true }: { tone?: "light" | "dark"; campusField?: boolean }) {
  return (
    <FormShell kind="updates" submitLabel="Get updates" compact tone={tone} successTitle="You're on the list">
      <TextField name="email" label="Email" type="email" required autoComplete="email" inputMode="email" />
      {campusField ? (
        <SelectField name="campus" label="Your campus" options={campusOptions} placeholder="Choose your campus (optional)" />
      ) : null}
    </FormShell>
  );
}
