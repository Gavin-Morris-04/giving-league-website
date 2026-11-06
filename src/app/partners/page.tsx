import type { Metadata } from "next";
import { ArrowRight, Building2, HandHeart, School } from "lucide-react";
import { CampusRepForm, PartnershipForm } from "@/components/forms/Forms";
import { PageHero } from "@/components/layout/PageHero";
import { MotionLayer } from "@/components/motion/MotionLayer";
import { ButtonLink } from "@/components/ui/Button";
import { Photo } from "@/components/ui/primitives";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Partners & Get Involved",
  description:
    "Nonprofits, student leaders and businesses: list a volunteer opportunity, bring the initiative to your campus, or explore a partnership.",
  alternates: { canonical: "/partners" },
};

const paths = [
  {
    id: "nonprofits",
    icon: HandHeart,
    title: "Nonprofit Organizations",
    body: "Reach more volunteers and connect with students who want to support your mission.",
    cta: "Submit a Volunteer Opportunity",
    href: "/volunteer/submit",
  },
  {
    id: "campus-leaders",
    icon: School,
    title: "Student Governments and Campus Leaders",
    body: "Help bring organized community service opportunities and statewide charitable initiatives to your university.",
    cta: "Become a Campus Representative",
    href: "#campus-leaders",
  },
  {
    id: "businesses",
    icon: Building2,
    title: "Businesses and Community Supporters",
    body: "Support volunteering initiatives, provide resources, and collaborate on programs that strengthen local communities.",
    cta: "Explore Partnerships",
    href: "#businesses",
  },
];

export default function PartnersPage() {
  return (
    <>
      <PageHero
        title="Let's Do More Good, Together."
        lead="Meaningful change takes a community. We're connecting students, universities, nonprofits, and local businesses to build more opportunities for service throughout Louisiana."
        photo="communityGarden"
      />

      <section className="section-y" aria-label="Ways to partner">
        <div className="container-line">
          <ul className="grid border-t-2 border-navy lg:grid-cols-3" data-reveal-group>
            {paths.map((p) => (
              <li key={p.id} data-reveal-item className="flex flex-col gap-4 border-b border-hairline py-10 lg:border-r lg:border-b-0 lg:px-10 lg:first:pl-0 lg:last:border-r-0">
                <p.icon aria-hidden className="size-8 text-forest" strokeWidth={1.75} />
                <h2 className="text-h3 text-navy">{p.title}</h2>
                <p className="text-ink-muted">{p.body}</p>
                <ButtonLink href={p.href} variant={p.id === "nonprofits" ? "primary" : "secondary"} icon="arrow" className="mt-auto self-start">
                  {p.cta}
                </ButtonLink>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Nonprofits */}
      <section id="nonprofits" className="scroll-mt-20 border-y border-hairline bg-sand section-y" aria-labelledby="np-heading">
        <div className="container-line grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6" data-reveal>
            <Photo name="shelterDog" sizes="(min-width: 1024px) 48vw, 100vw" className="aspect-[16/11] rounded-md" />
          </div>
          <div className="lg:col-span-6" data-reveal>
            <h2 id="np-heading" className="text-h2 text-navy">
              For nonprofit organizations
            </h2>
            <ul className="mt-6 space-y-4 text-ink-muted">
              <li>
                <strong className="text-ink">Free to list.</strong> Ongoing needs and dated events, from food sorting to mentoring.
              </li>
              <li>
                <strong className="text-ink">Your system stays yours.</strong> We link students straight to your own registration page; we
                never take sign-ups on your behalf.
              </li>
              <li>
                <strong className="text-ink">Accurate by design.</strong> We verify every listing against your website and re-check links
                regularly.
              </li>
            </ul>
            <ButtonLink href="/volunteer/submit" size="lg" icon="arrow" className="mt-9">
              Submit a Volunteer Opportunity
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* Campus leaders */}
      <section id="campus-leaders" className="scroll-mt-20 section-y" aria-labelledby="cl-heading">
        <div className="container-line grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5" data-reveal>
            <h2 id="cl-heading" className="text-h2 text-navy">
              For student governments and campus leaders
            </h2>
            <p className="text-lead mt-5 text-ink-muted">
              Campus representatives help organize events, connect student organizations, and bring Geaux Give Week to their university.
            </p>
            <ul className="mt-8 space-y-3 text-ink-muted">
              {[
                "Shape the first events on your campus",
                "Connect your SGA, Greek council or service organization",
                "Lead your university's Geaux Give Week effort",
                "Build a statewide network with leaders at other schools",
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <ArrowRight aria-hidden className="mt-1 size-4 shrink-0 text-forest" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-md border border-hairline bg-paper p-6 sm:p-10 lg:col-span-7">
            <h3 className="text-h3 text-navy">Become a Campus Representative</h3>
            <p className="mt-2 mb-8 text-[0.9375rem] text-ink-muted">We review every inquiry and reply by email.</p>
            <CampusRepForm />
          </div>
        </div>
      </section>

      {/* Businesses */}
      <section id="businesses" className="on-dark scroll-mt-20 bg-navy text-ivory section-y" aria-labelledby="biz-heading">
        <div className="container-line grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5" data-reveal>
            <h2 id="biz-heading" className="text-h2 text-ivory">
              For businesses and community supporters
            </h2>
            <p className="text-lead mt-5 text-navy-muted">
              Support volunteering initiatives, provide resources, and collaborate on programs that strengthen local communities.
            </p>
            <ul className="mt-8 space-y-3 text-navy-muted">
              {[
                "Sponsor a community event or supply drive",
                "Donate materials or services for service days",
                "Support an approved Geaux Give Week matching initiative",
                "Organize employee volunteering with listed nonprofits",
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <ArrowRight aria-hidden className="mt-1 size-4 shrink-0 text-gold" />
                  {t}
                </li>
              ))}
            </ul>
            <p className="mt-8 rounded-md border border-navy-line p-4 text-[0.875rem] text-navy-muted">
              {site.name} is not a 501(c)(3) tax-exempt organization. Sponsorships and contributions to us are not tax-deductible, and we
              don&apos;t accept donations on this website.
            </p>
          </div>
          <div className="on-light rounded-md bg-ivory p-6 text-ink sm:p-10 lg:col-span-7">
            <h3 className="text-h3 text-navy">Partnership inquiry</h3>
            <p className="mt-2 mb-8 text-[0.9375rem] text-ink-muted">Tell us a little about your organization. We&apos;ll follow up by email.</p>
            <PartnershipForm />
          </div>
        </div>
      </section>
      <MotionLayer />
    </>
  );
}
