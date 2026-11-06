import type { Metadata } from "next";
import { Suspense } from "react";
import { CharityDirectory } from "@/components/donations/CharityDirectory";
import { CorporateGiving } from "@/components/donations/CorporateGiving";
import { ImpactCounter } from "@/components/donations/ImpactCounter";
import { PageHero } from "@/components/layout/PageHero";
import { MotionLayer } from "@/components/motion/MotionLayer";
import { ButtonLink } from "@/components/ui/Button";
import { Photo, SectionHeading } from "@/components/ui/primitives";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Donate",
  description:
    "Support trusted charities directly through their official donation pages, explore business and corporate giving programs, and learn how charitable tax benefits generally work.",
  alternates: { canonical: "/donations" },
};

export default function DonationsPage() {
  return (
    <>
      {/* 1 — Hero */}
      <PageHero
        eyebrow="Support a cause"
        title="A Little Generosity Goes a Long Way."
        lead="Explore organizations doing meaningful work and support the causes that matter most to you."
        photo="foodBankSorting"
        meta={
          <p className="max-w-2xl text-ink-muted">
            From children&apos;s health and medical research to community programs, your generosity can help make a difference. Discover trusted
            nonprofit organizations and give directly through their official fundraising platforms.
          </p>
        }
        actions={
          <>
            <ButtonLink href="#charities" size="lg" icon="arrow">
              Explore Charities
            </ButtonLink>
            <ButtonLink href="#corporate-giving" variant="secondary" size="lg">
              Corporate Giving
            </ButtonLink>
          </>
        }
      />

      {/* 2 — Giving impact (verified only) */}
      <section className="section-y" aria-labelledby="impact-heading">
        <div className="container-line">
          <Suspense fallback={<div className="h-72 animate-pulse rounded-md bg-navy" aria-busy="true" />}>
            <ImpactCounter />
          </Suspense>
        </div>
      </section>

      {/* 3 — Donate to a cause */}
      <section id="charities" className="scroll-mt-20 border-t border-hairline bg-sand section-y" aria-labelledby="charities-heading">
        <div className="container-line">
          <SectionHeading
            id="charities-heading"
            title="Donate to a Cause"
            lead="Every button opens the charity's own official donation page — we never process payments. These organizations are suggested resources, not official partners."
          />
          <div className="mt-10">
            <CharityDirectory />
          </div>
        </div>
      </section>

      {/* 4 — Business & corporate giving */}
      <section id="corporate-giving" className="scroll-mt-20 section-y" aria-labelledby="corporate-heading">
        <div className="container-line">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <h2 id="corporate-heading" className="text-h2 text-navy" data-reveal>
                Business &amp; Corporate Giving
              </h2>
              <p className="text-h3 mt-4 text-forest">Make a Difference Through Your Business.</p>
              <div className="mt-5 space-y-4 text-lead text-ink-muted measure">
                <p>
                  Businesses across Louisiana have the opportunity to support meaningful charitable causes through direct donations, employee giving
                  programs, and corporate fundraising initiatives.
                </p>
                <p>Explore official giving programs from established nonprofit organizations and learn how your company can make a positive impact.</p>
              </div>
            </div>
            <div className="hidden lg:col-span-5 lg:block">
              <Photo name="newOrleansStreet" sizes="40vw" className="aspect-[4/3] rounded-md" />
            </div>
          </div>
          <p className="mt-8 text-[0.9375rem] text-ink-muted">
            These are each charity&apos;s own programs. {site.name} isn&apos;t partnered with St. Jude or Make-A-Wish, doesn&apos;t collect business
            donations, and can&apos;t confirm your eligibility for any program. Want to work with {site.name} directly? Use our{" "}
            <a href="/contact?topic=partnership" className="link">
              contact form
            </a>{" "}
            and choose &ldquo;Partnership.&rdquo;
          </p>
          <div className="mt-10" data-reveal-group>
            <CorporateGiving />
          </div>
        </div>
      </section>

      {/* 5 — Understanding tax benefits */}
      <section className="border-t border-hairline bg-sand section-y" aria-labelledby="tax-heading">
        <div className="container-line grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 id="tax-heading" className="text-h2 text-navy">
              Understanding Charitable Tax Benefits
            </h2>
          </div>
          <div className="space-y-5 text-[1.0625rem] lg:col-span-7">
            <p>
              Businesses that make eligible charitable contributions to qualified nonprofit organizations may be able to claim tax deductions, subject
              to applicable federal and state tax rules.
            </p>
            <p>
              The amount and availability of any deduction depend on the business&apos;s tax structure, the nature of the contribution, applicable
              limitations, and whether goods or services were received in return.
            </p>
            <ul className="grid gap-3 text-[0.9375rem] text-ink-muted">
              <li>
                <strong className="text-ink">Business structure matters.</strong> Corporations, LLCs, partnerships and sole proprietorships can be
                treated differently — for example, some pass-through businesses report charitable gifts on the owners&apos; returns rather than the
                business&apos;s.
              </li>
              <li>
                <strong className="text-ink">Donations aren&apos;t sponsorships.</strong> A direct charitable gift is different from a sponsorship or
                marketing arrangement where the business receives advertising or other benefits; those may be treated differently for tax purposes.
              </li>
              <li>
                <strong className="text-ink">Keep the charity&apos;s acknowledgment.</strong> Donation receipts and acknowledgment letters come from the
                receiving charity. Gifts of $250 or more generally require a written acknowledgment from the charity to substantiate a federal
                charitable deduction.
              </li>
            </ul>
            <p>
              Businesses should retain donation documentation provided by the receiving charity and consult a qualified tax professional for guidance.
            </p>
            <p className="rounded-md border border-hairline-strong bg-paper p-5 text-[0.9375rem] text-ink" role="note">
              {site.name} provides links to independent charitable organizations for informational purposes. We do not process these donations, issue
              charitable tax receipts, guarantee tax deductions, or provide tax advice. Giving through a link on our website does not create an
              additional tax benefit.
            </p>
          </div>
        </div>
      </section>

      {/* 6 — Final CTA */}
      <section className="on-dark bg-navy text-ivory" aria-labelledby="donate-final-heading">
        <div className="container-line py-24 md:py-32">
          <div className="max-w-2xl" data-reveal>
            <h2 id="donate-final-heading" className="text-display-lg text-ivory">
              Every Contribution Makes a Difference.
            </h2>
            <p className="text-lead mt-6 text-ivory/85">
              Whether you&apos;re giving personally or supporting a cause through your business, explore meaningful ways to help organizations making
              a difference.
            </p>
            <ButtonLink href="#charities" variant="dark" size="lg" icon="arrow" className="mt-10">
              Explore Charities
            </ButtonLink>
          </div>
        </div>
      </section>
      <MotionLayer />
    </>
  );
}
