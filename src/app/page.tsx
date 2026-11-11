import Link from "next/link";
import { ArrowRight, CalendarPlus, HandHeart, MapPin, MessageSquare, School } from "lucide-react";
import { CampusPicker } from "@/components/home/CampusPicker";
import { ScrollStory } from "@/components/home/ScrollStory";
import { MotionLayer } from "@/components/motion/MotionLayer";
import { ButtonLink } from "@/components/ui/Button";
import { Badge, Photo, SectionHeading } from "@/components/ui/primitives";
import { site } from "@/config/site";
import { universities } from "@/data/reference/geography";
import { serviceAreas } from "@/data/reference/locations";
import { charityEvents } from "@/data/verified/charity-events";
import { localOpportunitiesNearCampus, opportunities, opportunitiesNearCity } from "@/lib/directory";

export default function HomePage() {
  const statewide = opportunities.filter((o) => o.cityKey === "statewide").length;
  const counts = Object.fromEntries(universities.map((u) => [u.slug, { local: localOpportunitiesNearCampus(u.slug).length, statewide }]));
  // City areas (the same 10 used by College Campuses and High Schools) with at least one local listing nearby.
  const citiesServed = serviceAreas.filter((a) => opportunitiesNearCity(a.cityKey).some((o) => o.cityKey !== "statewide")).length;

  return (
    <>
      {/* 1. Hero */}
      <section className="on-dark relative isolate -mt-(--header-h) flex min-h-[max(40rem,100svh)] flex-col overflow-hidden bg-navy text-ivory">
        <div className="absolute inset-x-0 -top-[12%] bottom-0 -z-10" data-rellax data-rellax-speed="-3">
          <Photo name="heroLakeshoreCleanup" sizes="100vw" preload className="h-full w-full" imgClassName="object-[70%_50%]" />
        </div>
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgb(11_48_51/0.94)_0%,rgb(11_48_51/0.82)_38%,rgb(11_48_51/0.35)_70%,rgb(11_48_51/0.15)_100%)] max-md:bg-[linear-gradient(180deg,rgb(11_48_51/0.55)_0%,rgb(11_48_51/0.85)_55%,rgb(11_48_51/0.97)_100%)]"
        />
        <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-navy/90 to-transparent" />
        <div className="container-line flex flex-1 flex-col justify-end pt-[calc(var(--header-h)+4rem)] pb-14 md:justify-center md:pb-24">
          <div className="max-w-[46rem]">
            <h1 className="text-display-xl text-ivory">Good Starts With You.</h1>
            <p className="text-lead mt-6 max-w-xl text-ivory/85">
              Connecting Louisiana high school and college students with opportunities to volunteer, support charitable causes, and make a lasting
              difference in their communities.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/volunteer" variant="dark" size="lg" icon="arrow">
                Find Volunteer Opportunities
              </ButtonLink>
              <ButtonLink href="/events" variant="darkSecondary" size="lg">
                Explore Charity Events
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {/* 2. About our mission — scroll story */}
      <ScrollStory
        labelledBy="story-heading"
        chapters={[
          {
            id: "mission",
            stop: "Our mission",
            title: "More Than Volunteering. A Community That Gives Back.",
            body: <p>{site.description}</p>,
            cta: { label: "About us", href: "/about" },
            photo: "foodBankSorting",
          },
          {
            id: "volunteer",
            stop: "Volunteer",
            title: "Find Volunteering",
            body: <p>Discover local organizations and service opportunities near your school, with age rules from each organization.</p>,
            extra: (
              <p className="text-[0.9375rem] text-navy-muted">
                <span className="font-semibold text-ivory tabular">{opportunities.length}</span> verified listings serving{" "}
                <span className="font-semibold text-ivory tabular">{citiesServed}</span> Louisiana cities, plus statewide programs
              </p>
            ),
            cta: { label: "Explore Opportunities", href: "/volunteer" },
            photo: "cleanupGroup",
          },
          {
            id: "events",
            stop: "Join in",
            title: "Charity Events",
            body: <p>Charity walks, toy drives, cleanup days and fundraisers across Louisiana — annual events stay listed between dates.</p>,
            extra: <Badge tone="onDark">{charityEvents.length} verified events</Badge>,
            cta: { label: "Explore Charity Events", href: "/events" },
            photo: "communityGarden",
          },
          {
            id: "give",
            stop: "Give",
            title: "Support a Cause",
            body: <p>Give directly to trusted charities through their own official donation pages — individually or through your business.</p>,
            cta: { label: "Explore Charities", href: "/donations" },
            photo: "shelterDog",
          },
        ]}
      />

      {/* 3. Browse by school or city */}
      <section className="section-y" aria-labelledby="browse-heading">
        <div className="container-line">
          <SectionHeading
            id="browse-heading"
            title="Browse by School or City."
            lead="College students can start from their campus. High school students pick their area — your school doesn't need to be listed."
          />
          <div className="mt-14">
            <h3 className="text-h3 text-navy">College Campuses</h3>
            <div className="mt-6">
              <CampusPicker counts={counts} />
            </div>
          </div>
          <div className="mt-16 border-t border-hairline pt-12">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <h3 className="text-h3 text-navy">High Schools</h3>
              <Link href="/high-schools" className="link inline-flex items-center gap-1.5 font-semibold">
                All high school areas <ArrowRight aria-hidden className="size-4" />
              </Link>
            </div>
            <ul className="mt-6 flex flex-wrap gap-2">
              {serviceAreas.map((a) => (
                <li key={a.slug}>
                  <Link
                    href={`/high-schools/${a.slug}`}
                    className="inline-flex min-h-11 items-center gap-1.5 rounded-sm border border-hairline-strong bg-paper px-3.5 text-[0.9375rem] font-medium hover:border-ink"
                  >
                    <MapPin aria-hidden className="size-4 text-forest" />
                    {a.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 4. Geaux Give Week — coming soon (deliberately secondary) */}
      <section className="on-dark bg-navy-deep text-ivory" aria-labelledby="ggw-heading">
        <div className="container-line flex flex-col items-start justify-between gap-8 py-16 md:flex-row md:items-center md:py-20">
          <div className="max-w-2xl">
            <p className="text-event inline-flex items-center gap-2 text-lg tracking-[0.12em] text-gold">
              <span aria-hidden className="size-2 rounded-full bg-gold" />
              Coming Soon
            </p>
            <h2 id="ggw-heading" className="text-event mt-3 text-5xl text-ivory sm:text-6xl">
              Geaux Give Week
            </h2>
            <p className="mt-4 text-navy-muted">
              A future statewide fundraising competition exclusively for Louisiana colleges and universities. One state. One week. One cause.
            </p>
          </div>
          <ButtonLink href="/geaux-give-week" variant="darkSecondary" icon="arrow" className="shrink-0">
            Learn more
          </ButtonLink>
        </div>
      </section>

      {/* 5. Get involved */}
      <section className="section-y" aria-labelledby="involved-heading">
        <div className="container-line">
          <SectionHeading
            id="involved-heading"
            title="Get Involved."
            lead="Whether you're a student, a school, a nonprofit or a business, there's a place for you."
          />
          <ul className="mt-14 grid border-t-2 border-navy md:grid-cols-2 lg:grid-cols-4" data-reveal-group>
            {[
              {
                icon: HandHeart,
                title: "Submit a Volunteer Opportunity",
                body: "Nonprofits: list an ongoing need. Students sign up on your own system.",
                href: "/volunteer/submit",
                cta: "Submit an opportunity",
              },
              {
                icon: CalendarPlus,
                title: "Submit a Charity Event",
                body: "Hosting a walk, drive or fundraiser? Request a listing for review.",
                href: "/events/submit",
                cta: "Submit an event",
              },
              {
                icon: School,
                title: "Get Your School Involved",
                body: "Teachers, advisors and campus leaders: bring service to your school.",
                href: "/high-schools#school-involvement",
                cta: "Schools & campuses",
              },
              {
                icon: MessageSquare,
                title: "Contact Us",
                body: "Questions, partnerships or feedback — choose a subject and send a note.",
                href: "/contact",
                cta: "Contact us",
              },
            ].map((p) => (
              <li key={p.title} data-reveal-item className="border-b border-hairline md:border-r lg:border-b-0 lg:last:border-r-0">
                <Link href={p.href} className="group flex h-full flex-col gap-4 py-8 md:px-6 lg:first:pl-0">
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

      <MotionLayer />
    </>
  );
}
