import Link from "next/link";
import { ArrowRight, Building2, HandHeart, School } from "lucide-react";
import { CampusPicker } from "@/components/home/CampusPicker";
import { MotionLayer } from "@/components/motion/MotionLayer";
import { ScrollStory } from "@/components/home/ScrollStory";
import { OpportunityCard } from "@/components/directory/OpportunityCard";
import { FiveDays, ScoreboardTeaser } from "@/components/ggw/Scoreboard";
import { ButtonLink } from "@/components/ui/Button";
import { Badge, Photo, SectionHeading } from "@/components/ui/primitives";
import { site } from "@/config/site";
import { universities } from "@/data/reference/geography";
import { getOpportunity, localOpportunitiesNearCampus, opportunities, orgName } from "@/lib/directory";

const FEATURED = ["greater-baton-rouge-food-bank-volunteer-shifts", "louisiana-spca-volunteer", "love-the-boot-week-2027"];

export default function HomePage() {
  const statewide = opportunities.filter((o) => o.cityKey === "statewide").length;
  const counts = Object.fromEntries(
    universities.map((u) => [u.slug, { local: localOpportunitiesNearCampus(u.slug).length, statewide }]),
  );
  const featured = FEATURED.map((s) => getOpportunity(s)).filter((o) => o !== undefined);
  const cityCount = new Set(opportunities.filter((o) => o.cityKey !== "statewide").map((o) => o.cityKey)).size;

  return (
    <>
      {/* ── 1–2. Hero ──────────────────────────────────────────────── */}
      <section className="on-dark relative isolate -mt-(--header-h) flex min-h-[max(40rem,100svh)] flex-col overflow-hidden bg-navy text-ivory">
        <div className="absolute inset-x-0 -top-[12%] bottom-0 -z-10" data-rellax data-rellax-speed="-3">
          <Photo name="heroLakeshoreCleanup" sizes="100vw" preload className="h-full w-full" imgClassName="object-[70%_50%]" />
        </div>
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgb(18_42_58/0.94)_0%,rgb(18_42_58/0.82)_38%,rgb(18_42_58/0.35)_70%,rgb(18_42_58/0.15)_100%)] max-md:bg-[linear-gradient(180deg,rgb(18_42_58/0.55)_0%,rgb(18_42_58/0.85)_55%,rgb(18_42_58/0.97)_100%)]"
        />
        <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-navy/90 to-transparent" />

        <div className="container-line flex flex-1 flex-col justify-end pt-[calc(var(--header-h)+4rem)] pb-14 md:justify-center md:pb-24">
          <div className="max-w-[44rem]">
            <h1 className="text-display-xl text-ivory">Good Starts With You.</h1>
            <p className="text-lead mt-6 max-w-xl text-ivory/85">
              Connecting Louisiana college students with opportunities to volunteer, serve their communities, and come together for
              causes that matter.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/volunteer" variant="dark" size="lg" icon="arrow">
                Find Your Opportunity
              </ButtonLink>
              <ButtonLink href="/about" variant="darkSecondary" size="lg">
                Discover Our Mission
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3–4. Scroll story: introduction + three ways to get involved ── */}
      <ScrollStory
        labelledBy="story-heading"
        chapters={[
          {
            id: "intro",
            stop: "Discover",
            title: "More Than Volunteering. A Community That Gives Back.",
            body: (
              <p>
                Every student has the potential to make a difference. We&apos;re building a statewide network that makes it easier to
                discover opportunities, connect with local organizations, and turn the desire to help into meaningful action.
              </p>
            ),
            cta: { label: "Read our story", href: "/about" },
            photo: "foodBankSorting",
          },
          {
            id: "find",
            stop: "Volunteer",
            title: "Find Volunteering",
            body: <p>Discover local organizations and service opportunities near your campus.</p>,
            extra: (
              <p className="text-[0.9375rem] text-navy-muted">
                <span className="font-semibold text-ivory tabular">{opportunities.length}</span> verified listings across{" "}
                <span className="font-semibold text-ivory tabular">{cityCount}</span> Louisiana cities and statewide programs
              </p>
            ),
            cta: { label: "Explore Opportunities", href: "/volunteer" },
            photo: "cleanupGroup",
          },
          {
            id: "events",
            stop: "Serve",
            title: "Join Community Events",
            body: <p>Take part in food drives, cleanup projects, and hands-on initiatives throughout the year.</p>,
            extra: <Badge tone="onDark">First events being planned · Baton Rouge</Badge>,
            cta: { label: "See Upcoming Events", href: "/events" },
            photo: "communityGarden",
          },
          {
            id: "ggw",
            stop: "Give",
            title: "Geaux Give Week",
            titleClass: "text-event text-6xl text-gold sm:text-7xl",
            body: <p>Represent your university in Louisiana&apos;s statewide college fundraising challenge.</p>,
            extra: <Badge tone="onDark">{site.flagship.status}</Badge>,
            cta: { label: "Explore the Challenge", href: "/geaux-give-week" },
            visual: (
              <div className="absolute inset-0 flex flex-col justify-center gap-6 bg-navy-deep p-6 sm:p-10">
                <div aria-hidden className="absolute -right-24 -bottom-24 size-80 rounded-full border-[3px] border-gold/20" />
                <p className="text-event relative text-[clamp(2.25rem,1.4rem+4vw,4.75rem)] text-ivory">
                  One State.
                  <br />
                  One Week.
                  <br />
                  <span className="text-gold">One Cause.</span>
                </p>
                <FiveDays className="relative max-w-sm max-sm:hidden" />
              </div>
            ),
          },
        ]}
      />

      {/* ── 5. Find opportunities near you ────────────────────────── */}
      <section className="section-y" aria-labelledby="near-heading">
        <div className="container-line">
          <SectionHeading
            id="near-heading"
            title="Your Next Opportunity Is Closer Than You Think."
            lead="From Baton Rouge to New Orleans and beyond, find ways to make a difference near your university."
          />
          <div className="mt-14">
            <CampusPicker counts={counts} />
          </div>
        </div>
      </section>

      {/* ── 6. Featured opportunities ─────────────────────────────── */}
      <section className="section-y border-t border-hairline bg-sand" aria-labelledby="featured-heading">
        <div className="container-line">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading
              id="featured-heading"
              title="Verified places to start."
              lead="Real organizations, real sign-up pages. We check every link and requirement by hand — then send you straight to the organization to register."
            />
            <ButtonLink href="/volunteer" variant="secondary" icon="arrow" className="shrink-0">
              See all {opportunities.length} listings
            </ButtonLink>
          </div>
          <ul className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3" data-reveal-group>
            {featured.map((o) => (
              <li key={o.slug} data-reveal-item>
                <OpportunityCard o={o} org={orgName(o)} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── 7. Geaux Give Week feature ────────────────────────────── */}
      <section className="on-dark relative overflow-hidden bg-navy text-ivory section-y" aria-labelledby="ggw-heading">
        <div aria-hidden className="absolute top-1/2 -right-40 h-[38rem] w-[38rem] -translate-y-1/2 rounded-full border-[3px] border-gold/15" />
        <div aria-hidden className="absolute top-1/2 -right-20 h-[26rem] w-[26rem] -translate-y-1/2 rounded-full border-2 border-gold/10" />
        <div className="container-line relative grid items-center gap-14 lg:grid-cols-12">
          <div className="lg:col-span-6" data-reveal>
            <p className="text-label text-gold">Our flagship event</p>
            <p className="text-event mt-5 text-6xl text-gold sm:text-7xl">Geaux Give Week</p>
            <h2 id="ggw-heading" className="text-h2 mt-6 text-ivory">
              Every Campus Has a Chance to Make a Difference.
            </h2>
            <p className="text-lead mt-5 max-w-xl text-navy-muted">
              Geaux Give Week brings Louisiana universities together in one statewide fundraising competition. One week, one cause, and
              an opportunity to create extraordinary impact.
            </p>
            <div className="mt-8 max-w-md">
              <p className="text-label mb-3 text-ivory">{site.flagship.status} · dates to be announced</p>
              <FiveDays />
            </div>
            <ButtonLink href="/geaux-give-week" variant="dark" size="lg" icon="arrow" className="mt-10">
              Discover Geaux Give Week
            </ButtonLink>
          </div>
          <div className="lg:col-span-6 lg:pl-6" data-reveal>
            <ScoreboardTeaser rows={6} />
          </div>
        </div>
      </section>

      {/* ── 8. For universities and organizations ─────────────────── */}
      <section className="section-y" aria-labelledby="collab-heading">
        <div className="container-line">
          <SectionHeading
            id="collab-heading"
            title="Stronger Communities Start With Collaboration."
            lead="Whether you're a student government leader, Greek organization, local nonprofit, or business, there's a place for you in our mission."
          />
          <ul className="mt-14 grid border-t-2 border-navy md:grid-cols-3" data-reveal-group>
            {[
              {
                icon: School,
                title: "Bring Us to Your Campus",
                body: "Student governments, Greek councils and service orgs: help organize service and statewide initiatives at your school.",
                href: "/partners#campus-leaders",
                cta: "Become a campus representative",
              },
              {
                icon: HandHeart,
                title: "Submit a Volunteer Opportunity",
                body: "Nonprofits: list an ongoing need or a dated event. Students sign up directly on your own system.",
                href: "/volunteer/submit",
                cta: "Submit an opportunity",
              },
              {
                icon: Building2,
                title: "Become a Community Partner",
                body: "Businesses and supporters: sponsor an event, provide resources, or help shape Geaux Give Week.",
                href: "/partners#businesses",
                cta: "Explore partnerships",
              },
            ].map((p) => (
              <li key={p.title} data-reveal-item className="border-b border-hairline md:border-b-0 md:border-r md:last:border-r-0">
                <Link href={p.href} className="group flex h-full flex-col gap-4 py-8 transition-colors hover:bg-sand/60 md:px-8 md:first:pl-0 md:hover:bg-transparent">
                  <p.icon aria-hidden className="size-7 text-forest" strokeWidth={1.75} />
                  <h3 className="text-h3 text-navy">{p.title}</h3>
                  <p className="text-ink-muted">{p.body}</p>
                  <span className="mt-auto inline-flex items-center gap-2 pt-2 font-semibold text-forest">
                    <span className="underline decoration-1 underline-offset-4 group-hover:decoration-2">{p.cta}</span>
                    <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── 9. Final CTA ──────────────────────────────────────────── */}
      <section className="on-dark relative isolate overflow-hidden bg-forest-deep text-ivory" aria-labelledby="final-heading">
        <div className="absolute inset-x-0 -top-[25%] -bottom-[5%] -z-10" data-rellax data-rellax-speed="-1.5" data-rellax-percentage="0.5">
          <Photo name="cypressSwamp" sizes="100vw" className="h-full w-full" alt="" />
        </div>
        <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(100deg,rgb(27_68_57/0.95)_0%,rgb(27_68_57/0.82)_50%,rgb(18_42_58/0.55)_100%)]" />
        <div className="container-line py-28 md:py-40">
          <div className="max-w-2xl" data-reveal>
            <h2 id="final-heading" className="text-display-lg text-ivory">
              There&apos;s Always a Way to Make a Difference.
            </h2>
            <p className="text-lead mt-6 text-ivory/85">Find your opportunity, connect with your community, and be part of something bigger.</p>
            <ButtonLink href="/partners" variant="dark" size="lg" icon="arrow" className="mt-10">
              Get Involved
            </ButtonLink>
          </div>
        </div>
      </section>
      <MotionLayer />
    </>
  );
}
