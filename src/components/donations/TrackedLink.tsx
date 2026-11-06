"use client";

import type { ReactNode } from "react";

type Props = {
  href: string;
  charity: string;
  event: "donate_click" | "learn_more_click" | "campaign_click" | "corporate_click";
  className?: string;
  children: ReactNode;
  srLabel?: string;
};

/** Sends an anonymous click count (never a "donation") unless the visitor has Do Not Track / GPC enabled. */
function send(charity: string, event: string) {
  try {
    const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
    if (nav.doNotTrack === "1" || nav.globalPrivacyControl) return;
    const payload = JSON.stringify({ charity, event });
    if (!navigator.sendBeacon?.("/api/track", new Blob([payload], { type: "application/json" }))) {
      void fetch("/api/track", { method: "POST", body: payload, headers: { "content-type": "application/json" }, keepalive: true });
    }
  } catch {
    /* analytics must never block the link */
  }
}

export function TrackedLink({ href, charity, event, className, children, srLabel }: Props) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className} onClick={() => send(charity, event)}>
      {children}
      <span className="sr-only">{srLabel ?? ""} (opens in a new tab)</span>
    </a>
  );
}
