import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/forms/Forms";
import { PageHero } from "@/components/layout/PageHero";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${site.name}.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHero title="Get in touch." lead="Questions about volunteering, bringing the initiative to your campus, or partnering with us — send a message and we'll reply by email." />
      <section className="section-y">
        <div className="container-line grid gap-14 lg:grid-cols-12">
          <aside className="space-y-8 lg:col-span-4">
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
                    Submit an opportunity (nonprofits)
                  </Link>
                </li>
                <li>
                  <Link href="/partners#campus-leaders" className="link">
                    Become a campus representative
                  </Link>
                </li>
                <li>
                  <Link href="/partners#businesses" className="link">
                    Partnership inquiries
                  </Link>
                </li>
              </ul>
            </div>
            <div className="rounded-md border border-hairline bg-paper p-5 text-[0.9375rem] text-ink-muted">
              {site.contact.email ? (
                <p>
                  Prefer email? Write to{" "}
                  <a className="link" href={`mailto:${site.contact.email}`}>
                    {site.contact.email}
                  </a>
                  .
                </p>
              ) : (
                <p>We don&apos;t have a public email inbox yet. This form is the best way to reach the team.</p>
              )}
            </div>
          </aside>
          <div className="lg:col-span-8">
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
