import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, CheckCircle2, Clock, Globe2, MapPin, School, Users } from "lucide-react";
import { ListingDateBadge } from "@/components/directory/ListingDateBadge";
import { OpportunityCard } from "@/components/directory/OpportunityCard";
import { ButtonLink } from "@/components/ui/Button";
import { Badge, ExternalLink, VerifiedLine } from "@/components/ui/primitives";
import { site } from "@/config/site";
import { causes, cities, universities } from "@/data/reference/geography";
import { getOrganization } from "@/data/verified/organizations";
import { getOpportunity, labels, opportunities, orgName } from "@/lib/directory";
import { formatDate, formatDateRange } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return opportunities.map((o) => ({ slug: o.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const o = getOpportunity(slug);
  if (!o) return {};
  return {
    title: `${o.title} — ${orgName(o)}`,
    description: o.summary,
    alternates: { canonical: `/volunteer/${o.slug}` },
  };
}

export default async function OpportunityPage({ params }: Props) {
  const { slug } = await params;
  const o = getOpportunity(slug);
  if (!o) notFound();
  const org = getOrganization(o.orgSlug);
  const orgLabel = orgName(o);
  const place = o.cityKey === "statewide" ? "Statewide" : cities[o.cityKey].name;
  const nearby = universities.filter((u) => o.nearbyCampuses.includes(u.slug));
  const related = opportunities
    .filter((x) => x.slug !== o.slug && (x.cause === o.cause || x.cityKey === o.cityKey))
    .slice(0, 3);

  const facts = [
    { icon: MapPin, label: "Location", value: `${o.location}` },
    { icon: Globe2, label: "Service area", value: o.serviceArea },
    { icon: Clock, label: "Time commitment", value: o.timeCommitment },
    { icon: Users, label: "Who can volunteer", value: labels.group[o.groupEligibility] + (o.groupNotes ? ` — ${o.groupNotes}` : "") },
    {
      icon: CalendarDays,
      label: "Schedule",
      value: o.kind === "event" && o.startDate ? formatDateRange(o.startDate, o.endDate) : labels.frequency[o.frequency],
    },
    { icon: CheckCircle2, label: "Minimum age", value: o.minimumAge ? `${o.minimumAge}+ (see requirements)` : "Not stated — check with the organization" },
  ];

  return (
    <>
      <article>
        <header className="border-b border-hairline">
          <div className="container-line pt-8 pb-12 md:pt-10 md:pb-16">
            <Link href="/volunteer" className="link inline-flex min-h-11 items-center gap-2 text-[0.9375rem] font-semibold">
              <ArrowLeft aria-hidden className="size-4" />
              Back to the finder
            </Link>
            <div className="mt-6 flex flex-wrap gap-2">
              {o.kind === "event" && o.startDate ? (
                <ListingDateBadge o={o} label="page" />
              ) : (
                <Badge tone="forest">{labels.kind.resource}</Badge>
              )}
              <Badge tone="hollow">{causes[o.cause].label}</Badge>
              <Badge tone="hollow">{place}</Badge>
            </div>
            <p className="mt-6 text-[1.0625rem] font-semibold text-forest">{orgLabel}</p>
            <h1 className="text-display-lg mt-2 max-w-4xl text-navy">{o.title}</h1>
            <p className="text-lead mt-6 max-w-3xl text-ink-muted">{o.summary}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href={o.signupUrl} size="lg" icon="external">
                Volunteer with {org?.name.split(" (")[0] ?? "this organization"}
              </ButtonLink>
              {o.infoUrl !== o.signupUrl ? (
                <ButtonLink href={o.infoUrl} variant="secondary" size="lg" icon="external">
                  Read their volunteer page
                </ButtonLink>
              ) : null}
            </div>
            <VerifiedLine date={formatDate(o.lastVerified)} className="mt-6" />
          </div>
        </header>

        <div className="container-line grid gap-14 py-14 md:py-20 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 className="text-h3 text-navy">About this opportunity</h2>
            <p className="mt-4 measure text-[1.0625rem]">{o.description}</p>

            {o.roles?.length ? (
              <>
                <h2 className="text-h3 mt-12 text-navy">Shifts and roles</h2>
                <p className="mt-3 text-[0.9375rem] text-ink-muted">
                  Each role has its own sign-up page and its own age rule, as {orgLabel} posts them.
                </p>
                <ul className="mt-5 divide-y divide-hairline rounded-md border border-hairline bg-paper">
                  {o.roles.map((r) => (
                    <li key={r.signupUrl} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:p-5">
                      <div>
                        <p className="font-semibold text-navy">{r.name}</p>
                        <p className="mt-1 text-[0.9375rem] text-ink-muted">{r.when}</p>
                        <p className="mt-1 text-[0.875rem] font-semibold text-gold-ink">{r.ages}</p>
                      </div>
                      <ExternalLink href={r.signupUrl} className="shrink-0 text-[0.9375rem] font-semibold">
                        Sign up<span className="sr-only"> for {r.name}</span>
                      </ExternalLink>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            <h2 className="text-h3 mt-12 text-navy">Requirements</h2>
            <ul className="mt-4 space-y-3">
              {o.requirements.map((r) => (
                <li key={r} className="flex gap-3">
                  <CheckCircle2 aria-hidden className="mt-1 size-5 shrink-0 text-forest" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>

            <div className="mt-12 rounded-md border border-gold/60 bg-gold-tint p-5 text-[0.9375rem] text-ink">
              <p>
                <strong>Before you go:</strong> requirements and schedules can change. Registration, waivers and shift confirmations
                happen on {orgLabel}&apos;s own system. {site.name} lists this opportunity for information only and is not affiliated with{" "}
                {orgLabel}.
              </p>
            </div>
          </div>

          <aside className="lg:col-span-5" aria-label="Opportunity details">
            <dl className="divide-y divide-hairline rounded-md border border-hairline bg-paper">
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
                <School aria-hidden className="mt-0.5 size-5 shrink-0 text-forest" />
                <div>
                  <dt className="text-label text-ink-muted">Nearby campuses</dt>
                  <dd className="mt-2 flex flex-wrap gap-1.5">
                    {nearby.length === universities.length ? (
                      <span className="text-[0.9375rem]">Open to students at every campus in our search area</span>
                    ) : (
                      nearby.map((u) => (
                        <Link
                          key={u.slug}
                          href={`/campuses/${u.slug}`}
                          className="rounded-sm border border-hairline-strong px-2 py-1 text-[0.8125rem] font-medium hover:border-ink"
                        >
                          {u.shortName}
                        </Link>
                      ))
                    )}
                  </dd>
                </div>
              </div>
              {org ? (
                <div className="flex gap-4 p-5">
                  <Globe2 aria-hidden className="mt-0.5 size-5 shrink-0 text-forest" />
                  <div>
                    <dt className="text-label text-ink-muted">Organization website</dt>
                    <dd className="mt-1.5 text-[0.9375rem]">
                      <ExternalLink href={org.website}>{org.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}</ExternalLink>
                    </dd>
                  </div>
                </div>
              ) : null}
            </dl>
          </aside>
        </div>
      </article>

      {related.length ? (
        <section className="border-t border-hairline bg-sand section-y" aria-labelledby="related-heading">
          <div className="container-line">
            <h2 id="related-heading" className="text-h2 text-navy">
              Similar ways to help
            </h2>
            <ul className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <li key={r.slug}>
                  <OpportunityCard o={r} org={orgName(r)} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </>
  );
}
