import Link from "next/link";
import { ArrowUpRight, CalendarDays, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/primitives";
import { causes, cities } from "@/data/reference/geography";
import { labels } from "@/lib/directory";
import { cx, formatDateRange, formatShortDate } from "@/lib/format";
import type { Opportunity } from "@/lib/types";

export function OpportunityCard({
  o,
  org,
  distance,
  headingLevel = "h3",
  className,
  revealItem,
}: {
  o: Opportunity;
  org: string;
  distance?: number | null;
  headingLevel?: "h2" | "h3";
  className?: string;
  revealItem?: boolean;
}) {
  const H = headingLevel;
  const place = o.cityKey === "statewide" ? "Statewide" : cities[o.cityKey].name;
  return (
    <article
      {...(revealItem ? { "data-reveal-item": "" } : {})}
      className={cx("card-lift relative flex h-full flex-col rounded-md border border-hairline bg-paper p-5 sm:p-6", className)}
    >
      <div className="flex flex-wrap items-center gap-2">
        {o.kind === "event" && o.startDate ? (
          <Badge tone="gold">
            <span className="sr-only">Dated event: </span>
            {formatDateRange(o.startDate, o.endDate)}
          </Badge>
        ) : (
          <Badge tone="forest">{labels.kind.resource}</Badge>
        )}
        <Badge tone="hollow">{causes[o.cause].label}</Badge>
      </div>

      <p className="mt-4 text-[0.875rem] font-semibold text-forest">{org}</p>
      <H className="text-h3 mt-1 text-navy">
        <Link href={`/volunteer/${o.slug}`} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
          {o.title}
        </Link>
      </H>
      <p className="mt-3 line-clamp-3 text-[0.9375rem] text-ink-muted">{o.summary}</p>

      <dl className="mt-5 grid gap-2 text-[0.875rem] text-ink">
        <div className="flex items-center gap-2">
          <dt className="sr-only">Location</dt>
          <MapPin aria-hidden className="size-4 shrink-0 text-ink-muted" />
          <dd>
            {place}
            {distance != null && distance > 0 ? <span className="text-ink-muted"> · about {Math.round(distance)} mi</span> : null}
          </dd>
        </div>
        <div className="flex items-center gap-2">
          <dt className="sr-only">Who can volunteer</dt>
          <Users aria-hidden className="size-4 shrink-0 text-ink-muted" />
          <dd>{labels.group[o.groupEligibility]}</dd>
        </div>
        <div className="flex items-center gap-2">
          <dt className="sr-only">Schedule</dt>
          <CalendarDays aria-hidden className="size-4 shrink-0 text-ink-muted" />
          <dd>{labels.frequency[o.frequency]}</dd>
        </div>
      </dl>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-6">
        <p className="text-[0.8125rem] text-ink-muted">Verified {formatShortDate(o.lastVerified)}</p>
        <a
          href={o.signupUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="relative z-10 inline-flex min-h-11 items-center gap-1.5 rounded-sm bg-forest px-4 text-[0.9375rem] font-semibold text-white transition-colors hover:bg-forest-deep"
        >
          Volunteer
          <ArrowUpRight aria-hidden className="size-4" />
          <span className="sr-only"> with {org} on their official site (opens in a new tab)</span>
        </a>
      </div>
    </article>
  );
}

export function OpportunityCardSkeleton() {
  return (
    <div className="flex h-full flex-col rounded-md border border-hairline bg-paper p-6" aria-hidden>
      <div className="flex gap-2">
        <div className="h-6 w-28 animate-pulse rounded-sm bg-sand" />
        <div className="h-6 w-24 animate-pulse rounded-sm bg-sand" />
      </div>
      <div className="mt-5 h-4 w-40 animate-pulse rounded-sm bg-sand" />
      <div className="mt-3 h-6 w-3/4 animate-pulse rounded-sm bg-sand" />
      <div className="mt-4 space-y-2">
        <div className="h-3.5 w-full animate-pulse rounded-sm bg-sand" />
        <div className="h-3.5 w-11/12 animate-pulse rounded-sm bg-sand" />
      </div>
      <div className="mt-8 h-11 w-32 animate-pulse self-end rounded-sm bg-sand" />
    </div>
  );
}
