import Image from "next/image";
import { ArrowUpRight, Check } from "lucide-react";
import type { ReactNode } from "react";
import { site } from "@/config/site";
import { photos, type PhotoKey } from "@/data/photos";
import emblem from "@/assets/brand/cause-krewe-emblem.png";
import { cx } from "@/lib/format";

/* ── Brand: the official pelican emblem ─────────────────────────────────── */
export function Mark({ className, priority }: { className?: string; tone?: "light" | "dark"; priority?: boolean }) {
  return (
    <Image
      src={emblem}
      alt=""
      aria-hidden
      sizes="96px"
      preload={priority}
      className={cx("shrink-0 rounded-full", className)}
    />
  );
}

export function Wordmark({ tone = "light", className }: { tone?: "light" | "dark"; className?: string }) {
  return (
    <span className={cx("inline-flex items-center gap-2.5", className)}>
      <Mark className="size-11" priority />
      <span
        className={cx(
          "font-display text-[1.2rem] leading-none font-semibold whitespace-nowrap tracking-[-0.02em] [font-variation-settings:'wdth'_88,'opsz'_24]",
          tone === "dark" ? "text-ivory" : "text-navy",
        )}
      >
        {site.name}
      </span>
    </span>
  );
}

/* ── Status / type badges ───────────────────────────────────────────────── */
type BadgeTone = "forest" | "gold" | "hollow" | "navy" | "onDark";
const badgeTone: Record<BadgeTone, { wrap: string; dot: string }> = {
  forest: { wrap: "border-forest/35 bg-forest-tint text-forest-deep", dot: "bg-forest" },
  gold: { wrap: "border-gold/60 bg-gold-tint text-gold-ink", dot: "bg-gold" },
  hollow: { wrap: "border-hairline-strong bg-paper text-ink-muted", dot: "border-[1.5px] border-ink-muted bg-transparent" },
  navy: { wrap: "border-navy/25 bg-navy text-ivory", dot: "bg-gold" },
  onDark: { wrap: "border-ivory/30 bg-navy-deep/40 text-ivory", dot: "bg-gold" },
};

export function Badge({ tone = "forest", children, className }: { tone?: BadgeTone; children: ReactNode; className?: string }) {
  const t = badgeTone[tone];
  return (
    <span
      className={cx(
        "text-label inline-flex items-center gap-1.5 rounded-sm border px-2 py-1 whitespace-nowrap normal-case tracking-[0.02em] text-[0.75rem]",
        t.wrap,
        className,
      )}
    >
      <span aria-hidden className={cx("size-1.5 rounded-full", t.dot)} />
      {children}
    </span>
  );
}

/* ── Section heading block ─────────────────────────────────────────────── */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  as: As = "h2",
  align = "left",
  tone = "light",
  className,
  id,
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  as?: "h1" | "h2";
  align?: "left" | "center";
  tone?: "light" | "dark";
  className?: string;
  id?: string;
}) {
  return (
    <div className={cx(align === "center" && "mx-auto text-center", "max-w-3xl", className)} data-reveal>
      {eyebrow ? (
        <p className={cx("text-label mb-4", tone === "dark" ? "text-gold" : "text-gold-ink")}>{eyebrow}</p>
      ) : null}
      <As id={id} className={cx(As === "h1" ? "text-display-lg" : "text-h2", tone === "dark" ? "text-ivory" : "text-navy")}>
        {title}
      </As>
      {lead ? (
        <p className={cx("text-lead mt-5 measure", align === "center" && "mx-auto", tone === "dark" ? "text-navy-muted" : "text-ink-muted")}>
          {lead}
        </p>
      ) : null}
    </div>
  );
}

/* ── Photo with blur placeholder ───────────────────────────────────────── */
export function Photo({
  name,
  sizes,
  className,
  imgClassName,
  preload,
  fill = true,
  alt,
}: {
  name: PhotoKey;
  sizes: string;
  className?: string;
  imgClassName?: string;
  preload?: boolean;
  fill?: boolean;
  /** Override alt (use "" when purely decorative). */
  alt?: string;
}) {
  const p = photos[name];
  return (
    <div className={cx("relative overflow-hidden bg-sand", className)}>
      <Image
        src={p.src}
        alt={alt ?? p.alt}
        placeholder="blur"
        sizes={sizes}
        preload={preload}
        fill={fill}
        className={cx("object-cover", imgClassName)}
      />
    </div>
  );
}

/* ── External text link ────────────────────────────────────────────────── */
export function ExternalLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cx("link inline-flex items-center gap-1", className)}>
      {children}
      <ArrowUpRight aria-hidden className="size-[0.95em] shrink-0" />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

/* ── Verification line ─────────────────────────────────────────────────── */
export function VerifiedLine({ date, className }: { date: string; className?: string }) {
  return (
    <p className={cx("text-ink-muted inline-flex items-center gap-1.5 text-[0.8125rem]", className)}>
      <Check aria-hidden className="text-forest size-3.5" strokeWidth={3} />
      Link and details verified {date}
    </p>
  );
}

/* ── Station marker used at the top of long-page sections ──────────────── */
export function Station({ tone = "light", className }: { tone?: "light" | "dark"; className?: string }) {
  return (
    <span aria-hidden className={cx("flex items-center gap-0", className)}>
      <span className={cx("size-3 rounded-full border-2", tone === "dark" ? "border-gold bg-navy" : "border-forest bg-ivory")} />
      <span className={cx("h-0.5 w-10", tone === "dark" ? "bg-gold" : "bg-forest")} />
    </span>
  );
}
