import type { Metadata } from "next";
import { Suspense } from "react";
import { BadgeCheck, CalendarClock, ExternalLink } from "lucide-react";
import { FinderSkeleton, OpportunityFinder } from "@/components/directory/OpportunityFinder";
import { PageHero } from "@/components/layout/PageHero";
import { ButtonLink } from "@/components/ui/Button";
import { site } from "@/config/site";
import { opportunities } from "@/lib/directory";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Find Volunteering",
  description:
    "Search verified volunteer opportunities near Louisiana universities — food banks, animal shelters, home builds, cleanups and more — and sign up directly with each organization.",
  alternates: { canonical: "/volunteer" },
};

export default function VolunteerPage() {
  return (
    <>
      <PageHero
        compact
        title="Find a Cause. Find Your Community."
        lead="Explore volunteer opportunities near your university and connect directly with organizations making a difference across Louisiana."
        photo="foodBankSorting"
        meta={
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[0.9375rem] text-ink max-sm:hidden">
            <li className="flex items-center gap-2">
              <BadgeCheck aria-hidden className="size-4 text-forest" />
              {opportunities.length} verified listings
            </li>
            <li className="flex items-center gap-2">
              <CalendarClock aria-hidden className="size-4 text-forest" />
              Checked {formatDate(site.directoryVerifiedOn)}
            </li>
            <li className="flex items-center gap-2">
              <ExternalLink aria-hidden className="size-4 text-forest" />
              Sign up on each organization&apos;s own site
            </li>
          </ul>
        }
      />

      <section aria-label="Volunteer opportunity search" className="pt-10 pb-24 md:pt-12">
        <div className="container-line">
          <Suspense fallback={<FinderSkeleton />}>
            <OpportunityFinder />
          </Suspense>
        </div>
      </section>

      <section className="border-t border-hairline bg-sand section-y" aria-labelledby="how-heading">
        <div className="container-line grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 id="how-heading" className="text-h2 text-navy">
              How this directory works
            </h2>
            <p className="text-lead mt-5 text-ink-muted">
              We point you to established organizations. They run the shifts, the waivers and the sign-ups — we just make them easier to
              find.
            </p>
          </div>
          <dl className="grid gap-8 sm:grid-cols-2 lg:col-span-7">
            <div>
              <dt className="text-h3 text-navy">Ongoing resources</dt>
              <dd className="mt-2 text-ink-muted">
                An organization that takes volunteers year-round. Pick a time on their own calendar or application. We never list
                specific open shifts — those change daily.
              </dd>
            </div>
            <div>
              <dt className="text-h3 text-navy">Dated events</dt>
              <dd className="mt-2 text-ink-muted">
                A specific event an organization has publicly announced, with its dates. Gold badges show the date.
              </dd>
            </div>
            <div>
              <dt className="text-h3 text-navy">Verified by hand</dt>
              <dd className="mt-2 text-ink-muted">
                Every link, age limit and requirement was checked against the organization&apos;s official page on the date shown.
                Always confirm details when you register.
              </dd>
            </div>
            <div>
              <dt className="text-h3 text-navy">&ldquo;Near&rdquo; your campus</dt>
              <dd className="mt-2 text-ink-muted">
                Listings within about 55 miles of your university, plus statewide programs open to every Louisiana student.
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="section-y" aria-labelledby="submit-heading">
        <div className="container-line flex flex-col items-start justify-between gap-8 border-t-2 border-navy pt-12 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <h2 id="submit-heading" className="text-h2 text-navy">
              Have a Volunteer Opportunity? Submit It Here.
            </h2>
            <p className="text-lead mt-4 text-ink-muted">
              Louisiana nonprofits can list an ongoing need or a dated event. Students sign up on your own system — we just send them
              your way.
            </p>
          </div>
          <ButtonLink href="/volunteer/submit" size="lg" icon="arrow" className="shrink-0">
            Submit an opportunity
          </ButtonLink>
        </div>
      </section>
    </>
  );
}

