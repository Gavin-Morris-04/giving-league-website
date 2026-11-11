import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Globe2, MapPin } from "lucide-react";
import { CampusStatusBadge } from "@/components/campuses/CampusStatusBadge";
import { OpportunityCard } from "@/components/directory/OpportunityCard";
import { ButtonLink } from "@/components/ui/Button";
import { ExternalLink, Station } from "@/components/ui/primitives";
import { site } from "@/config/site";
import { getUniversity, universities } from "@/data/reference/geography";
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
              <ButtonLink href="/campuses#bring-to-campus" variant="secondary" size="lg">
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

      <section className="border-t border-hairline bg-sand section-y" aria-labelledby="involve-heading">
        <div className="container-line flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <h2 id="involve-heading" className="text-h2 text-navy">
              Help start a team at {u.shortName}
            </h2>
            <p className="text-lead mt-4 text-ink-muted">
              Student governments, Greek chapters, clubs and service groups can help organize service on campus — and bring Geaux Give Week
              (coming soon, college-only) to {u.shortName}.
            </p>
          </div>
          <ButtonLink href="/campuses#bring-to-campus" size="lg" icon="arrow" className="shrink-0">
            Bring This to Your Campus
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
