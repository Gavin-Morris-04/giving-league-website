import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <article className="container-line py-14 md:py-20">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-display-lg text-navy">{title}</h1>
        <p className="mt-4 text-ink-muted">Last updated {updated}</p>
        <div className="mt-8 flex gap-3 rounded-md border border-gold/60 bg-gold-tint p-5 text-[0.9375rem] text-ink" role="note">
          <AlertTriangle aria-hidden className="mt-0.5 size-5 shrink-0 text-gold-ink" />
          <p>
            <strong>Draft — requires legal review before launch.</strong> This page describes how the site actually works today, but it has
            not been reviewed by an attorney. Sections marked <em>[Legal review]</em> need particular attention.
          </p>
        </div>
        <div className="prose-legal mt-10 text-[1.0625rem] text-ink">{children}</div>
      </div>
    </article>
  );
}

export function Review() {
  return <span className="ml-1 rounded-sm bg-gold-tint px-1.5 py-0.5 text-[0.75rem] font-semibold text-gold-ink">[Legal review]</span>;
}
