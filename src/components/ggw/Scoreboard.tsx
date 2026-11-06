import { universities } from "@/data/reference/geography";
import { site } from "@/config/site";
import { cx } from "@/lib/format";

/**
 * Static scoreboard teaser. Shows the shape of the future leaderboard with dashes only — no numbers, no
 * rankings and no implied participants until an official campaign is live.
 */
export function ScoreboardTeaser({ rows = 6, className }: { rows?: number; className?: string }) {
  const list = universities.slice(0, rows);
  return (
    <figure className={cx("rounded-md border border-navy-line bg-navy-deep p-5 sm:p-7", className)} aria-labelledby="scoreboard-caption">
      <div className="flex items-center justify-between gap-4 border-b border-navy-line pb-4">
        <p className="text-event text-2xl text-gold sm:text-3xl">{site.flagship.name}</p>
        <p className="text-event rounded-sm border border-gold/50 px-2 py-1 text-sm text-gold tracking-[0.06em]">Preview</p>
      </div>
      <table className="mt-2 w-full text-left">
        <caption id="scoreboard-caption" className="sr-only">
          Leaderboard preview. No fundraising has started, so there are no totals or rankings.
        </caption>
        <thead>
          <tr className="text-label text-navy-muted">
            <th scope="col" className="py-3 font-semibold">
              Campus
            </th>
            <th scope="col" className="py-3 text-right font-semibold">
              Raised
            </th>
            <th scope="col" className="hidden py-3 text-right font-semibold sm:table-cell">
              Per student
            </th>
          </tr>
        </thead>
        <tbody>
          {list.map((u) => (
            <tr key={u.slug} className="border-t border-navy-line/70">
              <th scope="row" className="py-3 text-[0.9375rem] font-medium text-ivory/90">
                {u.shortName}
              </th>
              <td className="text-event py-3 text-right text-2xl text-navy-muted/60" aria-label="No total yet">
                — — —
              </td>
              <td className="text-event hidden py-3 text-right text-2xl text-navy-muted/60 sm:table-cell" aria-label="No total yet">
                — —
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <figcaption className="mt-4 border-t border-navy-line pt-4 text-[0.875rem] text-navy-muted">
        Rankings appear when fundraising begins. Only totals verified by the beneficiary charity&apos;s platform will be shown.
      </figcaption>
    </figure>
  );
}

/** Five unlabeled day plates: an upcoming-event treatment with no countdown and no invented dates. */
export function FiveDays({ className, tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  return (
    <ol className={cx("grid grid-cols-5 gap-1.5 sm:gap-2", className)} aria-label="Five days, dates to be announced">
      {Array.from({ length: site.flagship.days }).map((_, i) => (
        <li
          key={i}
          className={cx(
            "flex flex-col items-center justify-center rounded-sm border py-3 sm:py-4",
            tone === "dark" ? "border-gold/40 bg-navy-deep/60" : "border-gold/60 bg-gold-tint",
          )}
        >
          <span className={cx("text-label", tone === "dark" ? "text-navy-muted" : "text-gold-ink")}>Day</span>
          <span className={cx("text-event text-3xl sm:text-4xl", tone === "dark" ? "text-gold" : "text-navy")}>{i + 1}</span>
          <span className={cx("text-[0.6875rem] font-semibold", tone === "dark" ? "text-navy-muted" : "text-ink-muted")}>TBA</span>
        </li>
      ))}
    </ol>
  );
}
