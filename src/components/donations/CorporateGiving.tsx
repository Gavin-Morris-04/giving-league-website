import { ArrowUpRight, Info } from "lucide-react";
import { getCharity } from "@/data/verified/charities";
import { cx } from "@/lib/format";
import { TrackedLink } from "./TrackedLink";

type LinkKind = "info" | "inquiry" | "donation";
const kindLabel: Record<LinkKind, string> = {
  info: "Information page",
  inquiry: "Inquiry form — not a payment page",
  donation: "Donation payment page",
};

type CorporateCard = {
  charityId: string;
  title: string;
  options: { title: string; body: string }[];
  links: { label: string; href: string; kind: LinkKind; variant: "primary" | "secondary" | "text" }[];
  note?: string;
};

/**
 * Business & Corporate Giving — informational only. Links go to each charity's own programs; nothing is
 * collected or processed by us, and no partnership with either charity is implied.
 */
const cards: CorporateCard[] = [
  {
    charityId: "st-jude",
    title: "Support St. Jude Through Your Business",
    options: [
      { title: "Direct Corporate Donations", body: "Businesses can make contributions directly through St. Jude's official giving channels." },
      { title: "Workplace Giving", body: "Companies can organize employee donation programs and payroll giving." },
      { title: "Matching Gifts", body: "Eligible employers can match their employees' charitable donations." },
      {
        title: "Business Fundraising Programs",
        body: "Businesses can inquire about approved fundraising promotions, customer giving, and charity events.",
      },
    ],
    links: [
      {
        label: "Explore Corporate Giving",
        href: "https://www.stjude.org/get-involved/other-ways/partner-with-st-jude/business-resources-for-cause-marketing.html",
        kind: "info",
        variant: "primary",
      },
      { label: "Workplace Giving & Matching", href: "https://www.stjude.org/get-involved/workplace-giving.html", kind: "info", variant: "secondary" },
      { label: "Direct giving information", href: "https://www.stjude.org/give/tax-deductible-donations.html", kind: "info", variant: "text" },
      { label: "Make a Direct Donation", href: "https://www.stjude.org/donate/donate-to-st-jude.html", kind: "donation", variant: "text" },
    ],
    note: "St. Jude doesn't approve cause-marketing (promotional) campaigns from some industries — its page lists categories such as alcoholic beverages, tobacco and firearms. Direct gifts and formal promotional partnerships are separate arrangements; confirm your options directly with St. Jude.",
  },
  {
    charityId: "make-a-wish",
    title: "Help Grant Wishes Through Your Business",
    options: [
      { title: "Corporate Gifts", body: "Businesses can contribute to Make-A-Wish through approved giving channels." },
      { title: "Employee Giving", body: "Companies can encourage employees to support Make-A-Wish through workplace donation programs." },
      { title: "Corporate Fundraising", body: "Businesses can explore charity events, donation campaigns, and customer-supported fundraising initiatives." },
      { title: "Community Partnerships", body: "Businesses can contact Make-A-Wish directly to discuss opportunities that align with its charitable mission." },
    ],
    links: [
      { label: "Explore Corporate Giving", href: "https://wish.org/get-involved", kind: "info", variant: "primary" },
      { label: "Contact Make-A-Wish", href: "https://wish.org/partner-inquiry-form", kind: "inquiry", variant: "secondary" },
    ],
  },
];

export function CorporateGiving() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {cards.map((card) => {
        const c = getCharity(card.charityId);
        if (!c) return null;
        return (
          <article key={card.charityId} className="flex h-full flex-col rounded-md border border-hairline bg-paper p-6 sm:p-8" data-reveal-item>
            <p className="text-[0.875rem] font-semibold text-forest">{c.name}</p>
            <h3 className="text-h3 mt-1 text-navy">{card.title}</h3>
            <p className="mt-3 text-ink-muted">{c.corporateGivingDescription}</p>
            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              {card.options.map((o) => (
                <div key={o.title} className="border-l-2 border-gold pl-4">
                  <dt className="font-semibold text-navy">{o.title}</dt>
                  <dd className="mt-1 text-[0.9375rem] text-ink-muted">{o.body}</dd>
                </div>
              ))}
            </dl>
            {card.note ? (
              <p className="mt-6 flex gap-2 rounded-md border border-gold/60 bg-gold-tint p-4 text-[0.875rem] text-ink">
                <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-gold-ink" />
                {card.note}
              </p>
            ) : null}
            <ul className="mt-auto grid gap-3 pt-8">
              {card.links.map((l) => (
                <li key={l.href + l.label} className={cx(l.variant === "text" ? "" : "")}>
                  <TrackedLink
                    href={l.href}
                    charity={c.id}
                    event={l.kind === "donation" ? "donate_click" : "corporate_click"}
                    srLabel={` — ${kindLabel[l.kind]}`}
                    className={cx(
                      "group inline-flex items-center gap-1.5 font-semibold",
                      l.variant === "primary" && "min-h-12 rounded-sm bg-forest px-5 text-white transition-colors hover:bg-forest-deep",
                      l.variant === "secondary" && "min-h-12 rounded-sm border-[1.5px] border-ink px-5 text-ink transition-colors hover:bg-ink hover:text-ivory",
                      l.variant === "text" && "link min-h-11",
                    )}
                  >
                    {l.label}
                    <ArrowUpRight aria-hidden className="size-4" />
                  </TrackedLink>
                  <span className="ml-3 text-[0.8125rem] text-ink-muted">{kindLabel[l.kind]}</span>
                </li>
              ))}
            </ul>
          </article>
        );
      })}
    </div>
  );
}
