import Link from "next/link";
import { Camera } from "lucide-react";
import { footerNav } from "@/config/navigation";
import { site } from "@/config/site";
import { UpdatesSignup } from "@/components/forms/Forms";
import { Wordmark } from "@/components/ui/primitives";

export function SiteFooter() {
  return (
    <footer className="on-dark bg-navy text-ivory" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Site footer
      </h2>
      <div className="container-line grid gap-14 py-16 lg:grid-cols-12 lg:gap-10 lg:py-24">
        <div className="lg:col-span-5">
          <Wordmark tone="dark" />
          <p className="mt-6 max-w-md text-[0.975rem] leading-relaxed text-navy-muted">{site.mission}</p>
          <div className="mt-10 max-w-md">
            <p className="text-h3 text-ivory">Get announcements</p>
            <p className="mt-1.5 mb-5 text-[0.9375rem] text-navy-muted">
              New listings, first events and Geaux Give Week news. No spam, unsubscribe any time.
            </p>
            <UpdatesSignup tone="dark" campusField={false} />
          </div>
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4 lg:col-span-7 lg:pl-8">
          {footerNav.map((col) => (
            <div key={col.heading}>
              <p className="text-label text-gold">{col.heading}</p>
              <ul className="mt-4 space-y-1">
                {col.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="inline-flex min-h-10 items-center text-[0.9375rem] text-ivory/85 underline-offset-4 transition-colors hover:text-ivory hover:underline"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="col-span-2 sm:col-span-4">
            <p className="text-label text-gold">Follow</p>
            <a
              href={site.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex min-h-11 items-center gap-2 text-[0.9375rem] text-ivory/85 hover:text-ivory hover:underline"
            >
              <Camera aria-hidden className="size-5" />
              Instagram {site.social.instagramHandle}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </nav>
      </div>

      <div className="border-t border-navy-line">
        <div className="container-line flex flex-col gap-4 py-8 text-[0.8125rem] leading-relaxed text-navy-muted lg:flex-row lg:items-start lg:justify-between lg:gap-12">
          <p className="max-w-3xl">
            <span className="text-ivory">{site.name}</span> — {site.legalStatus}
          </p>
          <p className="shrink-0">
            Photographs via Unsplash ·{" "}
            <Link href="/credits" className="underline underline-offset-2 hover:text-ivory">
              Credits
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
