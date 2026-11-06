import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, History } from "lucide-react";
import { EventsBrowser, type DatedItem } from "@/components/events/EventsBrowser";
import { UpdatesSignup } from "@/components/forms/Forms";
import { PageHero } from "@/components/layout/PageHero";
import { MotionLayer } from "@/components/motion/MotionLayer";
import { Badge, Photo, SectionHeading } from "@/components/ui/primitives";
import { causes } from "@/data/reference/geography";
import { eventConcepts, pastEvents, upcomingEvents } from "@/data/programs/events";
import { opportunities, orgName } from "@/lib/directory";

export const metadata: Metadata = {
  title: "Community Events",
  description:
    "Food drives, cleanups and hands-on service projects for Louisiana college students. Our first events are being planned — get announced dates first.",
  alternates: { canonical: "/events" },
};

export default function EventsPage() {
  const items: DatedItem[] = [
    ...upcomingEvents.map((e) => ({
      id: e.slug,
      title: e.title,
      host: "Community Events",
      source: "ours" as const,
      startDate: e.startDate!,
      endDate: e.endDate,
      cityKey: e.cityKey ?? "statewide",
      campuses: e.campuses ?? [],
      href: `/events/${e.slug}`,
      external: false,
    })),
    ...opportunities
      .filter((o) => o.kind === "event" && o.startDate)
      .map((o) => ({
        id: o.slug,
        title: o.title,
        host: orgName(o),
        source: "listed" as const,
        startDate: o.startDate!,
        endDate: o.endDate,
        cityKey: o.cityKey,
        campuses: o.nearbyCampuses,
        href: `/volunteer/${o.slug}`,
        external: false,
      })),
  ];

  return (
    <>
      <PageHero
        title="Make an Impact Beyond the Classroom."
        lead="Join students and community partners for meaningful events, service projects, and opportunities to give back throughout the year."
        photo="cleanupClipboard"
      />

      {/* Upcoming */}
      <section className="section-y" aria-labelledby="upcoming-heading">
        <div className="container-line">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <h2 id="upcoming-heading" className="text-h2 text-navy">
                Upcoming events
              </h2>
              <div className="mt-8 rounded-md border border-gold/60 bg-gold-tint p-6 sm:p-8" data-reveal>
                <Badge tone="gold">Events are being planned</Badge>
                <p className="text-h3 mt-4 text-navy">Our first community events don&apos;t have dates yet.</p>
                <p className="mt-3 text-ink">
                  We&apos;re working with campus representatives and local organizations to schedule our first projects, beginning in Baton
                  Rouge. We&apos;ll post every confirmed date here — never a placeholder.
                </p>
              </div>
            </div>
            <div className="lg:col-span-5" data-reveal>
              <div className="rounded-md border border-hairline bg-paper p-6 sm:p-8">
                <h3 className="text-h3 text-navy">Be first to hear about events</h3>
                <p className="mt-2 mb-6 text-[0.9375rem] text-ink-muted">One email when an event near your campus is announced.</p>
                <UpdatesSignup />
              </div>
            </div>
          </div>

          <div className="mt-20">
            <EventsBrowser items={items} />
          </div>
        </div>
      </section>

      {/* Making a difference all year */}
      <section className="border-y border-hairline bg-sand section-y" aria-labelledby="year-heading">
        <div className="container-line grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5" data-reveal>
            <h2 id="year-heading" className="text-h2 text-navy">
              Making a Difference, All Year Long.
            </h2>
            <p className="text-lead mt-5 text-ink-muted">
              Community impact doesn&apos;t happen during just one week of the year. From local food drives to hands-on service projects, we
              bring students together to support causes that strengthen Louisiana communities.
            </p>
            <p className="mt-5 text-ink-muted">
              Some events will be hosted by one campus; others will bring several universities together. These are the series we&apos;re
              planning — none is scheduled yet.
            </p>
          </div>
          <div className="lg:col-span-7" data-reveal>
            <Photo name="beachCleanup" sizes="(min-width: 1024px) 55vw, 100vw" className="aspect-[16/10] rounded-md" />
          </div>
        </div>
        <div className="container-line mt-16">
          <ul className="grid gap-px overflow-hidden rounded-md border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-3" data-reveal-group>
            {eventConcepts.map((e) => (
              <li key={e.slug} data-reveal-item className="bg-paper">
                <Link href={`/events/${e.slug}`} className="group flex h-full flex-col p-6 transition-colors hover:bg-ivory sm:p-7">
                  <div className="flex flex-wrap gap-2">
                    <Badge tone="hollow">Concept — not yet scheduled</Badge>
                  </div>
                  <h3 className="text-h3 mt-5 text-navy">{e.title}</h3>
                  <p className="mt-2 text-[0.8125rem] font-semibold text-forest">{causes[e.cause].label}</p>
                  <p className="mt-3 text-[0.9375rem] text-ink-muted">{e.summary}</p>
                  <span className="mt-auto inline-flex items-center gap-2 pt-6 font-semibold text-forest">
                    <span className="underline decoration-1 underline-offset-4 group-hover:decoration-2">About this series</span>
                    <ArrowRight aria-hidden className="size-4" />
                  </span>
                </Link>
              </li>
            ))}
            <li className="bg-navy text-ivory on-dark" data-reveal-item>
              <Link href="/partners#campus-leaders" className="group flex h-full flex-col p-6 sm:p-7">
                <h3 className="text-h3 text-ivory">Host one on your campus</h3>
                <p className="mt-3 text-[0.9375rem] text-navy-muted">
                  Student organizations can help shape and lead the first events. Tell us what your campus needs.
                </p>
                <span className="mt-auto inline-flex items-center gap-2 pt-6 font-semibold text-gold-bright">
                  <span className="underline decoration-1 underline-offset-4 group-hover:decoration-2">Become a campus representative</span>
                  <ArrowRight aria-hidden className="size-4" />
                </span>
              </Link>
            </li>
          </ul>
        </div>
      </section>

      {/* Past */}
      <section className="section-y" aria-labelledby="past-heading">
        <div className="container-line">
          <SectionHeading id="past-heading" title="Past events" />
          {pastEvents.length ? null : (
            <div className="mt-8 flex flex-col items-start gap-4 rounded-md border border-dashed border-hairline-strong p-8 sm:flex-row sm:items-center">
              <History aria-hidden className="size-8 shrink-0 text-ink-muted" strokeWidth={1.5} />
              <div>
                <p className="font-semibold text-navy">No past events yet.</p>
                <p className="mt-1 text-ink-muted">
                  After each event we&apos;ll publish what happened here: who took part, what was collected or built, and which organizations
                  benefited — reported honestly.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
      <MotionLayer />
    </>
  );
}
