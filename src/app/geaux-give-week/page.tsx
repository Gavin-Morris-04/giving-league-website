import type { Metadata } from "next";
import { Building2, ChevronDown, Handshake, Megaphone, School, ShieldCheck, Users } from "lucide-react";
import { CampusRepForm, PartnershipForm } from "@/components/forms/Forms";
import { FiveDays } from "@/components/ggw/Scoreboard";
import { Leaderboard } from "@/components/ggw/Leaderboard";
import { MotionLayer } from "@/components/motion/MotionLayer";
import { ButtonLink } from "@/components/ui/Button";
import { Photo, SectionHeading } from "@/components/ui/primitives";
import { site } from "@/config/site";
import { campaign2027, ggwFaqs } from "@/data/programs/geaux-give-week";

export const metadata: Metadata = {
  title: "Geaux Give Week",
  description:
    "A statewide fundraising challenge bringing Louisiana universities together to support one cause. In development for Spring 2027 — register your campus's interest.",
  alternates: { canonical: "/geaux-give-week" },
};

const steps = [
  { title: "Represent Your University", body: "Students and organizations join their school's fundraising effort." },
  { title: "Raise Funds for a Great Cause", body: "Participating campuses support an approved charity during the competition." },
  { title: "Make an Impact Together", body: "Universities are recognized for the charitable impact they create." },
];

export default function GeauxGiveWeekPage() {
  return (
    <>
      {/* Hero */}
      <section className="on-dark relative isolate -mt-(--header-h) overflow-hidden bg-navy-deep text-ivory">
        <div aria-hidden className="absolute inset-0 -z-10 opacity-[0.07] [background-image:repeating-linear-gradient(90deg,var(--color-gold)_0_2px,transparent_2px_120px)]" />
        <div aria-hidden className="absolute -right-32 -bottom-48 -z-10 size-[44rem] rounded-full border-[3px] border-gold/20" data-rellax data-rellax-speed="1" />
        <div aria-hidden className="absolute -right-8 -bottom-24 -z-10 size-[28rem] rounded-full border-2 border-gold/15" />
        <div className="container-line pt-[calc(var(--header-h)+4.5rem)] pb-20 md:pt-[calc(var(--header-h)+6.5rem)] md:pb-28">
          <p className="text-label max-w-xl text-gold">The annual statewide college fundraising challenge</p>
          <h1 className="text-event mt-6 text-[clamp(3.75rem,2rem+9vw,10rem)] text-ivory">
            One State.
            <br />
            One Week.
            <br />
            <span className="text-gold">One Cause.</span>
          </h1>
          <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-6">
              <p className="text-lead text-ivory/85">Louisiana universities. Five days. One incredible opportunity to give back.</p>
              <p className="text-event mt-6 inline-flex items-center gap-3 rounded-sm border border-gold/50 bg-navy/60 px-3 py-2 text-xl tracking-[0.04em] text-gold">
                <span aria-hidden className="size-2.5 rounded-full bg-gold" />
                {site.flagship.statusLong}
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="#register" variant="dark" size="lg" icon="arrow">
                  Bring the Challenge to Your Campus
                </ButtonLink>
                <ButtonLink href="#businesses" variant="darkSecondary" size="lg">
                  Partner with the challenge
                </ButtonLink>
              </div>
            </div>
            <div className="lg:col-span-5 lg:col-start-8">
              <FiveDays />
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section-y" aria-labelledby="how-heading">
        <div className="container-line">
          <SectionHeading
            id="how-heading"
            title="How it works"
            lead="For one week each year, students, campus organizations, and communities across Louisiana will come together in a friendly competition to make a lasting difference."
          />
          <ol className="relative mt-16 grid gap-12 md:grid-cols-3 md:gap-8" data-reveal-group>
            <span aria-hidden className="absolute top-7 right-[16%] left-[16%] hidden h-[3px] bg-gold md:block" />
            {steps.map((s, i) => (
              <li key={s.title} className="relative" data-reveal-item>
                <span className="text-event relative z-10 grid size-14 place-items-center rounded-full border-[3px] border-gold bg-ivory text-3xl text-navy md:mx-auto">
                  {i + 1}
                </span>
                <h3 className="text-h3 mt-6 text-navy md:text-center">{s.title}</h3>
                <p className="mt-3 text-ink-muted md:mx-auto md:max-w-xs md:text-center">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Leaderboard */}
      <section className="on-dark bg-navy text-ivory section-y" aria-labelledby="board-heading">
        <div className="container-line grid gap-12 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-4" data-reveal>
            <SectionHeading
              tone="dark"
              id="board-heading"
              title="A leaderboard built to be fair."
              lead="Big schools and small schools compete on equal footing: we'll rank total funds raised and funds raised per enrolled student."
            />
            <ul className="mt-8 space-y-4 text-[0.9375rem] text-navy-muted">
              <li className="flex gap-3">
                <ShieldCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-gold" />
                Only totals verified by the beneficiary&apos;s official platform.
              </li>
              <li className="flex gap-3">
                <Users aria-hidden className="mt-0.5 size-5 shrink-0 text-gold" />
                Student organizations recognized alongside their universities.
              </li>
            </ul>
          </div>
          <div className="min-w-0 lg:col-span-8" data-reveal>
            <Leaderboard campaign={campaign2027} />
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="section-y" aria-labelledby="why-heading">
        <div className="container-line grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6" data-reveal>
            <div className="relative aspect-[5/4] overflow-hidden rounded-md">
              <div className="absolute inset-x-0 -top-[10%] -bottom-[10%]" data-rellax data-rellax-speed="-1" data-rellax-percentage="0.5">
                <Photo name="newOrleansStreetcar" sizes="(min-width: 1024px) 48vw, 100vw" className="h-full w-full" />
              </div>
            </div>
          </div>
          <div className="lg:col-span-6" data-reveal>
            <h2 id="why-heading" className="text-h2 text-navy">
              Why we created the challenge
            </h2>
            <div className="mt-6 space-y-4 text-[1.0625rem] text-ink-muted">
              <p>
                Louisiana students already know how to rally behind their school. Geaux Give Week points that pride at something bigger
                than any one campus: a single cause, chosen together, supported by every participating university at once.
              </p>
              <p>
                It&apos;s a friendly rivalry with a shared finish line. Every campus that takes part moves the statewide total, and every
                dollar goes directly to an established charity — never through us.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Universities & businesses */}
      <section className="border-y border-hairline bg-sand section-y" aria-labelledby="participate-heading">
        <div className="container-line grid gap-14 lg:grid-cols-2">
          <div data-reveal>
            <School aria-hidden className="size-8 text-forest" strokeWidth={1.75} />
            <h2 id="participate-heading" className="text-h2 mt-5 text-navy">
              How universities can participate
            </h2>
            <ul className="mt-7 space-y-5">
              {[
                ["A campus lead", "A student government, Greek council or service organization agrees to coordinate on campus."],
                ["University approval", "We work with campus leaders to follow each school's policies for student fundraising."],
                ["Teams on every campus", "Chapters, clubs and friend groups form teams that raise funds for their university."],
                ["Celebrate together", "Awards recognize total impact, per-student impact and top student organizations."],
              ].map(([t, b]) => (
                <li key={t} className="border-l-2 border-forest pl-5">
                  <p className="font-semibold text-navy">{t}</p>
                  <p className="mt-1 text-ink-muted">{b}</p>
                </li>
              ))}
            </ul>
          </div>
          <div id="businesses" className="scroll-mt-28" data-reveal>
            <Building2 aria-hidden className="size-8 text-forest" strokeWidth={1.75} />
            <h2 className="text-h2 mt-5 text-navy">How businesses can support the event</h2>
            <ul className="mt-7 space-y-5">
              {[
                ["Sponsor the week", "Help cover event costs such as kickoff events, materials and awards."],
                ["Approved matching", "Offer a matching gift made directly to the beneficiary charity, under terms agreed in writing."],
                ["Rally your team", "Encourage employees and alumni to support their alma mater's campaign."],
                ["Spread the word", "Share the challenge with your customers and community."],
              ].map(([t, b]) => (
                <li key={t} className="border-l-2 border-gold pl-5">
                  <p className="font-semibold text-navy">{t}</p>
                  <p className="mt-1 text-ink-muted">{b}</p>
                </li>
              ))}
            </ul>
            <p className="mt-7 rounded-md border border-hairline bg-paper p-4 text-[0.875rem] text-ink-muted">
              {site.name} is not a 501(c)(3). Sponsorships of our events are not tax-deductible donations. Any tax treatment of a gift made
              directly to the beneficiary charity depends on that charity&apos;s status — consult a tax advisor.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-y" aria-labelledby="faq-heading">
        <div className="container-line grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeading id="faq-heading" title="Frequently asked questions" />
          </div>
          <div className="divide-y divide-hairline border-y border-hairline lg:col-span-8">
            {ggwFaqs.map((f) => (
              <details key={f.q} className="group">
                <summary className="flex min-h-16 list-none items-center justify-between gap-6 py-5 text-[1.0625rem] font-semibold text-navy [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <ChevronDown aria-hidden className="size-5 shrink-0 text-forest transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <p className="pb-6 measure text-ink-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Forms */}
      <section id="register" className="on-dark scroll-mt-20 bg-navy-deep text-ivory section-y" aria-labelledby="register-heading">
        <div className="container-line grid gap-10 lg:grid-cols-2">
          <div className="on-light rounded-md bg-ivory p-6 text-ink sm:p-10">
            <Megaphone aria-hidden className="size-7 text-forest" strokeWidth={1.75} />
            <h2 id="register-heading" className="text-h2 mt-4 text-navy">
              Interested university registration
            </h2>
            <p className="mt-3 mb-8 text-ink-muted">
              Student leaders: tell us your campus wants in. This registers interest only — it doesn&apos;t commit your university.
            </p>
            <CampusRepForm defaultInterest="geaux_give_week" submitLabel="Register campus interest" />
          </div>
          <div className="on-light rounded-md bg-ivory p-6 text-ink sm:p-10">
            <Handshake aria-hidden className="size-7 text-forest" strokeWidth={1.75} />
            <h2 className="text-h2 mt-4 text-navy">Corporate partnership inquiry</h2>
            <p className="mt-3 mb-8 text-ink-muted">Businesses and community supporters: let&apos;s talk about what support could look like.</p>
            <PartnershipForm defaultInterest="geaux_give_week" />
          </div>
        </div>
      </section>
      <MotionLayer />
    </>
  );
}
