import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, MapPin } from "lucide-react";
import { FinderSkeleton, OpportunityFinder } from "@/components/directory/OpportunityFinder";
import { OpportunityCard } from "@/components/directory/OpportunityCard";
import { CharityEventCard } from "@/components/events/CharityEventCard";
import { AgeRequirementsGuide, SchoolInvolvement } from "@/components/high-schools/HighSchoolSections";
import { ExternalLink, Station } from "@/components/ui/primitives";
import { getServiceArea, serviceAreas } from "@/data/reference/locations";
import { charityEvents } from "@/data/verified/charity-events";
import { getOrganization } from "@/data/verified/organizations";
import { eventsNearCity, openToHighSchool } from "@/lib/charity-events";
import { fitsHighSchool, opportunitiesNearCity, orgName } from "@/lib/directory";

type Props = { params: Promise<{ city: string }> };

export function generateStaticParams() {
  return serviceAreas.map((a) => ({ city: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const a = getServiceArea(city);
  if (!a) return {};
  return {
    title: `High school volunteering in ${a.name}`,
    description: `Volunteer opportunities and charity events for high school students in ${a.name}${a.surrounding.length ? `, ${a.surrounding.slice(0, 3).join(", ")}` : ""} and nearby communities.`,
    alternates: { canonical: `/high-schools/${a.slug}` },
  };
}

export default async function HighSchoolCityPage({ params }: Props) {
  const { city } = await params;
  const a = getServiceArea(city);
  if (!a) notFound();

  const nearby = opportunitiesNearCity(a.cityKey).filter((o) => o.cityKey !== "statewide");
  const eligible = nearby.filter((o) => fitsHighSchool(o) === "yes");
  const checkFirst = nearby.filter((o) => fitsHighSchool(o) === "unverified");
  const events = eventsNearCity(charityEvents, a.cityKey);
  const teenEvents = events.filter(openToHighSchool);
  const otherEvents = events.filter((e) => !openToHighSchool(e));
  const orgs = [...new Set(nearby.map((o) => o.orgSlug))].map((s) => getOrganization(s)).filter((o) => o !== undefined);

  return (
    <>
      <header className="border-b border-hairline">
        <div className="container-line pt-8 pb-14 md:pt-10 md:pb-20">
          <Link href="/high-schools" className="link inline-flex min-h-11 items-center gap-2 text-[0.9375rem] font-semibold">
            <ArrowLeft aria-hidden className="size-4" />
            All high school areas
          </Link>
          <Station className="mt-8 mb-6" />
          <p className="flex items-center gap-1.5 text-[0.9375rem] font-semibold text-forest">
            <MapPin aria-hidden className="size-4" />
            {a.region}
          </p>
          <h1 className="text-display-lg mt-3 max-w-4xl text-navy">High school volunteering in {a.name}</h1>
          <p className="text-lead mt-6 max-w-3xl text-ink-muted">
            Ways for high school students in {a.name}
            {a.surrounding.length ? ` and nearby ${a.surrounding.slice(0, 5).join(", ")}` : ""} to volunteer, join charity events and support local
            causes. Every listing links to the organization&apos;s official registration page — no account needed.
          </p>
          <p className="mt-6 text-[0.9375rem] text-ink-muted">
            {eligible.length} local opportunit{eligible.length === 1 ? "y" : "ies"} with published rules that allow high school volunteers ·{" "}
            {checkFirst.length} more to check with the organizer
          </p>
        </div>
      </header>

      <section className="section-y" aria-labelledby="local-heading">
        <div className="container-line">
          <h2 id="local-heading" className="text-h2 text-navy">
            Verified local volunteer resources
          </h2>
          <p className="text-lead mt-4 max-w-2xl text-ink-muted">Organizations within about 55 miles whose published age rules allow high school students.</p>
          {eligible.length ? (
            <ul className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {eligible.map((o) => (
                <li key={o.slug}>
                  <OpportunityCard o={o} org={orgName(o)} youthView />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-8 rounded-md border border-dashed border-hairline-strong p-6 text-ink-muted">
              We haven&apos;t verified local opportunities with published high school age rules here yet. Statewide programs and the listings below
              may still be options — check with each organizer.{" "}
              <Link href="/volunteer/submit" className="link">
                Know one? Submit it.
              </Link>
            </p>
          )}
          {checkFirst.length ? (
            <div className="mt-14">
              <h3 className="text-h3 text-navy">Check with the organizer first</h3>
              <p className="mt-2 max-w-2xl text-[0.9375rem] text-ink-muted">
                These organizations haven&apos;t published age rules. They may or may not accept high school volunteers.
              </p>
              <ul className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {checkFirst.map((o) => (
                  <li key={o.slug}>
                    <OpportunityCard o={o} org={orgName(o)} youthView unverifiedForYouth />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>

      <section className="border-y border-hairline bg-sand section-y" aria-labelledby="city-events-heading">
        <div className="container-line">
          <h2 id="city-events-heading" className="text-h2 text-navy">
            Upcoming and recurring charity events
          </h2>
          {teenEvents.length ? (
            <>
              <p className="mt-4 text-ink-muted">Open to high school students, per the organizer:</p>
              <ul className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {teenEvents.map((e) => (
                  <li key={e.slug}>
                    <CharityEventCard e={e} />
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          {otherEvents.length ? (
            <>
              <p className="mt-10 text-ink-muted">Nearby events — age rules not published, so check with the organizer:</p>
              <ul className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {otherEvents.map((e) => (
                  <li key={e.slug}>
                    <CharityEventCard e={e} />
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          {!events.length ? <p className="mt-6 text-ink-muted">No verified charity events near {a.name} yet.</p> : null}
        </div>
      </section>

      <section className="section-y" aria-labelledby="city-finder-heading">
        <div className="container-line">
          <h2 id="city-finder-heading" className="text-h2 text-navy">
            Search and filter
          </h2>
          <p className="text-lead mt-4 mb-10 max-w-2xl text-ink-muted">Narrow by cause, age, days, group volunteering, service hours and guardian rules.</p>
          <Suspense fallback={<FinderSkeleton />}>
            <OpportunityFinder mode="high_school" defaultCity={a.cityKey} />
          </Suspense>
        </div>
      </section>

      {orgs.length ? (
        <section className="border-t border-hairline section-y" aria-labelledby="orgs-heading">
          <div className="container-line">
            <h2 id="orgs-heading" className="text-h2 text-navy">
              Local nonprofit organizations
            </h2>
            <ul className="mt-8 grid gap-x-10 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
              {orgs.map((o) => (
                <li key={o.slug}>
                  <ExternalLink href={o.website} className="font-semibold">
                    {o.name}
                  </ExternalLink>
                  <p className="mt-0.5 text-[0.875rem] text-ink-muted">{o.summary}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <AgeRequirementsGuide />
      <SchoolInvolvement cityName={a.name} />
    </>
  );
}
