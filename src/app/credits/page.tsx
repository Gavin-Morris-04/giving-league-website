import type { Metadata } from "next";
import Image from "next/image";
import { ExternalLink } from "@/components/ui/primitives";
import { photos } from "@/data/photos";

export const metadata: Metadata = { title: "Photo Credits", alternates: { canonical: "/credits" } };

export default function CreditsPage() {
  return (
    <section className="container-line py-14 md:py-20">
      <div className="max-w-3xl">
        <h1 className="text-display-lg text-navy">Photo credits</h1>
        <p className="text-lead mt-5 text-ink-muted">
          Photographs on this site are licensed from Unsplash under the{" "}
          <ExternalLink href="https://unsplash.com/license">Unsplash License</ExternalLink>. They are illustrative stock photographs and do not
          show our members, events or partners.
        </p>
      </div>
      <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(photos).map(([key, p]) => (
          <li key={key} className="overflow-hidden rounded-md border border-hairline bg-paper">
            <div className="relative aspect-[3/2] bg-sand">
              <Image src={p.src} alt={p.alt} fill sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw" className="object-cover" placeholder="blur" />
            </div>
            <div className="p-4 text-[0.9375rem]">
              <p>
                Photo by <ExternalLink href={p.profile}>{p.photographer}</ExternalLink>
              </p>
              <p className="mt-1">
                <ExternalLink href={p.source}>View on Unsplash</ExternalLink>
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
