"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button, buttonClass } from "@/components/ui/Button";

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="container-line py-24 md:py-36" role="alert">
      <p className="text-label text-error">Something went wrong</p>
      <h1 className="text-display-lg mt-4 max-w-3xl text-navy">This page didn&apos;t load properly.</h1>
      <p className="text-lead mt-6 max-w-xl text-ink-muted">It&apos;s not you. Try again, or head back to the volunteer finder.</p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Button size="lg" onClick={() => reset()}>
          Try again
        </Button>
        <Link href="/volunteer" className={buttonClass({ variant: "secondary", size: "lg" })}>
          Go to the finder
        </Link>
      </div>
      {error.digest ? <p className="mt-8 text-[0.8125rem] text-ink-muted">Reference: {error.digest}</p> : null}
    </section>
  );
}
