import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Eye, FileCheck2, Scale, Target } from "lucide-react";
import { FounderProfile } from "@/components/about/FounderProfile";
import { PageHero } from "@/components/layout/PageHero";
import { MotionLayer } from "@/components/motion/MotionLayer";
import { ButtonLink } from "@/components/ui/Button";
import { Photo, SectionHeading } from "@/components/ui/primitives";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "About Us",
  description: `${site.name} is an emerging, student-led initiative connecting Louisiana college students with ways to serve. Our mission, story, programs and values.`,
  alternates: { canonical: "/about" },
};

const values = [
  { name: "Service", body: "Giving our time and energy to improve the lives of others." },
  { name: "Accessibility", body: "Helping every student discover meaningful ways to contribute." },
  { name: "Collaboration", body: "Bringing campuses, nonprofits, and businesses together." },
  { name: "Community", body: "Building stronger relationships through shared service." },
  { name: "Accountability", body: "Being transparent about what we do and the impact we create." },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        title="Building a Culture of Giving Back."
        lead={site.tagline}
        photo="liveOakBayou"
      />

      {/* Story */}
      <section className="section-y" aria-labelledby="story-heading">
        <div className="container-line grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 id="story-heading" className="text-h2 text-navy" data-reveal>
              Our story
            </h2>
          </div>
          <div className="space-y-5 text-[1.1875rem] leading-relaxed text-ink lg:col-span-7 lg:col-start-6" data-reveal>
            <p className="text-lead font-medium text-navy">
              We started with a simple idea: college students want to make a difference, but finding the right opportunity isn&apos;t always
              easy.
            </p>
            <p>Our goal is to change that.</p>
            <p>
              By connecting Louisiana universities, local nonprofits, student organizations, and community partners, we&apos;re building a
              network that makes giving back easier and more meaningful.
            </p>
            <p>
              From discovering a volunteer opportunity near campus to participating in statewide charitable initiatives, we want every
              student to have a way to get involved.
            </p>
            <p>
              We&apos;re beginning in Baton Rouge with a vision of growing across Louisiana and building a lasting tradition of service.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & vision */}
      <section className="on-dark bg-navy text-ivory" aria-label="Mission and vision">
        <div className="container-line grid gap-px bg-navy-line md:grid-cols-2">
          {[
            { icon: Target, title: "Our Mission", body: site.mission },
            { icon: Eye, title: "Our Vision", body: site.vision },
          ].map((b) => (
            <div key={b.title} className="bg-navy py-16 md:px-10 md:py-24 md:first:pl-0" data-reveal>
              <b.icon aria-hidden className="size-8 text-gold" strokeWidth={1.75} />
              <h2 className="text-h3 mt-5 text-gold">{b.title}</h2>
              <p className="mt-4 font-display text-[clamp(1.35rem,1.1rem+0.9vw,1.9rem)] leading-snug font-medium tracking-[-0.015em] text-ivory [font-variation-settings:'wdth'_94]">
                {b.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Programs */}
      <section className="section-y" aria-labelledby="programs-heading">
        <div className="container-line">
          <SectionHeading id="programs-heading" title="Our three programs" lead="Three permanent areas of activity, all year, every year." />
          <div className="mt-14 grid gap-14">
            <article className="grid items-center gap-10 lg:grid-cols-12" data-reveal>
              <Photo name="foodBankSorting" sizes="(min-width: 1024px) 45vw, 100vw" className="aspect-[16/10] rounded-md lg:col-span-6" />
              <div className="lg:col-span-5 lg:col-start-8">
                <p className="text-[0.9375rem] font-semibold text-forest">Find Volunteering</p>
                <h3 className="text-h2 mt-2 text-navy">Find Your Way to Give Back.</h3>
                <p className="mt-4 text-ink-muted">
                  Discover meaningful volunteer opportunities in your community, explore causes that matter to you, and start making a
                  difference.
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <ButtonLink href="/volunteer" icon="arrow">
                    Find Volunteer Opportunities
                  </ButtonLink>
                  <ButtonLink href="/campuses" variant="secondary">
                    Explore Participating Campuses
                  </ButtonLink>
                </div>
              </div>
            </article>
            <article className="grid items-center gap-10 lg:grid-cols-12" data-reveal>
              <div className="lg:order-2 lg:col-span-6 lg:col-start-7">
                <Photo name="cleanupSmile" sizes="(min-width: 1024px) 45vw, 100vw" className="aspect-[16/10] rounded-md" />
              </div>
              <div className="lg:order-1 lg:col-span-5">
                <p className="text-[0.9375rem] font-semibold text-forest">Community Events</p>
                <h3 className="text-h2 mt-2 text-navy">Making a Difference, All Year Long.</h3>
                <p className="mt-4 text-ink-muted">
                  Community impact doesn&apos;t happen during just one week of the year. From local food drives to hands-on service
                  projects, we bring students together to support causes that strengthen Louisiana communities.
                </p>
                <ButtonLink href="/events" icon="arrow" className="mt-7">
                  Explore Upcoming Events
                </ButtonLink>
              </div>
            </article>
            <article className="on-dark grid gap-10 rounded-md bg-navy-deep p-8 text-ivory sm:p-12 lg:grid-cols-12" data-reveal>
              <div className="lg:col-span-7">
                <p className="text-label text-gold">Our flagship event</p>
                <h3 className="text-event mt-4 text-6xl text-gold sm:text-7xl">One State. One Week. One Cause.</h3>
              </div>
              <div className="lg:col-span-5">
                <p className="text-ivory/85">A statewide fundraising challenge bringing Louisiana universities together to support a cause bigger than any one campus.</p>
                <p className="mt-4 text-navy-muted">Status: {site.flagship.status}</p>
                <div className="mt-7 flex flex-col gap-3">
                  <ButtonLink href="/geaux-give-week" variant="dark" icon="arrow">
                    Learn About Geaux Give Week
                  </ButtonLink>
                  <ButtonLink href="/geaux-give-week#register" variant="darkSecondary">
                    Bring the Challenge to Your Campus
                  </ButtonLink>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="border-y border-hairline bg-sand section-y" aria-labelledby="values-heading">
        <div className="container-line">
          <SectionHeading id="values-heading" title="Our values" />
          <dl className="mt-12 grid border-t-2 border-navy sm:grid-cols-2 lg:grid-cols-5" data-reveal-group>
            {values.map((v) => (
              <div key={v.name} data-reveal-item className="border-b border-hairline py-7 lg:border-r lg:border-b-0 lg:px-6 lg:first:pl-0 lg:last:border-r-0">
                <dt className="text-h3 text-navy">{v.name}</dt>
                <dd className="mt-3 text-[0.9375rem] text-ink-muted">{v.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Founder & leadership */}
      <section className="section-y" aria-labelledby="team-heading">
        <div className="container-line grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading
              id="team-heading"
              title="Founder and future leadership"
              lead="Founded by an LSU student in Baton Rouge. As the initiative grows across Louisiana, we'll add campus representatives and a leadership team — and introduce them here."
            />
          </div>
          <div className="space-y-6 lg:col-span-7">
            <FounderProfile />
            <div className="rounded-md border border-hairline bg-paper p-6 sm:p-8">
              <p className="text-h3 text-navy">Future leadership</p>
              <p className="mt-2 text-ink-muted">
                We&apos;re looking for students who want to help lead — from campus representatives to statewide program roles.
              </p>
              <Link href="/partners#campus-leaders" className="link mt-5 inline-flex items-center gap-2 font-semibold">
                Become a campus representative <ArrowRight aria-hidden className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Transparency */}
      <section className="border-t border-hairline bg-sand section-y" aria-labelledby="transparency-heading">
        <div className="container-line grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading id="transparency-heading" title="Transparency and impact" lead="Accountability is one of our values, so here's exactly where things stand." />
          </div>
          <ul className="grid gap-5 sm:grid-cols-2 lg:col-span-7">
            <li className="rounded-md border border-hairline bg-paper p-6">
              <Scale aria-hidden className="size-6 text-forest" strokeWidth={1.75} />
              <p className="mt-4 font-semibold text-navy">Legal status</p>
              <p className="mt-2 text-[0.9375rem] text-ink-muted">{site.legalStatus}</p>
            </li>
            <li className="rounded-md border border-hairline bg-paper p-6">
              <FileCheck2 aria-hidden className="size-6 text-forest" strokeWidth={1.75} />
              <p className="mt-4 font-semibold text-navy">Impact reporting</p>
              <p className="mt-2 text-[0.9375rem] text-ink-muted">
                We haven&apos;t held events or raised funds yet, so there&apos;s no impact to report. When we do, we&apos;ll publish what
                happened — and how it was counted.
              </p>
            </li>
            <li className="rounded-md border border-hairline bg-paper p-6">
              <p className="font-semibold text-navy">No donations here</p>
              <p className="mt-2 text-[0.9375rem] text-ink-muted">
                This website doesn&apos;t collect money. Geaux Give Week donations will go directly to the approved charity through its own
                platform.
              </p>
            </li>
            <li className="rounded-md border border-hairline bg-paper p-6">
              <p className="font-semibold text-navy">Listings, not endorsements</p>
              <p className="mt-2 text-[0.9375rem] text-ink-muted">
                The organizations in our directory haven&apos;t partnered with us unless we say so. We list them so students can find them.
              </p>
            </li>
          </ul>
        </div>
      </section>

      {/* Contact */}
      <section className="section-y" aria-labelledby="contact-heading">
        <div className="container-line flex flex-col items-start justify-between gap-8 border-t-2 border-navy pt-12 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <h2 id="contact-heading" className="text-h2 text-navy">
              Contact
            </h2>
            <p className="text-lead mt-4 text-ink-muted">Questions, ideas, or want to help? We read every message.</p>
          </div>
          <ButtonLink href="/contact" size="lg" icon="arrow">
            Send us a message
          </ButtonLink>
        </div>
      </section>
      <MotionLayer />
    </>
  );
}
