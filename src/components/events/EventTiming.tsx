"use client";

import { CalendarCheck2, CalendarClock, History } from "lucide-react";
import { Badge } from "@/components/ui/primitives";
import { eventTiming, recurrenceLabels } from "@/lib/charity-events";
import { cx, formatDate, formatDateRange } from "@/lib/format";
import type { CharityEvent } from "@/lib/types";
import { useToday } from "@/lib/use-today";

/** Status badge — upcoming / happening now / awaiting next date / past. */
export function EventTimingBadge({ event }: { event: CharityEvent }) {
  const t = eventTiming(event, useToday());
  if (t.state === "upcoming") return <Badge tone="gold">{formatDateRange(t.startDate, t.endDate)}</Badge>;
  if (t.state === "happening") return <Badge tone="forest">Happening now</Badge>;
  if (t.state === "past") return <Badge tone="hollow">Past event</Badge>;
  return <Badge tone="hollow">{recurrenceLabels[event.recurrence]} · next date TBA</Badge>;
}

/** Full timing line for cards and detail pages. */
export function EventTimingLine({ event, className, detailed = false }: { event: CharityEvent; className?: string; detailed?: boolean }) {
  const t = eventTiming(event, useToday());
  if (t.state === "upcoming" || t.state === "happening") {
    return (
      <p className={cx("flex items-start gap-2", className)}>
        <CalendarCheck2 aria-hidden className="mt-0.5 size-4 shrink-0 text-forest" />
        <span>
          <span className="font-semibold">{t.state === "happening" ? "Happening now: " : ""}{formatDateRange(t.startDate, t.endDate)}</span>
          {t.time ? <span> · {t.time}</span> : null}
          {detailed ? <span className="block text-[0.875rem] text-ink-muted">Confirmed on the organizer&apos;s official site.</span> : null}
        </span>
      </p>
    );
  }
  if (t.state === "past") {
    return (
      <p className={cx("flex items-start gap-2 text-ink-muted", className)}>
        <History aria-hidden className="mt-0.5 size-4 shrink-0" />
        <span>
          {t.lastHeld ? <>Held {formatDateRange(t.lastHeld.startDate, t.lastHeld.endDate)}. </> : null}
          No future date has been announced.
        </span>
      </p>
    );
  }
  return (
    <p className={cx("flex items-start gap-2", className)}>
      <CalendarClock aria-hidden className="mt-0.5 size-4 shrink-0 text-ink-muted" />
      <span>
        {t.typicalTiming}. <span className="text-ink-muted">Next event date not yet confirmed.</span>
        {detailed && t.lastHeld ? (
          <span className="block text-[0.875rem] text-ink-muted">
            Most recently held {formatDate(t.lastHeld.startDate)}
            {t.lastHeld.endDate ? `–${formatDate(t.lastHeld.endDate)}` : ""} — shown for reference, not as the next date.
          </span>
        ) : null}
      </span>
    </p>
  );
}
