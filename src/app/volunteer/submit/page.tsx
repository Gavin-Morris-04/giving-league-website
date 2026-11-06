import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { OpportunityForm } from "@/components/forms/Forms";
import { PageHero } from "@/components/layout/PageHero";

export const metadata: Metadata = {
  title: "Submit a Volunteer Opportunity",
  description: "Louisiana nonprofits: list an ongoing volunteer need or a dated event. We verify every listing before it appears in the directory.",
  alternates: { canonical: "/volunteer/submit" },
};

const steps = [
  { title: "You submit", body: "Tell us what volunteers will do and link your official sign-up page." },
  { title: "We verify", body: "We check the details against your website and may email you with questions." },
  { title: "Students find you", body: "Your listing appears in the finder with a link straight to your registration." },
];

export default function SubmitOpportunityPage() {
  return (
    <>
      <PageHero
        title="Have a Volunteer Opportunity? Submit It Here."
        lead="Reach more volunteers and connect with students who want to support your mission. There's no cost, and students always register through your own system."
      />
      <section className="section-y">
        <div className="container-line grid gap-14 lg:grid-cols-12">
          <aside className="lg:col-span-4" aria-labelledby="review-heading">
            <h2 id="review-heading" className="text-h3 text-navy">
              What happens next
            </h2>
            <ol className="relative mt-6 space-y-8 border-l-2 border-forest pl-6">
              {steps.map((s) => (
                <li key={s.title} className="relative">
                  <span aria-hidden className="absolute top-1.5 -left-[1.9375rem] size-3.5 rounded-full border-2 border-forest bg-ivory" />
                  <p className="font-semibold text-navy">{s.title}</p>
                  <p className="mt-1 text-[0.9375rem] text-ink-muted">{s.body}</p>
                </li>
              ))}
            </ol>
            <div className="mt-10 rounded-md border border-hairline bg-paper p-5 text-[0.9375rem]">
              <p className="font-semibold text-navy">We list opportunities that</p>
              <ul className="mt-3 space-y-2 text-ink-muted">
                {[
                  "are run by an established organization",
                  "take place in Louisiana (or are open remotely to Louisiana students)",
                  "have a public, official sign-up page",
                  "are free for volunteers to join",
                ].map((t) => (
                  <li key={t} className="flex gap-2">
                    <CheckCircle2 aria-hidden className="mt-0.5 size-4 shrink-0 text-forest" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
          <div className="lg:col-span-8">
            <h2 className="text-h2 text-navy">Opportunity details</h2>
            <p className="mt-3 mb-10 text-ink-muted">Takes about five minutes. Fields marked Required are needed to review your listing.</p>
            <OpportunityForm />
          </div>
        </div>
      </section>
    </>
  );
}
