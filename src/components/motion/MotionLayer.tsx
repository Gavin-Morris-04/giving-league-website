"use client";

import { useEffect } from "react";

/**
 * Site-wide motion layer.
 *
 * - ScrollReveal: elements marked `data-reveal` rise 24px and fade in once. Children of `data-reveal-group`
 *   marked `data-reveal-item` reveal in sequence (80ms apart).
 * - Rellax: elements marked `data-rellax` (with `data-rellax-speed`) get a restrained parallax.
 *
 * Render <MotionLayer /> as the LAST child of a page: its effect then runs only after every element before it
 * has hydrated, so the libraries never touch server-rendered DOM that React hasn't claimed yet.
 * Both libraries are dynamically imported, skipped entirely when the visitor prefers reduced motion, and
 * destroyed on unmount (every route change) so no listeners or inline styles leak between pages.
 * Content is fully visible without JavaScript: nothing in CSS hides `[data-reveal]` elements.
 */
export function MotionLayer() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;

    let cancelled = false;
    let sr: { destroy(): void } | null = null;
    let rellax: { destroy(): void } | null = null;
    const desktop = window.matchMedia("(min-width: 48rem)");

    const start = async () => {
      // ── ScrollReveal ───────────────────────────────────────────────
      const singles = document.querySelectorAll<HTMLElement>("[data-reveal]");
      const groups = document.querySelectorAll<HTMLElement>("[data-reveal-group]");
      if (singles.length || groups.length) {
        const { default: ScrollReveal } = await import("scrollreveal");
        if (cancelled) return;
        const instance = ScrollReveal({
          distance: "24px",
          origin: "bottom",
          duration: 700,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          opacity: 0,
          scale: 1,
          viewFactor: 0.15,
          viewOffset: { top: 0, right: 0, bottom: 40, left: 0 },
          cleanup: true,
          reset: false,
          mobile: true,
        });
        if (singles.length) instance.reveal(singles);
        groups.forEach((group) => {
          const items = group.querySelectorAll<HTMLElement>("[data-reveal-item]");
          if (items.length) instance.reveal(items, { interval: 80 });
        });
        sr = instance;
      }

      // ── Rellax (desktop/tablet only) ────────────────────────────────
      if (desktop.matches && document.querySelector("[data-rellax]")) {
        const { default: Rellax } = await import("rellax");
        if (cancelled) return;
        rellax = new Rellax("[data-rellax]", { center: false, round: true, vertical: true, horizontal: false });
      }
    };

    // Wait a frame so the new route's DOM is committed.
    const raf = requestAnimationFrame(() => void start());

    const onMotionPref = () => {
      if (reduce.matches) teardown();
    };
    const onViewport = () => {
      if (!desktop.matches && rellax) {
        rellax.destroy();
        rellax = null;
      }
    };
    reduce.addEventListener("change", onMotionPref);
    desktop.addEventListener("change", onViewport);

    function teardown() {
      cancelled = true;
      cancelAnimationFrame(raf);
      try {
        sr?.destroy();
      } catch {}
      try {
        rellax?.destroy();
      } catch {}
      sr = null;
      rellax = null;
    }

    return () => {
      reduce.removeEventListener("change", onMotionPref);
      desktop.removeEventListener("change", onViewport);
      teardown();
    };
  }, []);

  return null;
}
