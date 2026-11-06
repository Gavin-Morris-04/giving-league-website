import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { CampusStatusBadge, campusStatusLabel } from "@/components/campuses/CampusStatusBadge";
import { LouisianaMap, stationSides, type Station } from "@/components/campuses/LouisianaMap";
import { CampusRepForm } from "@/components/forms/Forms";
import { PageHero } from "@/components/layout/PageHero";
import { MotionLayer } from "@/components/motion/MotionLayer";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/primitives";
import { cities, universities } from "@/data/reference/geography";
import { localOpportunitiesNearCampus } from "@/lib/directory";
import type { CampusStatus, CityKey } from "@/lib/types";

export const metadata: Metadata = {
  title: "College Campuses",
  description:
    "A directory of Louisiana colleges and universities, with verified volunteer opportunities near each campus and a way to bring the initiative to yours.",
  alternates: { canonical: "/campuses" },
};

const statuses: CampusStatus[] = ["participating", "launching", "not_yet"];

export default function CampusesPage() {
  const counts = Object.fromEntries(universities.map((u) => [u.slug, localOpportunitiesNearCampus(u.slug).length]));
  const byStatus = Object.fromEntries(statuses.map((s) => [s, universities.filter((u) => u.status === s).length])) as Record<CampusStatus, number>;

  const merged = (k: CityKey): CityKey => (k === "grambling" ? "ruston" : k);
  const top = Math.max(...Object.values(counts), 1);
  const stationMap = new Map<CityKey, Station>();
  for (const u of universities) {
    const key = merged(u.cityKey);
    const prev = stationMap.get(key);
    const weight = Math.max(prev?.weight ?? 0, counts[u.slug] / top);
    stationMap.set(key, { cityKey: key, label: key === "ruston" ? "Ruston · Grambling" : cities[key].name, weight, side: stationSides[key] });
  }

  return (
    <>
      <PageHero
        title="Different Campuses. One Shared Mission."
        lead="We're building connections among Louisiana universities to make community service more accessible, collaborative, and impactful."
        photo="batonRougeRiverfront"
        actions={
          <>
            <ButtonLink href="#bring-to-campus" size="lg" icon="arrow">
              Bring This to Your Campus
            </ButtonLink>
            <ButtonLink href="/volunteer" variant="secondary" size="lg">
              Find opportunities near campus
            </ButtonLink>
          </>
        }
      />

      <section className="section-y" aria-labelledby="directory-heading">
        <div className="container-line">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5" data-reveal>
              <SectionHeading
                id="directory-heading"
                title="Louisiana campus directory"
                lead="These universities are where college students can search for nearby opportunities today — and where we hope to build campus teams. Listing a school here does not mean it has joined or endorsed us."
              />
              <dl className="mt-10 grid grid-cols-3 gap-px overflow-hidden rounded-md border border-hairline bg-hairline">
                {statuses.map((s) => (
                  <div key={s} className="bg-paper p-4">
                    <dt className="text-[0.8125rem] leading-snug text-ink-muted">{campusStatusLabel[s]}</dt>
                    <dd className="mt-2 font-display text-3xl font-semibold text-navy tabular">{byStatus[s]}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 text-[0.875rem] text-ink-muted">
                No campus has formally joined yet. Statuses change only after a written agreement with a recognized campus organization.
              </p>
            </div>
            <div className="lg:col-span-7" data-reveal>
              <LouisianaMap stations={[...stationMap.values()]} title="Map of the Louisiana campus cities listed in this directory" />
            </div>
          </div>

          <ul className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-reveal-group>
            {universities.map((u) => (
              <li key={u.slug} data-reveal-item>
                <Link
                  href={`/campuses/${u.slug}`}
                  className="card-lift group flex h-full flex-col rounded-md border border-hairline bg-paper p-6"
                >
                  <CampusStatusBadge status={u.status} />
                  <h3 className="text-h3 mt-5 text-navy">{u.name}</h3>
                  <p className="mt-2 flex items-center gap-1.5 text-[0.9375rem] text-ink-muted">
                    <MapPin aria-hidden className="size-4" />
                    {u.city}
                  </p>
                  <div className="mt-auto flex items-end justify-between gap-4 pt-6">
                    <p className="text-[0.9375rem] text-ink">
                      <span className="font-semibold tabular">{counts[u.slug]}</span> local listing{counts[u.slug] === 1 ? "" : "s"} nearby
                    </p>
                    <span className="inline-flex items-center gap-1 text-[0.9375rem] font-semibold text-forest">
                      View campus
                      <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-[0.875rem] text-ink-muted">
            In high school?{" "}
            <Link href="/high-schools" className="link">
              Visit High Schools
            </Link>{" "}
            for opportunities and events in the same cities, filtered by age rules.
          </p>
          <p className="mt-2 text-[0.875rem] text-ink-muted">
            Don&apos;t see your school? Any Louisiana college can take part —{" "}
            <Link href="#bring-to-campus" className="link">
              tell us about yours
            </Link>
            .
          </p>
        </div>
      </section>

      <section id="bring-to-campus" className="on-dark bg-navy text-ivory section-y" aria-labelledby="bring-heading">
        <div className="container-line grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5" data-reveal>
            <SectionHeading
              tone="dark"
              id="bring-heading"
              title="Bring This to Your Campus"
              lead="Student governments, Greek councils, service organizations and individual student leaders can help start a campus team."
            />
            <ol className="mt-10 space-y-6">
              {[
                ["Tell us who you are", "Share your campus, your role and what you'd like to build."],
                ["Meet with our team", "We'll talk through goals, time commitment and what support we can offer."],
                ["Launch together", "Campuses move to “Launching Soon” once a campus organization agrees in writing."],
              ].map(([t, b], i) => (
                <li key={t} className="flex gap-4">
                  <span className="text-event grid size-10 shrink-0 place-items-center rounded-full border-2 border-gold text-xl text-gold">{i + 1}</span>
                  <div>
                    <p className="font-semibold text-ivory">{t}</p>
                    <p className="mt-1 text-[0.9375rem] text-navy-muted">{b}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="on-light rounded-md bg-ivory p-6 text-ink sm:p-10 lg:col-span-7">
            <h3 className="text-h3 text-navy">Campus representative interest</h3>
            <p className="mt-2 mb-8 text-[0.9375rem] text-ink-muted">We review every inquiry and reply by email.</p>
            <CampusRepForm mode="college" submitLabel="Send campus interest" />
          </div>
        </div>
      </section>
      <MotionLayer />
    </>
  );
}
