"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { ctaNav, desktopMoreHrefs, primaryNav } from "@/config/navigation";
import { site } from "@/config/site";
import { buttonClass } from "@/components/ui/Button";
import { Wordmark } from "@/components/ui/primitives";
import { cx } from "@/lib/format";

/** Routes whose hero is a dark full-bleed field that the header floats over. */
const DARK_HERO_ROUTES = new Set(["/", "/geaux-give-week"]);

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLLIElement>(null);

  const overHero = DARK_HERO_ROUTES.has(pathname) && !scrolled && !open;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const close = useCallback((returnFocus = true) => {
    setOpen(false);
    if (returnFocus) requestAnimationFrame(() => toggleRef.current?.focus());
  }, []);

  // Close the menu on navigation (render-time state adjustment, per React's guidance).
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    if (open) setOpen(false);
    if (moreOpen) setMoreOpen(false);
  }

  // Desktop "More" menu: close on outside click or Escape.
  useEffect(() => {
    if (!moreOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!moreRef.current?.contains(e.target as Node)) setMoreOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMoreOpen(false);
        moreRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [moreOpen]);

  const barItems = primaryNav.filter((i) => !desktopMoreHrefs.has(i.href));
  const moreItems = primaryNav.filter((i) => desktopMoreHrefs.has(i.href));
  const moreActive = moreItems.some((i) => isActive(pathname, i.href));
  const linkCls = (active: boolean) =>
    cx(
      "relative inline-flex h-11 items-center gap-1 rounded-sm px-2.5 text-[0.9375rem] font-medium whitespace-nowrap transition-colors",
      overHero ? "text-ivory/85 hover:text-ivory" : "text-ink-muted hover:text-ink",
      active && (overHero ? "text-ivory" : "text-ink"),
      "after:absolute after:inset-x-2.5 after:bottom-1.5 after:h-0.5 after:origin-left after:scale-x-0 after:bg-gold after:transition-transform after:duration-300 hover:after:scale-x-100",
      active && "after:scale-x-100",
    );

  // Focus trap, Escape, scroll lock while the mobile menu is open.
  useEffect(() => {
    if (!open) return;
    const menu = menuRef.current;
    // Lock both <html> and <body>: iOS Safari ignores overflow on <body> alone.
    document.documentElement.classList.add("menu-open");
    const focusables = () => Array.from(menu?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? []);
    focusables()[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.classList.remove("menu-open");
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  return (
    <>
      <header
        className={cx(
          "sticky top-0 z-50 h-(--header-h) transition-[background-color,border-color,color] duration-300",
          overHero ? "on-dark border-b border-transparent bg-transparent" : "border-b border-hairline bg-ivory/95 backdrop-blur-sm",
        )}
      >
        <div className="container-line flex h-full items-center justify-between gap-6">
          <Link href="/" className="-m-1 rounded-sm p-1" aria-label={`${site.name} — home`}>
            <Wordmark tone={overHero ? "dark" : "light"} />
          </Link>

          <nav aria-label="Main" className="hidden xl:block">
            <ul className="flex items-center gap-0.5">
              {barItems.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link href={item.href} aria-current={active ? "page" : undefined} className={linkCls(active)}>
                      {item.label}
                    </Link>
                  </li>
                );
              })}
              <li ref={moreRef} className="relative">
                <button
                  type="button"
                  aria-expanded={moreOpen}
                  aria-controls="more-menu"
                  onClick={() => setMoreOpen((v) => !v)}
                  className={linkCls(moreActive)}
                >
                  More
                  <ChevronDown aria-hidden className={cx("size-4 transition-transform", moreOpen && "rotate-180")} />
                </button>
                <ul
                  id="more-menu"
                  hidden={!moreOpen}
                  className="absolute top-full right-0 z-50 mt-2 w-64 rounded-md border border-hairline bg-paper p-2 text-ink shadow-[0_18px_40px_-18px_rgb(11_48_51/0.45)]"
                >
                  {moreItems.map((item) => {
                    const active = isActive(pathname, item.href);
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          aria-current={active ? "page" : undefined}
                          onClick={() => setMoreOpen(false)}
                          className={cx(
                            "flex min-h-11 items-center justify-between gap-3 rounded-sm px-3 text-[0.9375rem] font-medium hover:bg-sand",
                            active && "bg-sand",
                          )}
                        >
                          {item.label}
                          {item.badge ? (
                            <span className="text-label rounded-sm bg-gold-tint px-1.5 py-0.5 text-[0.625rem] text-gold-ink">
                              {item.badge}
                            </span>
                          ) : null}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href={ctaNav.href}
              className={buttonClass({ variant: overHero ? "dark" : "primary", className: "min-h-11! px-4! max-sm:hidden!" })}
            >
              {ctaNav.label}
            </Link>
            <button
              ref={toggleRef}
              type="button"
              className={cx(
                "inline-flex min-h-11 items-center gap-2 rounded-sm px-3 font-semibold xl:hidden",
                overHero ? "text-ivory" : "text-ink",
              )}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => (open ? close() : setOpen(true))}
            >
              <Menu aria-hidden className="size-5" />
              <span>Menu</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu sheet — a sibling of <header>, because the header's backdrop-filter would otherwise
          become the containing block for this fixed element and clip it to the header's height on iOS. */}
      <div
        id="mobile-menu"
        ref={menuRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        hidden={!open}
        className="on-dark fixed inset-0 z-60 overflow-y-auto bg-navy text-ivory xl:hidden"
      >
        <div className="container-line flex h-(--header-h) items-center justify-between">
          <Link href="/" onClick={() => close(false)} className="rounded-sm" aria-label={`${site.name} — home`}>
            <Wordmark tone="dark" />
          </Link>
          <button type="button" onClick={() => close()} className="inline-flex min-h-11 items-center gap-2 rounded-sm px-3 font-semibold">
            <X aria-hidden className="size-5" />
            Close
          </button>
        </div>
        <nav aria-label="Mobile" className="container-line pt-6 pb-12">
          <ol className="relative border-l-2 border-gold/70 pl-6">
            {primaryNav.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href} className="relative">
                  <span
                    aria-hidden
                    className={cx(
                      "absolute top-1/2 -left-[2.0625rem] size-3.5 -translate-y-1/2 rounded-full border-2 border-gold",
                      active ? "bg-gold" : "bg-navy",
                    )}
                  />
                  <Link
                    href={item.href}
                    onClick={() => close(false)}
                    aria-current={active ? "page" : undefined}
                    className="block py-2 font-display text-[clamp(1.5rem,1.2rem+1.2vw,2rem)] leading-tight font-semibold tracking-[-0.02em] text-ivory transition-colors hover:text-gold-bright [font-variation-settings:'wdth'_92]"
                  >
                    {item.label}
                    {item.badge ? (
                      <span className="text-label ml-3 rounded-sm border border-gold/50 px-1.5 py-0.5 align-middle text-[0.625rem] text-gold">
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ol>
          <Link
            href={ctaNav.href}
            onClick={() => close(false)}
            className={buttonClass({ variant: "dark", size: "lg", className: "mt-10 w-full" })}
          >
            {ctaNav.label}
          </Link>
          <p className="mt-8 text-sm text-navy-muted">{site.tagline}</p>
        </nav>
      </div>
    </>
  );
}
