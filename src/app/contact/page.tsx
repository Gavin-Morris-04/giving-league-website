import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ContactForm } from "@/components/forms/Forms";
import { PageHero } from "@/components/layout/PageHero";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${site.name} — general questions, partnerships, listings and website feedback.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        title="Get in touch."
        lead="Questions, partnership ideas, a listing to share, or feedback on the website — choose a subject and send us a message. We reply by email."
      />
      <section className="section-y">
        <div className="container-line grid gap-14 lg:grid-cols-12">
          <aside className="space-y-8 lg:col-span-4">
            {site.contact.email ? (
              <div>
                <p className="text-h3 text-navy">Email us</p>
                <a className="link mt-2 inline-block text-lg font-semibold break-all" href={`mailto:${site.contact.email}`}>
                  {site.contact.email}
                </a>
                <p className="mt-2 text-[0.9375rem] text-ink-muted">
                  Online form submissions aren&apos;t switched on yet, so email is the surest way to reach the team right now.
                </p>
              </div>
            ) : null}
            <div>
              <p className="text-h3 text-navy">Looking for something specific?</p>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link href="/volunteer" className="link">
                    Find a volunteer opportunity
                  </Link>
                </li>
                <li>
                  <Link href="/volunteer/submit" className="link">
                    Submit a volunteer opportunity
                  </Link>
                </li>
                <li>
                  <Link href="/events/submit" className="link">
                    Submit a charity event
                  </Link>
                </li>
                <li>
                  <Link href="/high-schools#school-involvement" className="link">
                    Get a high school involved
                  </Link>
                </li>
                <li>
                  <Link href="/campuses#bring-to-campus" className="link">
                    Bring us to a college campus
                  </Link>
                </li>
              </ul>
            </div>
            <div className="rounded-md border border-hairline bg-paper p-5 text-[0.9375rem] text-ink-muted">
              <p>
                <strong className="text-ink">Partnerships:</strong> businesses, nonprofits and schools interested in working with us can choose
                &ldquo;Partnership&rdquo; as the subject or email us with &ldquo;Partnership&rdquo; in the subject line.
              </p>
              {site.contact.email ? null : (
                <p className="mt-3">We don&apos;t have a public email inbox yet, so this form is the best way to reach the team.</p>
              )}
              <p className="mt-3">Students under 18: please don&apos;t share personal details beyond your name and email.</p>
            </div>
          </aside>
          <div className="lg:col-span-8">
            <Suspense fallback={<div className="h-[36rem] animate-pulse rounded-md bg-sand" aria-busy="true" />}>
              <ContactForm />
            </Suspense>
          </div>
        </div>
      </section>
    </>
  );
}
