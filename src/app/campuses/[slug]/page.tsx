import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarX2, Globe2, MapPin, UserRound } from "lucide-react";
import { CampusStatusBadge } from "@/components/campuses/CampusStatusBadge";
import { OpportunityCard } from "@/components/directory/OpportunityCard";
import { CampusRepForm } from "@/components/forms/Forms";
import { ButtonLink } from "@/components/ui/Button";
import { ExternalLink, Station } from "@/components/ui/primitives";
import { site } from "@/config/site";
import { getUniversity, universities } from "@/data/reference/geography";
import { getOrganization } from "@/data/verified/organizations";
import { distanceFromCampus, opportunitiesNearCampus, orgName } from "@/lib/directory";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return universities.map((u) => ({ slug: u.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const u = getUniversity(slug);
  if (!u) return {};
  return {
    title: `Volunteer near ${u.name}`,
    description: `Verified volunteer opportunities and local nonprofit resources near ${u.name} in ${u.city}, Louisiana.`,
    alternates: { canonical: `/campuses/${u.slug}` },
  };
}

export default async function CampusPage({ params }: Props) {
  const { slug } = await params;
  const u = getUniversity(slug);
  if (!u) notFound();

  const near = opportunitiesNearCampus(u.slug).sort((a, b) => {
    const sa = a.cityKey === "statewide" ? 1 : 0;
    const sb = b.cityKey === "statewide" ? 1 : 0;
    return sa - sb || distanceFromCampus(a, u) - distanceFromCampus(b, u);
  });
  const local = near.filter((o) => o.cityKey !== "statewide");
  const statewide = near.filter((o) => o.cityKey === "statewide");
  const orgs = [...new Set(local.map((o) => o.orgSlug))].map((s) => getOrganization(s)!).filter(Boolean);

  return (
    <>
      <header className="border-b border-hairline">
        <div className="container-line pt-8 pb-14 md:pt-10 md:pb-20">
          <Link href="/campuses" className="link inline-flex min-h-11 items-center gap-2 text-[0.9375rem] font-semibold">
            <ArrowLeft aria-hidden className="size-4" />
            All campuses
          </Link>
          <Station className="mt-8 mb-6" />
          <CampusStatusBadge status={u.status} />
          <h1 className="text-display-lg mt-5 max-w-4xl text-navy">{u.name}</h1>
          <p className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-[1.0625rem] text-ink-muted">
            <span className="inline-flex items-center gap-2">
              <MapPin aria-hidden className="size-4 text-forest" />
              {u.city}, Louisiana
            </span>
            <span className="inline-flex items-center gap-2">
              <Globe2 aria-hidden className="size-4 text-forest" />
              <ExternalLink href={u.website}>Official university website</ExternalLink>
            </span>
          </p>
          {u.status === "not_yet" ? (
            <p className="mt-6 max-w-2xl text-ink">
              {u.shortName} hasn&apos;t joined {site.name} — this page lists verified volunteer opportunities near campus so students can
              get started today. Want to help bring a campus team here?
            </p>
          ) : null}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={`/volunteer?campus=${u.slug}`} size="lg" icon="arrow">
              Search all opportunities near {u.shortName}
            </ButtonLink>
            {u.status !== "participating" ? (
              <ButtonLink href="#bring-to-campus" variant="secondary" size="lg">
                Bring This to Your Campus
              </ButtonLink>
            ) : null}
          </div>
        </div>
      </header>

      <section className="section-y" aria-labelledby="nearby-heading">
        <div className="container-line">
          <h2 id="nearby-heading" className="text-h2 text-navy">
            Volunteer opportunities nearby
          </h2>
          <p className="text-lead mt-4 max-w-2xl text-ink-muted">
            {local.length
              ? `${local.length} verified local listing${local.length === 1 ? "" : "s"} within about 55 miles of ${u.shortName}, plus ${statewide.length} statewide.`
              : `We haven't verified local listings near ${u.shortName} yet. These statewide programs are open to you now.`}
          </p>
          <ul className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {near.slice(0, 9).map((o) => (
              <li key={o.slug}>
                <OpportunityCard o={o} org={orgName(o)} distance={distanceFromCampus(o, u)} />
              </li>
            ))}
          </ul>
          {near.length > 9 ? (
            <ButtonLink href={`/volunteer?campus=${u.slug}`} variant="secondary" icon="arrow" className="mt-8">
              See all {near.length} listings
            </ButtonLink>
          ) : null}
          {!local.length ? (
            <p className="mt-8 text-ink-muted">
              Know an organization near {u.city} that needs volunteers?{" "}
              <Link href="/volunteer/submit" className="link">
                Submit it for review
              </Link>
              .
            </p>
          ) : null}
        </div>
      </section>

      <section className="border-y border-hairline bg-sand section-y" aria-label="Campus details">
        <div className="container-line grid gap-12 lg:grid-cols-3">
          <div>
            <h2 className="text-h3 text-navy">Local nonprofit resources</h2>
            {orgs.length ? (
              <ul className="mt-5 space-y-3">
                {orgs.map((o) => (
                  <li key={o.slug}>
                    <ExternalLink href={o.website} className="font-semibold">
                      {o.name}
                    </ExternalLink>
                    <p className="mt-0.5 text-[0.875rem] text-ink-muted">{o.summary}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-ink-muted">None verified yet within about 55 miles. Statewide programs are listed above.</p>
            )}
          </div>
          <div>
            <h2 className="text-h3 text-navy">Upcoming {site.shortName} events</h2>
            <div className="mt-5 flex gap-3 rounded-md border border-dashed border-hairline-strong bg-paper/60 p-5">
              <CalendarX2 aria-hidden className="size-6 shrink-0 text-ink-muted" strokeWidth={1.5} />
              <p className="text-[0.9375rem] text-ink-muted">
                No events scheduled at {u.shortName} yet.{" "}
                <Link href="/events" className="link">
                  See what we&apos;re planning
                </Link>
                .
              </p>
            </div>
          </div>
          <div>
            <h2 className="text-h3 text-navy">Student leadership contact</h2>
            <div className="mt-5 flex gap-3 rounded-md border border-hairline bg-paper p-5">
              <UserRound aria-hidden className="size-6 shrink-0 text-ink-muted" strokeWidth={1.5} />
              {u.studentContact ? (
                <p className="text-[0.9375rem]">
                  <span className="font-semibold">{u.studentContact.name}</span>, {u.studentContact.role}
                </p>
              ) : (
                <p className="text-[0.9375rem] text-ink-muted">
                  Not yet confirmed. We only list a campus contact after they&apos;ve agreed to represent the initiative.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section id="bring-to-campus" className="section-y" aria-labelledby="involve-heading">
        <div className="container-line grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 id="involve-heading" className="text-h2 text-navy">
              How to get involved at {u.shortName}
            </h2>
            <ul className="mt-8 space-y-5">
              <li>
                <p className="font-semibold text-navy">Volunteer now</p>
                <p className="mt-1 text-ink-muted">Use the listings above — every one links to the organization&apos;s official sign-up.</p>
              </li>
              <li>
                <p className="font-semibold text-navy">Represent your campus</p>
                <p className="mt-1 text-ink-muted">Help organize events and bring Geaux Give Week to {u.shortName}.</p>
              </li>
              <li>
                <p className="font-semibold text-navy">Bring your organization</p>
                <p className="mt-1 text-ink-muted">Student governments, Greek chapters, clubs and service groups are all welcome.</p>
              </li>
            </ul>
          </div>
          <div className="rounded-md border border-hairline bg-paper p-6 sm:p-10 lg:col-span-7">
            <h3 className="text-h3 text-navy">Interested in representing {u.shortName}?</h3>
            <p className="mt-2 mb-8 text-[0.9375rem] text-ink-muted">Tell us about yourself. We reply to every inquiry by email.</p>
            <CampusRepForm defaultCampus={u.slug} />
          </div>
        </div>
      </section>
    </>
  );
}
