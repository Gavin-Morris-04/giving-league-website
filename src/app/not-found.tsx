import { ButtonLink } from "@/components/ui/Button";
import { Station } from "@/components/ui/primitives";

export default function NotFound() {
  return (
    <section className="container-line py-24 md:py-36">
      <Station className="mb-8" />
      <p className="text-label text-gold-ink">Page not found</p>
      <h1 className="text-display-lg mt-4 max-w-3xl text-navy">This stop isn&apos;t on the line.</h1>
      <p className="text-lead mt-6 max-w-xl text-ink-muted">The page may have moved, or the link may be mistyped. Here are good places to pick up again.</p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href="/volunteer" size="lg" icon="arrow">
          Find volunteer opportunities
        </ButtonLink>
        <ButtonLink href="/" variant="secondary" size="lg">
          Go to the homepage
        </ButtonLink>
      </div>
    </section>
  );
}
