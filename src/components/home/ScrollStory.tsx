"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { Photo } from "@/components/ui/primitives";
import type { PhotoKey } from "@/data/photos";
import { cx } from "@/lib/format";

export type Chapter = {
  id: string;
  stop: string;
  title: ReactNode;
  titleClass?: string;
  body: ReactNode;
  extra?: ReactNode;
  cta: { label: string; href: string };
  /** A photograph, or a custom visual (used for the flagship chapter). */
  photo?: PhotoKey;
  visual?: ReactNode;
};

/* Reduced-motion preference as an external store, so the server snapshot (static layout) hydrates cleanly. */
const motionQuery = "(prefers-reduced-motion: reduce)";
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(motionQuery);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const getMotionOk = () => !window.matchMedia(motionQuery).matches;
const getServerMotionOk = () => false;

/**
 * Scroll-driven story. The section is N screens tall; a sticky stage stays pinned while the visitor scrolls
 * through it. Scroll progress drives which chapter is shown and how far the gold route line has drawn.
 *
 * Progressive enhancement: on the server, without JavaScript, or with reduced motion, chapters render as a
 * normal stacked sequence. Every chapter's text and link stays in the DOM in reading order, and focusing a
 * link in a hidden chapter scrolls that chapter into view, so keyboard and screen-reader users reach all of it.
 */
export function ScrollStory({ chapters, labelledBy }: { chapters: Chapter[]; labelledBy: string }) {
  const motionOk = useSyncExternalStore(subscribe, getMotionOk, getServerMotionOk);
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const n = chapters.length;

  useEffect(() => {
    if (!motionOk) return;
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = section.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const p = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
      stage.style.setProperty("--p", p.toFixed(4));
      // iOS Safari: size the pinned stage to the real visible height, which changes as the toolbar collapses.
      const h = `${window.innerHeight}px`;
      if (stage.style.height !== h) stage.style.height = h;
      setActive(Math.min(n - 1, Math.floor(p * n * 0.9999)));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [motionOk, n]);

  /** Bring chapter i into the pinned stage (used when keyboard focus lands inside it). */
  const goTo = useCallback(
    (i: number) => {
      const section = sectionRef.current;
      if (!section || !motionOk) return;
      const total = section.offsetHeight - window.innerHeight;
      const top = section.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top + total * ((i + 0.5) / n), behavior: "instant" as ScrollBehavior });
    },
    [motionOk, n],
  );

  // ── Static fallback ───────────────────────────────────────────────
  if (!motionOk) {
    return (
      <section ref={sectionRef} aria-labelledby={labelledBy} className="on-dark bg-navy text-ivory">
        <div className="container-line grid gap-20 py-20 md:py-28">
          {chapters.map((c, i) => (
            <article key={c.id} className="grid items-center gap-8 lg:grid-cols-12 lg:gap-14">
              <div className="relative aspect-[16/10] overflow-hidden rounded-md lg:col-span-6">
                {c.visual ?? (c.photo ? <Photo name={c.photo} sizes="(min-width: 1024px) 45vw, 100vw" className="absolute! inset-0" /> : null)}
              </div>
              <div className="lg:col-span-6">
                <ChapterText c={c} index={i} n={n} headingId={i === 0 ? labelledBy : undefined} />
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  // ── Pinned, scroll-driven stage ──────────────────────────────────
  return (
    <section ref={sectionRef} aria-labelledby={labelledBy} className="on-dark relative bg-navy text-ivory" style={{ height: `${n * 100}svh` }}>
      <div
        ref={stageRef}
        className="sticky top-0 flex h-dvh flex-col overflow-hidden pt-(--header-h)"
        style={{ ["--p" as string]: 0 }}
      >
        <div className="container-line grid min-h-0 flex-1 grid-rows-[auto_1fr] gap-6 py-5 md:gap-10 md:py-8 lg:grid-cols-12 lg:grid-rows-1 lg:items-center lg:gap-14">
          {/* Visual stage: photos crossfade */}
          <div className="relative h-[30svh] overflow-hidden rounded-md bg-navy-deep sm:h-[36svh] lg:col-span-6 lg:h-[min(68svh,40rem)] [@media(max-height:700px)]:h-[24svh]">
            {chapters.map((c, i) => (
              <div
                key={c.id}
                aria-hidden={i !== active}
                className={cx(
                  "absolute inset-0 transition-[opacity,transform] ease-(--ease-out-expo)",
                  i === active ? "z-10 scale-100 opacity-100 duration-700" : cx("z-0 opacity-0 duration-500", i < active ? "scale-[1.04]" : "scale-[0.98]"),
                )}
              >
                {c.visual ?? (c.photo ? <Photo name={c.photo} sizes="(min-width: 1024px) 45vw, 100vw" className="absolute! inset-0" alt="" /> : null)}
              </div>
            ))}
            <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-navy-deep/70 to-transparent" />
            <p aria-hidden className="text-event absolute bottom-3 left-4 text-lg tracking-[0.06em] text-gold tabular sm:bottom-4 sm:left-5">
              {String(active + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
            </p>
          </div>

          {/* Chapter text: stacked in place, the active one shown */}
          <div className="relative min-h-0 lg:col-span-6">
            {chapters.map((c, i) => (
              <article
                key={c.id}
                onFocusCapture={() => i !== active && goTo(i)}
                className={cx(
                  "transition-[opacity,transform,visibility] ease-(--ease-out-expo)",
                  i === 0 ? "relative" : "absolute inset-x-0 top-0",
                  // Outgoing text clears fast; incoming waits a beat, so two chapters never overlap legibly.
                  i === active
                    ? "visible translate-y-0 opacity-100 delay-150 duration-500"
                    : cx("pointer-events-none invisible opacity-0 delay-0 duration-150", i < active ? "-translate-y-4" : "translate-y-4"),
                )}
              >
                <ChapterText c={c} index={i} n={n} headingId={i === 0 ? labelledBy : undefined} />
              </article>
            ))}
          </div>
        </div>

        {/* The route line: draws with scroll progress, stops light as they're reached */}
        <div className="container-line pb-[max(1.25rem,env(safe-area-inset-bottom))] md:pb-8" aria-hidden>
          <div className="relative">
            <div className="absolute top-[7px] right-[12.5%] left-[12.5%] h-0.5 bg-navy-line" />
            <div className="absolute top-[7px] left-[12.5%] h-0.5 origin-left bg-gold" style={{ width: "75%", transform: "scaleX(var(--p))" }} />
            <ol className="relative grid" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
              {chapters.map((c, i) => (
                <li key={c.id} className="flex flex-col items-center gap-2">
                  <span
                    className={cx(
                      "size-4 rounded-full border-2 transition-colors duration-500",
                      i <= active ? "border-gold bg-gold" : "border-navy-muted/60 bg-navy",
                      i === active && "ring-4 ring-gold/25",
                    )}
                  />
                  <span className={cx("text-label transition-colors", i <= active ? "text-ivory" : "text-navy-muted/70")}>{c.stop}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

function ChapterText({ c, index, n, headingId }: { c: Chapter; index: number; n: number; headingId?: string }) {
  return (
    <>
      <p className="text-label text-gold">
        <span className="sr-only">
          Part {index + 1} of {n}:{" "}
        </span>
        {c.stop}
      </p>
      <h2 id={headingId} className={cx("mt-3 text-ivory", c.titleClass ?? "text-h2")}>
        {c.title}
      </h2>
      <div className="mt-4 max-w-xl text-[1rem] leading-relaxed text-ivory/80 sm:text-lead">{c.body}</div>
      {c.extra ? <div className="mt-5">{c.extra}</div> : null}
      <Link
        href={c.cta.href}
        className="group mt-6 inline-flex min-h-12 items-center gap-2 rounded-sm bg-gold px-5 font-semibold text-navy transition-colors hover:bg-gold-bright sm:mt-8"
      >
        {c.cta.label}
        <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </>
  );
}
