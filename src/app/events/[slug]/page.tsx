import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { CampusRepForm, UpdatesSignup } from "@/components/forms/Forms";
import { ButtonLink } from "@/components/ui/Button";
import { Badge, Station } from "@/components/ui/primitives";
import { causes, cities } from "@/data/reference/geography";
import { communityEvents, getEvent } from "@/data/programs/events";
import { formatDateRange } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return communityEvents.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const e = getEvent(slug);
  if (!e) return {};
  return {
    title: e.title,
    description: `${e.summary}${e.status === "concept" ? " This event series is in planning and not yet scheduled." : ""}`,
    alternates: { canonical: `/events/${e.slug}` },
  };
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params;
  const e = getEvent(slug);
  if (!e) notFound();
  const scheduled = e.status === "scheduled" && e.startDate;

  return (
    <article>
      <header className="border-b border-hairline">
        <div className="container-line pt-8 pb-14 md:pt-10 md:pb-20">
          <Link href="/events" className="link inline-flex min-h-11 items-center gap-2 text-[0.9375rem] font-semibold">
            <ArrowLeft aria-hidden className="size-4" />
            All events
          </Link>
          <Station className="mt-8 mb-6" />
          <div className="flex flex-wrap gap-2">
            {scheduled ? (
              <Badge tone="gold">{formatDateRange(e.startDate!, e.endDate)}</Badge>
            ) : (
              <Badge tone="hollow">Concept — not yet scheduled</Badge>
            )}
            <Badge tone="hollow">{causes[e.cause].label}</Badge>
            {e.cityKey ? <Badge tone="hollow">{cities[e.cityKey].name}</Badge> : null}
          </div>
          <h1 className="text-display-lg mt-6 max-w-4xl text-navy">{e.title}</h1>
          <p className="text-lead mt-6 max-w-3xl text-ink-muted">{e.summary}</p>
          {scheduled && e.registrationUrl ? (
            <ButtonLink href={e.registrationUrl} size="lg" icon="external" className="mt-9">
              Register for this event
            </ButtonLink>
          ) : null}
        </div>
      </header>

      <div className="container-line grid gap-14 py-14 md:py-20 lg:grid-cols-12">
        <div className="lg:col-span-7">
          {!scheduled ? (
            <div className="rounded-md border border-gold/60 bg-gold-tint p-5 text-ink">
              <p>
                <strong>This is a planned event series, not a scheduled event.</strong> There is no date, location or host yet. When one is
                confirmed it will appear on the Events page with a registration link.
              </p>
            </div>
          ) : null}
          <h2 className="text-h3 mt-10 text-navy">The idea</h2>
          <p className="mt-4 measure text-[1.0625rem]">{e.description}</p>

          <div className="mt-12 grid gap-10 sm:grid-cols-2">
            <div>
              <h2 className="text-h3 text-navy">What to expect</h2>
              <ul className="mt-4 space-y-3">
                {e.whatToExpect.map((x) => (
                  <li key={x} className="flex gap-3 text-[0.9375rem]">
                    <CheckCircle2 aria-hidden className="mt-0.5 size-5 shrink-0 text-forest" />
                    {x}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-h3 text-navy">Ways to help now</h2>
              <ul className="mt-4 space-y-3">
                {e.waysToHelp.map((x) => (
                  <li key={x} className="flex gap-3 text-[0.9375rem]">
                    <CheckCircle2 aria-hidden className="mt-0.5 size-5 shrink-0 text-forest" />
                    {x}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <section className="mt-16 border-t border-hairline pt-12" aria-labelledby="host-heading">
            <h2 id="host-heading" className="text-h2 text-navy">
              Want to help organize {e.title.toLowerCase().startsWith("the") ? e.title : `a ${e.title}`}?
            </h2>
            <p className="mt-3 mb-8 text-ink-muted">Tell us about your campus and organization. We&apos;ll follow up by email.</p>
            <CampusRepForm submitLabel="Send interest" />
          </section>
        </div>
        <aside className="lg:col-span-5">
          <div className="rounded-md border border-hairline bg-paper p-6 sm:p-8 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
            <h2 className="text-h3 text-navy">Get notified when it&apos;s scheduled</h2>
            <p className="mt-2 mb-6 text-[0.9375rem] text-ink-muted">We&apos;ll email you once — when a date near your campus is confirmed.</p>
            <UpdatesSignup />
          </div>
        </aside>
      </div>
    </article>
  );
}
