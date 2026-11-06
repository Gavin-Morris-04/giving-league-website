import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { universities } from "@/data/reference/geography";
import { communityEvents } from "@/data/programs/events";
import { opportunities } from "@/lib/directory";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url.replace(/\/$/, "");
  const lastModified = new Date(`${site.directoryVerifiedOn}T00:00:00Z`);
  const routes = ["", "/volunteer", "/volunteer/submit", "/events", "/campuses", "/geaux-give-week", "/partners", "/about", "/contact", "/privacy", "/terms", "/credits"];
  return [
    ...routes.map((r) => ({ url: `${base}${r}`, lastModified, changeFrequency: "weekly" as const, priority: r === "" ? 1 : r === "/volunteer" ? 0.9 : 0.6 })),
    ...opportunities.map((o) => ({ url: `${base}/volunteer/${o.slug}`, lastModified: new Date(`${o.lastVerified}T00:00:00Z`), priority: 0.5 })),
    ...universities.map((u) => ({ url: `${base}/campuses/${u.slug}`, lastModified, priority: 0.5 })),
    ...communityEvents.map((e) => ({ url: `${base}/events/${e.slug}`, lastModified, priority: 0.4 })),
  ];
}
