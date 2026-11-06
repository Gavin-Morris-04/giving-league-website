import Link from "next/link";
import { BadgeCheck, ClipboardCheck, ShieldCheck, UserRoundCheck } from "lucide-react";
import { CampusRepForm } from "@/components/forms/Forms";
import { SectionHeading } from "@/components/ui/primitives";

/** "Bring Giving Back to Your School." — staff / advisor / authorized-adult inquiry. */
export function SchoolInvolvement({ cityName }: { cityName?: string }) {
  return (
    <section id="school-involvement" className="scroll-mt-20 on-dark bg-navy text-ivory section-y" aria-labelledby="school-involvement-heading">
      <div className="container-line grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5" data-reveal>
          <SectionHeading
            tone="dark"
            id="school-involvement-heading"
            title="Bring Giving Back to Your School."
            lead="Whether you're part of student council, a service club, National Honor Society, or simply want to make a difference, we're here to help you discover meaningful ways to support your community."
          />
          <p className="mt-8 text-[0.9375rem] text-navy-muted">
            This form is for teachers, staff, faculty advisors, club sponsors and parents or guardians. Students under 18: ask your advisor or a
            parent to reach out for your group — we don&apos;t collect students&apos; contact details, publish student profiles, or offer messaging
            between students and anyone else.
          </p>
        </div>
        <div className="on-light rounded-md bg-ivory p-6 text-ink sm:p-10 lg:col-span-7">
          <h3 className="text-h3 text-navy">Get Your School Involved{cityName ? ` in ${cityName}` : ""}</h3>
          <p className="mt-2 mb-8 text-[0.9375rem] text-ink-muted">We reply by email to the adult who submits this form.</p>
          <CampusRepForm mode="high_school" submitLabel="Get Your School Involved" />
        </div>
      </div>
    </section>
  );
}

/** Plain-language guide to the eligibility labels used across the high school pages. */
export function AgeRequirementsGuide() {
  const items = [
    { icon: BadgeCheck, title: "Ages 14+, 16+, 18+", body: "The minimum age the organization publishes. We never show an 18+ opportunity in high school results." },
    { icon: UserRoundCheck, title: "Parent/guardian permission required", body: "Under 18? A parent or guardian signs the organization's waiver or consent form before your first shift." },
    { icon: ShieldCheck, title: "Eligibility not verified — check with organizer", body: "The organization hasn't published age rules. Ask them before you go; don't assume minors are allowed." },
    { icon: ClipboardCheck, title: "Service hours", body: "Some organizations record volunteer hours. Bring your school's service-hour form and ask the organizer to sign it." },
  ];
  return (
    <section className="section-y" aria-labelledby="age-guide-heading">
      <div className="container-line">
        <SectionHeading id="age-guide-heading" title="Understanding age requirements" lead="Every label comes from the organization's own published rules." />
        <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4" data-reveal-group>
          {items.map((i) => (
            <li key={i.title} data-reveal-item className="border-t-2 border-navy pt-6">
              <i.icon aria-hidden className="size-7 text-forest" strokeWidth={1.75} />
              <h3 className="text-h3 mt-4 text-navy">{i.title}</h3>
              <p className="mt-2 text-[0.9375rem] text-ink-muted">{i.body}</p>
            </li>
          ))}
        </ul>
        <p className="mt-10 text-[0.9375rem] text-ink-muted">
          Geaux Give Week is a college-only competition, so high schools don&apos;t take part in it. Volunteering, charity events and{" "}
          <Link href="/donations" className="link">
            donating
          </Link>{" "}
          are open to you all year.
        </p>
      </div>
    </section>
  );
}
