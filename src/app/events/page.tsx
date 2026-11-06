import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { BadgeCheck, CalendarClock, ExternalLink } from "lucide-react";
import { EventsDirectory, EventsDirectorySkeleton } from "@/components/events/EventsDirectory";
import { PageHero } from "@/components/layout/PageHero";
import { ButtonLink } from "@/components/ui/Button";
import { charityEvents } from "@/data/verified/charity-events";

export const metadata: Metadata = {
  title: "Charity Events",
  description:
    "Discover charity walks, fundraising events, seasonal drives, and community initiatives happening across Louisiana — with official registration links and verified dates.",
  alternates: { canonical: "/events" },
};

export default function EventsPage() {
  return (
    <>
      <PageHero
        compact
        title="Find an Event. Make a Difference."
        lead="Discover charity walks, fundraising events, seasonal drives, and community initiatives happening across Louisiana."
        photo="cleanupClipboard"
        meta={
          <div className="max-w-2xl space-y-5">
            <p className="text-ink-muted max-sm:hidden">
              Whether you&apos;re looking to volunteer, participate in a charity run, support a fundraiser, or bring friends together for a
              cause, explore opportunities to make a difference throughout the year.
            </p>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[0.9375rem] text-ink max-sm:hidden">
              <li className="flex items-center gap-2">
                <BadgeCheck aria-hidden className="size-4 text-forest" />
                {charityEvents.length} verified events
              </li>
              <li className="flex items-center gap-2">
                <CalendarClock aria-hidden className="size-4 text-forest" />
                Dates shown only when the organizer confirms them
              </li>
              <li className="flex items-center gap-2">
                <ExternalLink aria-hidden className="size-4 text-forest" />
                Register on the organizer&apos;s own site
              </li>
            </ul>
          </div>
        }
      />

      <section aria-label="Charity event search" className="pt-10 pb-24 md:pt-12">
        <div className="container-line">
          <Suspense fallback={<EventsDirectorySkeleton />}>
            <EventsDirectory />
          </Suspense>
        </div>
      </section>

      <section className="border-t border-hairline bg-sand section-y" aria-labelledby="events-vs-heading">
        <div className="container-line grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 id="events-vs-heading" className="text-h2 text-navy">
              Events or volunteering?
            </h2>
            <p className="text-lead mt-5 text-ink-muted">Two directories, because they answer different questions.</p>
          </div>
          <dl className="grid gap-8 sm:grid-cols-2 lg:col-span-7">
            <div>
              <dt className="text-h3 text-navy">Charity events</dt>
              <dd className="mt-2 text-ink-muted">
                Scheduled or recurring gatherings and campaigns — walks, runs, rides, toy drives, cleanup days, galas and fundraisers. Annual
                events stay listed between editions, marked &ldquo;next date not yet confirmed&rdquo; until the organizer announces it.
              </dd>
            </div>
            <div>
              <dt className="text-h3 text-navy">Volunteer opportunities</dt>
              <dd className="mt-2 text-ink-muted">
                Ongoing ways to serve an organization on your own schedule — sorting food, shelter care, home builds.{" "}
                <Link href="/volunteer" className="link">
                  Open the Volunteer Finder
                </Link>
                .
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="section-y" aria-labelledby="submit-event-heading">
        <div className="container-line flex flex-col items-start justify-between gap-8 border-t-2 border-navy pt-12 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <h2 id="submit-event-heading" className="text-h2 text-navy">
              Hosting a charity event in Louisiana?
            </h2>
            <p className="text-lead mt-4 text-ink-muted">
              Nonprofits can request a listing. Every submission is checked against your official event page before it&apos;s published.
            </p>
          </div>
          <ButtonLink href="/events/submit" size="lg" icon="arrow">
            Submit a Charity Event
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
