import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { universities } from "@/data/reference/geography";
import { serviceAreas } from "@/data/reference/locations";
import { charityEvents } from "@/data/verified/charity-events";
import { opportunities } from "@/lib/directory";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url.replace(/\/$/, "");
  const lastModified = new Date(`${site.directoryVerifiedOn}T00:00:00Z`);
  const routes = [
    "",
    "/volunteer",
    "/volunteer/submit",
    "/events",
    "/events/submit",
    "/campuses",
    "/high-schools",
    "/donations",
    "/geaux-give-week",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
    "/credits",
  ];
  return [
    ...routes.map((r) => ({ url: `${base}${r}`, lastModified, changeFrequency: "weekly" as const, priority: r === "" ? 1 : r === "/volunteer" ? 0.9 : 0.6 })),
    ...opportunities.map((o) => ({ url: `${base}/volunteer/${o.slug}`, lastModified: new Date(`${o.lastVerified}T00:00:00Z`), priority: 0.5 })),
    ...charityEvents.map((e) => ({ url: `${base}/events/${e.slug}`, lastModified: new Date(`${e.lastVerified}T00:00:00Z`), priority: 0.5 })),
    ...universities.map((u) => ({ url: `${base}/campuses/${u.slug}`, lastModified, priority: 0.5 })),
    ...serviceAreas.map((a) => ({ url: `${base}/high-schools/${a.slug}`, lastModified, priority: 0.5 })),
  ];
}
