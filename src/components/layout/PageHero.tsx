import type { ReactNode } from "react";
import { Photo, Station } from "@/components/ui/primitives";
import type { PhotoKey } from "@/data/photos";
import { cx } from "@/lib/format";

/**
 * Interior page hero: the page's h1 and lead on the container line, with an optional photograph plate.
 * `compact` keeps the first screen short so a working tool (the finder) starts above the fold.
 */
export function PageHero({
  eyebrow,
  title,
  lead,
  photo,
  actions,
  meta,
  compact = false,
  className,
}: {
  /** Only where the copy deck specifies one. */
  eyebrow?: string;
  title: ReactNode;
  lead: ReactNode;
  photo?: PhotoKey;
  actions?: ReactNode;
  meta?: ReactNode;
  compact?: boolean;
  className?: string;
}) {
  return (
    <section className={cx("relative overflow-hidden border-b border-hairline", className)}>
      <div
        className={cx(
          "container-line grid items-center gap-10 lg:grid-cols-12 lg:gap-12",
          compact ? "pt-8 pb-8 md:pt-16 md:pb-12" : "pt-10 pb-12 md:pt-20 md:pb-20",
        )}
      >
        <div className={cx(photo ? "lg:col-span-7" : "lg:col-span-9")}>
          <Station className="mb-5 md:mb-7" />
          {eyebrow ? <p className="text-label mb-4 text-gold-ink">{eyebrow}</p> : null}
          <h1 className="text-display-lg text-navy">{title}</h1>
          <p className="text-lead mt-4 max-w-2xl text-ink-muted md:mt-6">{lead}</p>
          {meta ? <div className="mt-6">{meta}</div> : null}
          {actions ? <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">{actions}</div> : null}
        </div>
        {photo ? (
          <div className={cx("lg:col-span-5", compact && "hidden lg:block")}>
            <Photo
              name={photo}
              preload
              sizes="(min-width: 1024px) 40vw, 100vw"
              className={cx("rounded-md", compact ? "aspect-[5/4]" : "aspect-[4/5] max-lg:aspect-[16/10]")}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
