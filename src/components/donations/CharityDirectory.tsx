"use client";

import { useId, useMemo, useState } from "react";
import { ArrowUpRight, BarChart3, Globe2, MapPin, Search } from "lucide-react";
import { Badge } from "@/components/ui/primitives";
import { charities, charityCauses } from "@/data/verified/charities";
import { cx } from "@/lib/format";
import type { Charity, CharityCause } from "@/lib/types";
import { TrackedLink } from "./TrackedLink";

const reporting: Record<Charity["trackingStatus"], string> = {
  none: "Donation reporting: not connected",
  pending_setup: "Donation reporting: being set up",
  manual: "Donation reporting: verified reports",
  integration: "Donation reporting: approved integration",
};

export function CharityCard({ c }: { c: Charity }) {
  return (
    <article className="card-lift flex h-full flex-col rounded-md border border-hairline bg-paper p-5 sm:p-6">
      <Badge tone="hollow" className="self-start">
        {charityCauses[c.cause]}
      </Badge>
      <h3 className="text-h3 mt-4 text-navy">{c.name}</h3>
      <p className="mt-3 text-[0.9375rem] text-ink-muted">{c.description}</p>
      <dl className="mt-5 grid gap-2 text-[0.875rem]">
        <div className="flex items-start gap-2">
          <dt className="sr-only">Location</dt>
          <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-ink-muted" />
          <dd>{c.scope}</dd>
        </div>
        <div className="flex items-start gap-2">
          <dt className="sr-only">Official website</dt>
          <Globe2 aria-hidden className="mt-0.5 size-4 shrink-0 text-ink-muted" />
          <dd className="truncate">{c.websiteUrl.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}</dd>
        </div>
        <div className="flex items-start gap-2">
          <dt className="sr-only">Donation reporting</dt>
          <BarChart3 aria-hidden className="mt-0.5 size-4 shrink-0 text-ink-muted" />
          <dd className="text-ink-muted">
            {reporting[c.trackingStatus]}
            {c.campaignDonationUrl ? null : " · no dedicated campaign yet"}
          </dd>
        </div>
      </dl>
      <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-3 pt-6">
        <TrackedLink
          href={c.campaignDonationUrl ?? c.officialDonationUrl}
          charity={c.id}
          event={c.campaignDonationUrl ? "campaign_click" : "donate_click"}
          srLabel={` — official ${c.campaignDonationUrl ? "campaign" : "donation"} page`}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-sm bg-forest px-4 text-[0.9375rem] font-semibold text-white transition-colors hover:bg-forest-deep"
        >
          Donate to {c.shortName}
          <ArrowUpRight aria-hidden className="size-4" />
        </TrackedLink>
        <TrackedLink href={c.websiteUrl} charity={c.id} event="learn_more_click" className="link inline-flex min-h-11 items-center gap-1 font-semibold">
          Learn More
          <ArrowUpRight aria-hidden className="size-4" />
        </TrackedLink>
      </div>
    </article>
  );
}

export function CharityDirectory() {
  const ids = useId();
  const [q, setQ] = useState("");
  const [cause, setCause] = useState<CharityCause | "">("");
  const causesInUse = useMemo(() => [...new Set(charities.map((c) => c.cause))], []);
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return charities.filter(
      (c) => (!cause || c.cause === cause) && (!t || [c.name, c.description, c.scope, charityCauses[c.cause]].join(" ").toLowerCase().includes(t)),
    );
  }, [q, cause]);

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <div className="relative" role="search">
          <label htmlFor={`${ids}-q`} className="sr-only">
            Search charities
          </label>
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-ink-muted" />
          <input
            id={`${ids}-q`}
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, cause or place"
            className="field pl-11!"
            autoComplete="off"
            autoCapitalize="none"
          />
        </div>
        <p className="text-[0.9375rem] text-ink" aria-live="polite">
          <span className="font-semibold tabular">{list.length}</span> {list.length === 1 ? "charity" : "charities"}
        </p>
      </div>
      <div role="group" aria-label="Filter by cause" className="mt-4 flex flex-wrap gap-2">
        {[{ value: "" as const, label: "All causes" }, ...causesInUse.map((c) => ({ value: c, label: charityCauses[c] }))].map((o) => (
          <button
            key={o.value || "all"}
            type="button"
            aria-pressed={cause === o.value}
            onClick={() => setCause(o.value)}
            className={cx(
              "min-h-10 rounded-sm border px-3 text-[0.875rem] font-medium transition-colors",
              cause === o.value ? "border-forest bg-forest text-white" : "border-hairline-strong bg-paper text-ink hover:border-ink",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
      {list.length ? (
        <ul className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {list.map((c) => (
            <li key={c.id}>
              <CharityCard c={c} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-8 rounded-md border border-dashed border-hairline-strong p-8 text-center text-ink-muted">
          No charities match that search.{" "}
          <button type="button" className="link font-semibold" onClick={() => { setQ(""); setCause(""); }}>
            Show all
          </button>
        </p>
      )}
    </div>
  );
}
