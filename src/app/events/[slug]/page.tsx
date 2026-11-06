import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Banknote, CalendarRange, Globe2, HandHeart, MapPin, Repeat, ShieldCheck } from "lucide-react";
import { CharityEventCard } from "@/components/events/CharityEventCard";
import { EventTimingBadge, EventTimingLine } from "@/components/events/EventTiming";
import { ButtonLink } from "@/components/ui/Button";
import { Badge, ExternalLink, VerifiedLine } from "@/components/ui/primitives";
import { site } from "@/config/site";
import { causes, cities, regions } from "@/data/reference/geography";
import { charityEvents, getCharityEvent } from "@/data/verified/charity-events";
import { audienceLabel, costLabels, eventTypeLabels, participationLabels, recurrenceLabels } from "@/lib/charity-events";
import { formatDate } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return charityEvents.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const e = getCharityEvent(slug);
  if (!e) return {};
  return { title: `${e.name} — ${e.host}`, description: e.summary, alternates: { canonical: `/events/${e.slug}` } };
}

export default async function CharityEventPage({ params }: Props) {
  const { slug } = await params;
  const e = getCharityEvent(slug);
  if (!e) notFound();
  const city = cities[e.cityKey];
  const related = charityEvents.filter((x) => x.slug !== e.slug && (x.cause === e.cause || x.cityKey === e.cityKey)).slice(0, 3);

  const facts = [
    { icon: MapPin, label: "Location", value: `${e.location}${e.cityKey !== "statewide" ? ` · ${regions[city.region]}` : ""}` },
    { icon: Repeat, label: "Recurrence", value: `${recurrenceLabels[e.recurrence]} · ${e.typicalTiming}` },
    { icon: HandHeart, label: "Ways to take part", value: e.participation.map((p) => participationLabels[p]).join(" · ") },
    { icon: Banknote, label: "Cost", value: costLabels[e.cost] },
    { icon: ShieldCheck, label: "Who can take part", value: audienceLabel(e) + (e.audience.note ? ` — ${e.audience.note}` : "") },
  ];

  return (
    <>
      <article>
        <header className="border-b border-hairline">
          <div className="container-line pt-8 pb-12 md:pt-10 md:pb-16">
            <Link href="/events" className="link inline-flex min-h-11 items-center gap-2 text-[0.9375rem] font-semibold">
              <ArrowLeft aria-hidden className="size-4" />
              All charity events
            </Link>
            <div className="mt-6 flex flex-wrap gap-2">
              <EventTimingBadge event={e} />
              <Badge tone="hollow">{eventTypeLabels[e.type]}</Badge>
              <Badge tone="hollow">{causes[e.cause].label}</Badge>
            </div>
            <p className="mt-6 text-[1.0625rem] font-semibold text-forest">{e.host}</p>
            <h1 className="text-display-lg mt-2 max-w-4xl text-navy">{e.name}</h1>
            <p className="text-lead mt-6 max-w-3xl text-ink-muted">{e.summary}</p>
            <div className="mt-6 max-w-2xl rounded-md border border-hairline bg-paper p-4 text-[1rem]">
              <EventTimingLine event={e} detailed />
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href={e.registrationUrl} size="lg" icon="external">
                Go to the official event site
              </ButtonLink>
              {e.infoUrl !== e.registrationUrl ? (
                <ButtonLink href={e.infoUrl} variant="secondary" size="lg" icon="external">
                  Event details
                </ButtonLink>
              ) : null}
            </div>
            <VerifiedLine date={formatDate(e.lastVerified)} className="mt-6" />
          </div>
        </header>

        <div className="container-line grid gap-14 py-14 md:py-20 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 className="text-h3 text-navy">About this event</h2>
            <p className="mt-4 measure text-[1.0625rem]">{e.description}</p>
            <div className="mt-12 rounded-md border border-gold/60 bg-gold-tint p-5 text-[0.9375rem] text-ink">
              <p>
                <strong>Before you go:</strong> dates, routes, fees, age rules and supervision requirements are set by {e.host}. Register and
                confirm details on the official site. {site.name} lists this event for information only and isn&apos;t affiliated with the
                organizer.
              </p>
            </div>
          </div>
          <aside className="lg:col-span-5" aria-label="Event details">
            <dl className="divide-y divide-hairline rounded-md border border-hairline bg-paper">
              <div className="flex gap-4 p-5">
                <CalendarRange aria-hidden className="mt-0.5 size-5 shrink-0 text-forest" />
                <div>
                  <dt className="text-label text-ink-muted">Date</dt>
                  <dd className="mt-1.5 text-[0.9375rem]">
                    <EventTimingLine event={e} className="[&>svg]:hidden" />
                  </dd>
                </div>
              </div>
              {facts.map((f) => (
                <div key={f.label} className="flex gap-4 p-5">
                  <f.icon aria-hidden className="mt-0.5 size-5 shrink-0 text-forest" />
                  <div>
                    <dt className="text-label text-ink-muted">{f.label}</dt>
                    <dd className="mt-1.5 text-[0.9375rem]">{f.value}</dd>
                  </div>
                </div>
              ))}
              <div className="flex gap-4 p-5">
                <Globe2 aria-hidden className="mt-0.5 size-5 shrink-0 text-forest" />
                <div>
                  <dt className="text-label text-ink-muted">Host organization</dt>
                  <dd className="mt-1.5 text-[0.9375rem]">
                    <ExternalLink href={e.hostUrl}>{e.host}</ExternalLink>
                  </dd>
                </div>
              </div>
            </dl>
          </aside>
        </div>
      </article>

      {related.length ? (
        <section className="border-t border-hairline bg-sand section-y" aria-labelledby="related-events">
          <div className="container-line">
            <h2 id="related-events" className="text-h2 text-navy">
              Similar events
            </h2>
            <ul className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <li key={r.slug}>
                  <CharityEventCard e={r} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </>
  );
}
