import { HeartHandshake } from "lucide-react";
import { getCharity } from "@/data/verified/charities";
import { getVerifiedTotals } from "@/lib/fundraising/source";
import { formatUsd } from "@/lib/fundraising/totals";
import { formatDate } from "@/lib/format";

/**
 * "Our Community's Giving Impact". Shows a total ONLY when at least one campaign has a verified report from the
 * receiving charity's authorized system. Otherwise "Donation Tracking Coming Soon" — never a $0 lifetime total.
 */
export async function ImpactCounter() {
  const totals = await getVerifiedTotals();

  return (
    <div className="on-dark rounded-md border border-navy-line bg-navy p-6 text-ivory sm:p-10">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-xl">
          <h2 id="impact-heading" className="text-h2 text-ivory">
            Our Community&apos;s Giving Impact
          </h2>
          <p className="mt-4 text-navy-muted">See how our community is supporting charitable causes across Louisiana and beyond.</p>
        </div>

        {totals.hasVerifiedData ? (
          <div className="lg:text-right">
            <p className="text-label text-gold">Verified Donations Raised Through Our Campaigns</p>
            <p className="text-event mt-3 text-7xl text-gold tabular sm:text-8xl">{formatUsd(totals.totalCents)}</p>
            {totals.lastVerifiedAt ? <p className="mt-2 text-[0.875rem] text-navy-muted">Last verified {formatDate(totals.lastVerifiedAt.slice(0, 10))}</p> : null}
          </div>
        ) : (
          <div className="max-w-md rounded-md border border-gold/40 bg-navy-deep/50 p-6">
            <HeartHandshake aria-hidden className="size-7 text-gold" strokeWidth={1.75} />
            <p className="text-h3 mt-4 text-ivory">Donation Tracking Coming Soon</p>
            <p className="mt-2 text-[0.9375rem] text-navy-muted">
              We&apos;re working with charitable organizations to track and report the impact of donations made through our fundraising
              initiatives.
            </p>
          </div>
        )}
      </div>

      {totals.hasVerifiedData ? (
        <div className="mt-10 border-t border-navy-line pt-8">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {totals.byCharity.map((c) => (
              <li key={c.charityId} className="rounded-md border border-navy-line p-4">
                <p className="text-[0.9375rem] text-navy-muted">{getCharity(c.charityId)?.name ?? c.charityId}</p>
                <p className="text-event mt-1 text-3xl text-ivory tabular">{formatUsd(c.amountCents)}</p>
                <p className="mt-1 text-[0.8125rem] text-navy-muted">{c.campaigns.map((r) => r.campaign.campaignName).join(", ")}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="mt-8 border-t border-navy-line pt-6 text-[0.875rem] text-navy-muted">
        <strong className="text-ivory">How totals are verified:</strong> we count only money raised through dedicated fundraising campaigns that a
        charity has set up for us, using the totals reported by that charity&apos;s own authorized fundraising or reporting system. Each campaign
        counts once, at its latest verified total. Clicks on donation links, gifts made through general donation pages, and estimates are never
        counted.
      </p>
    </div>
  );
}
