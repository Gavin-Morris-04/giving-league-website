import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, MapPin } from "lucide-react";
import { FinderSkeleton, OpportunityFinder } from "@/components/directory/OpportunityFinder";
import { CharityEventCard } from "@/components/events/CharityEventCard";
import { AgeRequirementsGuide, SchoolInvolvement } from "@/components/high-schools/HighSchoolSections";
import { PageHero } from "@/components/layout/PageHero";
import { MotionLayer } from "@/components/motion/MotionLayer";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/primitives";
import { serviceAreas } from "@/data/reference/locations";
import { charityEvents } from "@/data/verified/charity-events";
import { openToHighSchool } from "@/lib/charity-events";
import { fitsHighSchool, opportunitiesNearCity } from "@/lib/directory";

export const metadata: Metadata = {
  title: "High Schools",
  description:
    "Volunteer opportunities, charity events and community service for Louisiana high school students — with age requirements and guardian rules from each organization.",
  alternates: { canonical: "/high-schools" },
};

export default function HighSchoolsPage() {
  const teenEvents = charityEvents.filter(openToHighSchool);
  return (
    <>
      <PageHero
        title="Start Making a Difference Today."
        lead="Discover volunteer opportunities, charity events, and community service programs for high school students across Louisiana."
        photo="cleanupSmile"
        actions={
          <>
            <ButtonLink href="#finder" size="lg" icon="arrow">
              Find Opportunities Near Me
            </ButtonLink>
            <ButtonLink href="#cities" variant="secondary" size="lg">
              Browse Cities
            </ButtonLink>
          </>
        }
        meta={<p className="text-[0.9375rem] text-ink-muted">No account needed. You don&apos;t need your school to be listed — just pick your area.</p>}
      />

      <section id="cities" className="scroll-mt-20 section-y" aria-labelledby="cities-heading">
        <div className="container-line">
          <SectionHeading
            id="cities-heading"
            title="Browse by city"
            lead="Each area includes nearby towns and suburbs, so you're not limited to city limits."
          />
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-reveal-group>
            {serviceAreas.map((a) => {
              const eligible = opportunitiesNearCity(a.cityKey).filter((o) => o.cityKey !== "statewide" && fitsHighSchool(o) === "yes").length;
              return (
                <li key={a.slug} data-reveal-item>
                  <Link href={`/high-schools/${a.slug}`} className="card-lift group flex h-full flex-col rounded-md border border-hairline bg-paper p-6">
                    <p className="flex items-center gap-1.5 text-[0.8125rem] font-semibold text-forest">
                      <MapPin aria-hidden className="size-4" />
                      {a.region}
                    </p>
                    <h3 className="text-h3 mt-3 text-navy">{a.name}</h3>
                    {a.surrounding.length ? (
                      <p className="mt-2 text-[0.875rem] text-ink-muted">Including {a.surrounding.slice(0, 4).join(", ")}{a.surrounding.length > 4 ? " and more" : ""}</p>
                    ) : null}
                    <div className="mt-auto flex items-end justify-between gap-4 pt-6">
                      <p className="text-[0.9375rem]">
                        <span className="font-semibold tabular">{eligible}</span> local listing{eligible === 1 ? "" : "s"} open to high schoolers
                      </p>
                      <ArrowRight aria-hidden className="size-4 text-forest transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section id="finder" className="scroll-mt-20 border-t border-hairline bg-sand pt-16 pb-24" aria-labelledby="hs-finder-heading">
        <div className="container-line">
          <SectionHeading
            id="hs-finder-heading"
            title="High school volunteer finder"
            lead="The same verified statewide directory college students use — filtered to opportunities whose organizers allow high school volunteers."
          />
          <div className="mt-10">
            <Suspense fallback={<FinderSkeleton />}>
              <OpportunityFinder mode="high_school" />
            </Suspense>
          </div>
        </div>
      </section>

      <section className="section-y" aria-labelledby="hs-events-heading">
        <div className="container-line">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading
              id="hs-events-heading"
              title="Charity events for high school students"
              lead="Only events whose organizers' age and supervision policies support high school participation are listed here."
            />
            <ButtonLink href="/events?level=high_school" variant="secondary" icon="arrow" className="shrink-0">
              All charity events
            </ButtonLink>
          </div>
          {teenEvents.length ? (
            <ul className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {teenEvents.map((e) => (
                <li key={e.slug}>
                  <CharityEventCard e={e} />
                </li>
              ))}
            </ul>
          ) : null}
          <p className="mt-8 text-[0.9375rem] text-ink-muted">
            Many more events in the <Link href="/events" className="link">charity events directory</Link> may welcome teens, but their organizers
            haven&apos;t published age rules — check with the organizer before you register.
          </p>
        </div>
      </section>

      <AgeRequirementsGuide />
      <SchoolInvolvement />
      <MotionLayer />
    </>
  );
}
