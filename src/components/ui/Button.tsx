import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cx } from "@/lib/format";

type Variant = "primary" | "secondary" | "dark" | "darkSecondary" | "quiet";
type Size = "md" | "lg";

const base =
  "group/btn inline-flex items-center justify-center gap-2 rounded-sm font-semibold leading-none transition-[background-color,color,border-color,transform] duration-200 ease-(--ease-out-expo) active:translate-y-px disabled:pointer-events-none disabled:opacity-45 select-none";

const variants: Record<Variant, string> = {
  primary: "bg-forest text-white hover:bg-forest-deep",
  secondary: "border-[1.5px] border-ink text-ink hover:bg-ink hover:text-ivory",
  dark: "bg-gold text-navy hover:bg-gold-bright",
  darkSecondary: "border-[1.5px] border-ivory/60 text-ivory hover:bg-ivory hover:text-navy hover:border-ivory",
  quiet: "text-forest underline decoration-1 underline-offset-[0.25em] hover:decoration-2 px-0!",
};

const sizes: Record<Size, string> = {
  md: "min-h-12 px-5 text-[0.95rem]",
  lg: "min-h-14 px-7 text-base",
};

type Common = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  /** Arrow icon after the label. "external" shows ↗ and opens a new tab. */
  icon?: "arrow" | "external" | "none";
};

export function buttonClass({ variant = "primary", size = "md", className }: Pick<Common, "variant" | "size" | "className">) {
  return cx(base, variants[variant], sizes[size], className);
}

function Icon({ icon }: { icon: Common["icon"] }) {
  if (icon === "external")
    return (
      <ArrowUpRight
        aria-hidden
        className="size-[1.1em] shrink-0 transition-transform duration-200 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5"
      />
    );
  if (icon === "arrow")
    return <ArrowRight aria-hidden className="size-[1.1em] shrink-0 transition-transform duration-200 group-hover/btn:translate-x-0.5" />;
  return null;
}

export function ButtonLink({
  href,
  variant,
  size,
  className,
  children,
  icon = "none",
  ...rest
}: Common & { href: string } & Omit<ComponentProps<"a">, "href" | "className" | "children">) {
  const cls = buttonClass({ variant, size, className });
  const external = icon === "external" || /^https?:\/\//.test(href);
  if (external) {
    return (
      <a href={href} className={cls} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
        <Icon icon={icon === "none" ? "external" : icon} />
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...rest}>
      {children}
      <Icon icon={icon} />
    </Link>
  );
}

export function Button({
  variant,
  size,
  className,
  children,
  icon = "none",
  ...rest
}: Common & Omit<ComponentProps<"button">, "className" | "children">) {
  return (
    <button className={buttonClass({ variant, size, className })} {...rest}>
      {children}
      <Icon icon={icon} />
    </button>
  );
}
