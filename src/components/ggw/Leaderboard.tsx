"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { universities } from "@/data/reference/geography";
import type { FundraisingCampaign } from "@/lib/types";
import { cx } from "@/lib/format";

type Tab = "total" | "perStudent" | "orgs" | "campaign";
const TABS: { id: Tab; label: string }[] = [
  { id: "total", label: "Total by university" },
  { id: "perStudent", label: "Per enrolled student" },
  { id: "orgs", label: "Top student organizations" },
  { id: "campaign", label: "Campaign total" },
];

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

/**
 * Future leaderboard. While `campaign.status !== "live"` (or totals are null) it renders a preview with no
 * numbers, no rankings and a plain explanation. When live, it ranks only verified totals.
 */
export function Leaderboard({ campaign }: { campaign: FundraisingCampaign }) {
  const [tab, setTab] = useState<Tab>("total");
  const ids = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const live = campaign.status !== "planning" && campaign.totals !== null;

  const onKey = (e: KeyboardEvent, i: number) => {
    let next = i;
    if (e.key === "ArrowRight") next = (i + 1) % TABS.length;
    else if (e.key === "ArrowLeft") next = (i - 1 + TABS.length) % TABS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = TABS.length - 1;
    else return;
    e.preventDefault();
    setTab(TABS[next].id);
    refs.current[next]?.focus();
  };

  const rows = universities
    .map((u) => {
      const t = campaign.totals?.[u.slug];
      return { u, raised: t?.raised ?? null, per: t && t.enrolled ? t.raised / t.enrolled : null };
    })
    .sort((a, b) => {
      if (!live) return a.u.name.localeCompare(b.u.name);
      const ka = tab === "perStudent" ? a.per : a.raised;
      const kb = tab === "perStudent" ? b.per : b.raised;
      return (kb ?? -1) - (ka ?? -1);
    });

  const campaignTotal = live ? Object.values(campaign.totals!).reduce((s, t) => s + t.raised, 0) : null;

  return (
    <div className="on-dark rounded-md border border-navy-line bg-navy-deep text-ivory">
      <div className="flex flex-col gap-4 border-b border-navy-line p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div>
          <p className="text-event text-3xl text-gold sm:text-4xl">Statewide leaderboard</p>
          <p className="mt-1 text-[0.875rem] text-navy-muted">
            {live ? "Verified by the beneficiary's fundraising platform." : "Preview — fundraising has not started."}
          </p>
        </div>
        <span className="text-event self-start rounded-sm border border-gold/50 px-2.5 py-1 text-base tracking-[0.06em] text-gold sm:self-auto">
          {live ? "Live" : "Opens Spring 2027 (tentative)"}
        </span>
      </div>

      <div role="tablist" aria-label="Leaderboard views" className="flex gap-1 overflow-x-auto border-b border-navy-line px-3 sm:px-5">
        {TABS.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            role="tab"
            type="button"
            id={`${ids}-tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`${ids}-panel`}
            tabIndex={tab === t.id ? 0 : -1}
            onClick={() => setTab(t.id)}
            onKeyDown={(e) => onKey(e, i)}
            className={cx(
              "relative min-h-12 shrink-0 px-3 text-[0.9375rem] font-semibold whitespace-nowrap transition-colors",
              tab === t.id ? "text-ivory" : "text-navy-muted hover:text-ivory",
              "after:absolute after:inset-x-3 after:bottom-0 after:h-[3px] after:bg-gold after:transition-transform",
              tab === t.id ? "after:scale-x-100" : "after:scale-x-0",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`${ids}-panel`} aria-labelledby={`${ids}-tab-${tab}`} tabIndex={0} className="p-5 outline-none sm:p-7">
        {tab === "campaign" ? (
          <div className="py-6 text-center">
            <p className="text-label text-navy-muted">Raised across every campus</p>
            <p className="text-event mt-3 text-7xl text-gold sm:text-8xl tabular">{campaignTotal !== null ? usd.format(campaignTotal) : "$ — —"}</p>
            <p className="mx-auto mt-4 max-w-md text-[0.9375rem] text-navy-muted">
              {live
                ? "Every dollar goes directly to the beneficiary charity."
                : "The campaign-wide total will appear here once fundraising begins, updated from the beneficiary's own platform."}
            </p>
          </div>
        ) : tab === "orgs" ? (
          campaign.topOrganizations?.length ? (
            <ol className="divide-y divide-navy-line">
              {campaign.topOrganizations.map((o, i) => (
                <li key={o.name} className="flex items-center gap-4 py-3">
                  <span className="text-event w-8 text-2xl text-gold tabular">{i + 1}</span>
                  <span className="flex-1">
                    <span className="font-semibold">{o.name}</span>
                    <span className="block text-[0.8125rem] text-navy-muted">{o.university}</span>
                  </span>
                  <span className="text-event text-2xl tabular">{usd.format(o.raised)}</span>
                </li>
              ))}
            </ol>
          ) : (
            <div className="py-8 text-center">
              <p className="text-h3 text-ivory">Teams register when the campaign opens.</p>
              <p className="mx-auto mt-3 max-w-md text-[0.9375rem] text-navy-muted">
                Student governments, Greek chapters, clubs and service organizations will each be able to form a fundraising team for
                their university.
              </p>
            </div>
          )
        ) : (
          <>
            <table className="w-full text-left">
              <caption className="sr-only">
                {live
                  ? `Universities ranked by ${tab === "perStudent" ? "funds raised per enrolled student" : "total funds raised"}.`
                  : "Preview of the leaderboard layout. Universities are listed alphabetically; no totals exist yet and none have joined."}
              </caption>
              <thead>
                <tr className="text-label text-navy-muted">
                  <th scope="col" className="w-12 pb-3 font-semibold">
                    {live ? "Rank" : "#"}
                  </th>
                  <th scope="col" className="pb-3 font-semibold">
                    University
                  </th>
                  <th scope="col" className="pb-3 text-right font-semibold">
                    {tab === "perStudent" ? "Per student" : "Raised"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const value = tab === "perStudent" ? r.per : r.raised;
                  return (
                    <tr key={r.u.slug} className="border-t border-navy-line/70">
                      <td className="text-event py-3 text-xl text-navy-muted/70 tabular">{live ? i + 1 : "–"}</td>
                      <th scope="row" className="py-3 pr-4 text-[0.9375rem] font-medium text-ivory/90">
                        {r.u.name}
                      </th>
                      <td className="text-event py-3 text-right text-2xl tabular">
                        {value !== null ? (
                          <span className="text-gold">{tab === "perStudent" ? `$${value.toFixed(2)}` : usd.format(value)}</span>
                        ) : (
                          <span className="text-navy-muted/60" aria-label="No total yet">
                            — —
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!live ? (
              <p className="mt-5 border-t border-navy-line pt-4 text-[0.875rem] text-navy-muted">
                Listed alphabetically as a layout preview — not a ranking and not a list of participants. Rankings appear when fundraising
                begins, using only totals verified by the beneficiary charity&apos;s platform.
              </p>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
