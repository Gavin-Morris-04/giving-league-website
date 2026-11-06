import Link from "next/link";
import { ArrowUpRight, HandHeart, MapPin, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/primitives";
import { causes, cities } from "@/data/reference/geography";
import { audienceLabel, eventTypeLabels, participationLabels } from "@/lib/charity-events";
import { cx, formatShortDate } from "@/lib/format";
import type { CharityEvent } from "@/lib/types";
import { EventTimingBadge, EventTimingLine } from "./EventTiming";

export function CharityEventCard({ e, className, revealItem }: { e: CharityEvent; className?: string; revealItem?: boolean }) {
  const place = e.cityKey === "statewide" ? "Statewide" : cities[e.cityKey].name;
  return (
    <article
      {...(revealItem ? { "data-reveal-item": "" } : {})}
      className={cx("card-lift relative flex h-full flex-col rounded-md border border-hairline bg-paper p-5 sm:p-6", className)}
    >
      <div className="flex flex-wrap items-center gap-2">
        <EventTimingBadge event={e} />
        <Badge tone="hollow">{eventTypeLabels[e.type]}</Badge>
      </div>
      <p className="mt-4 text-[0.875rem] font-semibold text-forest">{e.host}</p>
      <h3 className="text-h3 mt-1 text-navy">
        <Link href={`/events/${e.slug}`} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
          {e.name}
        </Link>
      </h3>
      <p className="mt-3 line-clamp-3 text-[0.9375rem] text-ink-muted">{e.summary}</p>

      <div className="mt-5 grid gap-2 text-[0.875rem] text-ink">
        <EventTimingLine event={e} />
        <p className="flex items-start gap-2">
          <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-ink-muted" />
          <span>
            {place}
            <span className="text-ink-muted"> · {causes[e.cause].label}</span>
          </span>
        </p>
        <p className="flex items-start gap-2">
          <HandHeart aria-hidden className="mt-0.5 size-4 shrink-0 text-ink-muted" />
          <span>{e.participation.map((p) => participationLabels[p]).join(" · ")}</span>
        </p>
        <p className="flex items-start gap-2">
          <ShieldCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-ink-muted" />
          <span className={e.audience.highSchool === "unverified" ? "text-ink-muted" : undefined}>{audienceLabel(e)}</span>
        </p>
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-6">
        <p className="text-[0.8125rem] text-ink-muted">Verified {formatShortDate(e.lastVerified)}</p>
        <a
          href={e.registrationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="relative z-10 inline-flex min-h-11 items-center gap-1.5 rounded-sm bg-forest px-4 text-[0.9375rem] font-semibold text-white transition-colors hover:bg-forest-deep"
        >
          Official site
          <ArrowUpRight aria-hidden className="size-4" />
          <span className="sr-only"> for {e.name} (opens in a new tab)</span>
        </a>
      </div>
    </article>
  );
}
