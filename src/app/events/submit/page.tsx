import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { CharityEventForm } from "@/components/forms/Forms";
import { PageHero } from "@/components/layout/PageHero";

export const metadata: Metadata = {
  title: "Submit a Charity Event",
  description: "Louisiana nonprofits: request a listing for a charity walk, run, drive, cleanup, gala or fundraiser. Every submission is reviewed before publication.",
  alternates: { canonical: "/events/submit" },
};

export default function SubmitCharityEventPage() {
  return (
    <>
      <PageHero
        title="Submit a Charity Event"
        lead="Hosting a walk, run, toy drive, cleanup day, gala or fundraiser in Louisiana? Request a listing. There's no cost, and people register through your own site."
      />
      <section className="section-y">
        <div className="container-line grid gap-14 lg:grid-cols-12">
          <aside className="lg:col-span-4" aria-labelledby="event-review-heading">
            <h2 id="event-review-heading" className="text-h3 text-navy">
              How listings are reviewed
            </h2>
            <ul className="mt-6 space-y-3 text-[0.9375rem] text-ink-muted">
              {[
                "Every submission is checked against your official event page before it's published.",
                "We only show a specific date once it's on your official site. Annual events stay listed between editions.",
                "We only describe an event as open to high school students when your age and supervision rules say so.",
                "We never take registrations or payments — people sign up with you.",
              ].map((t) => (
                <li key={t} className="flex gap-2">
                  <CheckCircle2 aria-hidden className="mt-0.5 size-4 shrink-0 text-forest" />
                  {t}
                </li>
              ))}
            </ul>
          </aside>
          <div className="lg:col-span-8">
            <h2 className="text-h2 text-navy">Event details</h2>
            <p className="mt-3 mb-10 text-ink-muted">Takes about five minutes. All submissions require review before publication.</p>
            <CharityEventForm />
          </div>
        </div>
      </section>
    </>
  );
}
