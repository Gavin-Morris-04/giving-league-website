import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap, Sparkles, Trophy } from "lucide-react";
import { CampusRepForm } from "@/components/forms/Forms";
import { MotionLayer } from "@/components/motion/MotionLayer";

export const metadata: Metadata = {
  title: "Geaux Give Week — Coming Soon",
  description:
    "A future annual statewide fundraising competition exclusively for Louisiana colleges and universities. Details will be announced as plans and partnerships are finalized.",
  alternates: { canonical: "/geaux-give-week" },
};

export default function GeauxGiveWeekPage() {
  return (
    <>
      <section className="on-dark relative isolate -mt-(--header-h) overflow-hidden bg-navy-deep text-ivory">
        <div aria-hidden className="absolute inset-0 -z-10 opacity-[0.07] [background-image:repeating-linear-gradient(90deg,var(--color-gold)_0_2px,transparent_2px_120px)]" />
        <div aria-hidden className="absolute -right-32 -bottom-48 -z-10 size-[44rem] rounded-full border-[3px] border-gold/20" data-rellax data-rellax-speed="1" />
        <div className="container-line pt-[calc(var(--header-h)+4.5rem)] pb-20 md:pt-[calc(var(--header-h)+6.5rem)] md:pb-28">
          <p className="text-event inline-flex items-center gap-3 rounded-sm border border-gold/60 px-3 py-1.5 text-xl tracking-[0.12em] text-gold">
            <span aria-hidden className="size-2.5 rounded-full bg-gold" />
            Coming Soon
          </p>
          <h1 className="text-event mt-8 text-[clamp(3.75rem,2rem+9vw,10rem)] text-ivory">
            One State.
            <br />
            One Week.
            <br />
            <span className="text-gold">One Cause.</span>
          </h1>
          <div className="mt-10 grid gap-6 lg:max-w-3xl">
            <p className="text-lead text-ivory/90">
              Something big is coming to Louisiana. We&apos;re developing an annual statewide fundraising competition bringing colleges and
              universities together to support meaningful charitable causes.
            </p>
          </div>
        </div>
      </section>

      <section className="section-y" aria-labelledby="ggw-now-heading">
        <div className="container-line">
          <h2 id="ggw-now-heading" className="text-h2 text-navy" data-reveal>
            What we can share now
          </h2>
          <ul className="mt-12 grid gap-8 md:grid-cols-3" data-reveal-group>
            {[
              {
                icon: GraduationCap,
                title: "Colleges and universities only",
                body: (
                  <>
                    Geaux Give Week is for Louisiana college students and universities. High school students can{" "}
                    <Link href="/high-schools" className="link">
                      volunteer and join charity events
                    </Link>{" "}
                    all year.
                  </>
                ),
              },
              {
                icon: Trophy,
                title: "A friendly competition",
                body: "Campuses will compete to raise funds for one charitable cause, with donations going directly to the charity — never through us.",
              },
              {
                icon: Sparkles,
                title: "Details to come",
                body: "Dates, the beneficiary and competition rules will be announced only once they're confirmed.",
              },
            ].map((c) => (
              <li key={c.title} data-reveal-item className="border-t-2 border-navy pt-6">
                <c.icon aria-hidden className="size-7 text-forest" strokeWidth={1.75} />
                <h3 className="text-h3 mt-4 text-navy">{c.title}</h3>
                <p className="mt-2 text-ink-muted">{c.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="register" className="scroll-mt-20 border-t border-hairline bg-sand section-y" aria-labelledby="ggw-interest-heading">
        <div className="container-line grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 id="ggw-interest-heading" className="text-h3 text-navy">
              University representatives
            </h2>
            <p className="mt-3 text-ink-muted">
              Student government leaders, campus organizations and university staff can let us know they&apos;d like to hear more. This registers
              interest only — it doesn&apos;t commit your university.
            </p>
          </div>
          <div className="rounded-md border border-hairline bg-paper p-6 sm:p-8 lg:col-span-7">
            <CampusRepForm mode="college" defaultInterest="geaux_give_week" submitLabel="Register interest" />
          </div>
        </div>
      </section>
      <MotionLayer />
    </>
  );
}
