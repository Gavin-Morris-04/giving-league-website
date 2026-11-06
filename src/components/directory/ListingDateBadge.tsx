"use client";

import { Badge } from "@/components/ui/primitives";
import { formatDateRange } from "@/lib/format";
import { isEndedListing } from "@/lib/listing-dates";
import type { Opportunity } from "@/lib/types";
import { useToday } from "@/lib/use-today";

/** Date badge for a dated listing, checked against the visitor's real date (static pages can be a few days old). */
export function ListingDateBadge({ o, label = "card" }: { o: Pick<Opportunity, "kind" | "startDate" | "endDate">; label?: "card" | "page" }) {
  const today = useToday();
  if (o.kind !== "event" || !o.startDate) return null;
  const range = formatDateRange(o.startDate, o.endDate);
  if (isEndedListing(o, today)) {
    return <Badge tone="hollow">Dates have passed · {range}</Badge>;
  }
  return (
    <Badge tone="gold">
      {label === "page" ? "Dated event · " : <span className="sr-only">Dated event: </span>}
      {range}
    </Badge>
  );
}
