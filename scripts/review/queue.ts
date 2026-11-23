/**
 * The review queue between the morning Claude job and the live site.
 *
 *   Claude's finds ──add──▶ discovery/review/queue.json ──render──▶ review issue (✅ / ❌ per listing)
 *   ticks on the issue ──apply──▶ src/data/discovered/approved.json (what the site shows)
 *   issue done or replaced ──finalize──▶ discovery/review/decisions.json (so nothing is suggested twice)
 *
 * Everything here is pure (no file or network access) so it can be unit-tested; scripts/review/cli.ts does the I/O.
 */
import { createHash } from "node:crypto";
import { candidateSchema, claudeOutputSchema, type Candidate, type EventListing, type OpportunityListing, type OrganizationInput } from "./schema.ts";

/* ── File shapes ─────────────────────────────────────────────────────────────────────────────────────────────── */

export type ItemState = "pending" | "published" | "skipped";
export type QueueItem = Candidate & { id: string; slug: string; foundOn: string; issue: number | null; state: ItemState };
export type QueueFile = { _comment?: string; items: QueueItem[] };

export type Decision = {
  id: string;
  type: Candidate["type"];
  title: string;
  url: string;
  lastDay: string | null;
  decision: "published" | "skipped";
  decidedOn: string;
  issue: number | null;
};
export type DecisionsFile = { _comment?: string; decisions: Decision[] };

export type ApprovedEntry<T> = { reviewId: string; approvedOn: string; reviewIssue: number | null; listing: T };
export type ApprovedOpportunity = OpportunityListing & { slug: string; lastVerified: string; provenance: "verified" };
export type ApprovedEvent = EventListing & { slug: string; lastVerified: string; provenance: "verified" };
export type ApprovedFile = {
  _comment?: string;
  organizations: OrganizationInput[];
  opportunities: ApprovedEntry<ApprovedOpportunity>[];
  events: ApprovedEntry<ApprovedEvent>[];
};

/** What's already on the site (hand-verified + previously approved), used for de-duplication. */
export type Existing = {
  opportunities: { slug: string; title: string; infoUrl: string; signupUrl: string; startDate?: string; endDate?: string; roles?: { signupUrl: string }[] }[];
  events: { slug: string; name: string; infoUrl: string; registrationUrl: string; confirmed?: { startDate: string; endDate?: string } }[];
  organizations: { slug: string; name: string }[];
};

export const MAX_NEW_PER_DAY = 12;
export const MAX_QUEUE = 25;

/* ── Small helpers ───────────────────────────────────────────────────────────────────────────────────────────── */

/** Today's date in Louisiana (America/Chicago), yyyy-mm-dd. */
export function louisianaToday(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

/** Comparable form of a link: no scheme, no www, no trailing slash or #fragment, no tracking parameters. */
export function normalizeUrl(raw: string): string {
  try {
    const u = new URL(raw.trim());
    const params = [...u.searchParams.entries()].filter(([k]) => !/^(utm_|fbclid$|gclid$|mc_)/i.test(k)).sort(([a], [b]) => a.localeCompare(b));
    const query = params.length ? `?${new URLSearchParams(params).toString()}` : "";
    const path = u.pathname.replace(/\/+$/, "");
    return `${u.hostname.toLowerCase().replace(/^www\./, "")}${path}${query}`;
  } catch {
    return raw.trim().toLowerCase();
  }
}

const normalizeTitle = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

export function slugify(s: string): string {
  return (
    s
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 64)
      .replace(/-+$/g, "") || "listing"
  );
}

export function candidateTitle(c: Candidate): string {
  return c.type === "opportunity" ? c.listing.title : c.listing.name;
}

export function candidateInfoUrl(c: Candidate): string {
  return c.listing.infoUrl;
}

/** First and last day of a dated listing, or nulls for ongoing volunteer resources. */
export function candidateDates(c: Candidate): { first: string | null; last: string | null } {
  if (c.type === "opportunity") {
    const first = c.listing.startDate ?? null;
    return { first, last: c.listing.endDate ?? first };
  }
  const first = c.listing.confirmed?.startDate ?? null;
  return { first, last: c.listing.confirmed?.endDate ?? first };
}

export function makeId(c: Candidate): string {
  const { first } = candidateDates(c);
  return createHash("sha1")
    .update(`${c.type}|${normalizeUrl(c.listing.infoUrl)}|${normalizeTitle(candidateTitle(c))}|${first ?? ""}`)
    .digest("hex")
    .slice(0, 10);
}

/* ── add: Claude's output → queue ───────────────────────────────────────────────────────────────────────────── */

export type AddResult = { queue: QueueFile; added: QueueItem[]; dropped: { title: string; reason: string }[]; expired: QueueItem[] };

export function addCandidates(
  raw: unknown,
  ctx: { queue: QueueFile; decisions: DecisionsFile; existing: Existing; today: string },
): AddResult {
  const dropped: AddResult["dropped"] = [];
  const outer = claudeOutputSchema.safeParse(raw);
  const rawCandidates = outer.success ? outer.data.candidates : [];
  if (!outer.success) dropped.push({ title: "(whole file)", reason: `Not in the expected shape: ${outer.error.issues[0]?.message ?? "invalid"}` });

  // Ended listings leave the queue; anything already decided stays decided.
  const expired = ctx.queue.items.filter((i) => i.state === "pending" && isOver(i, ctx.today));
  const keep = ctx.queue.items.filter((i) => !expired.includes(i));

  const seenUrls = new Set<string>();
  const seenTitles = new Set<string>();
  const seenIds = new Set<string>();
  const slugs = new Set<string>();
  const remember = (urls: string[], title: string, date: string | null) => {
    urls.forEach((u) => seenUrls.add(normalizeUrl(u)));
    seenTitles.add(`${normalizeTitle(title)}|${date ?? ""}`);
  };
  for (const o of ctx.existing.opportunities) {
    remember([o.infoUrl, ...(o.roles ?? []).map((r) => r.signupUrl)], o.title, o.startDate ?? null);
    slugs.add(o.slug);
  }
  for (const e of ctx.existing.events) {
    remember([e.infoUrl], e.name, e.confirmed?.startDate ?? null);
    slugs.add(e.slug);
  }
  for (const d of ctx.decisions.decisions) {
    seenIds.add(d.id);
    remember([d.url], d.title, null);
  }
  for (const i of keep) {
    seenIds.add(i.id);
    remember([i.listing.infoUrl, i.sourceUrl], candidateTitle(i), candidateDates(i).first);
    slugs.add(i.slug);
  }
  const knownOrgs = new Set(ctx.existing.organizations.map((o) => o.slug));

  const added: QueueItem[] = [];
  for (const rawCandidate of rawCandidates) {
    const parsed = candidateSchema.safeParse(rawCandidate);
    const label = guessTitle(rawCandidate);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      dropped.push({ title: label, reason: `Invalid: ${issue?.path.join(".") || "item"} — ${issue?.message ?? "invalid"}` });
      continue;
    }
    const c = parsed.data;
    const title = candidateTitle(c);
    const { first, last } = candidateDates(c);
    const id = makeId(c);

    if (c.type === "opportunity" && !knownOrgs.has(c.listing.orgSlug) && c.organization?.slug !== c.listing.orgSlug) {
      dropped.push({ title, reason: `Unknown organization "${c.listing.orgSlug}" and no organization details given` });
      continue;
    }
    if (last && last < ctx.today) {
      dropped.push({ title, reason: "Already over" });
      continue;
    }
    if (seenIds.has(id) || seenUrls.has(normalizeUrl(c.listing.infoUrl)) || seenTitles.has(`${normalizeTitle(title)}|${first ?? ""}`)) {
      dropped.push({ title, reason: "Already listed, waiting for review, or decided before" });
      continue;
    }
    if (keep.filter((i) => i.state === "pending").length + added.length >= MAX_QUEUE || added.length >= MAX_NEW_PER_DAY) {
      dropped.push({ title, reason: "Review queue is full" });
      continue;
    }

    let slug = slugify(title);
    if (first && !slug.includes(first.slice(0, 4))) slug = `${slug}-${first.slice(0, 4)}`;
    for (let n = 2; slugs.has(slug); n++) slug = `${slugify(title)}-${n}`;
    slugs.add(slug);
    seenIds.add(id);
    remember([c.listing.infoUrl, c.sourceUrl], title, first);

    added.push({ ...c, id, slug, foundOn: ctx.today, issue: null, state: "pending" });
  }

  return { queue: { ...ctx.queue, items: [...keep, ...added] }, added, dropped, expired };
}

function isOver(i: QueueItem, today: string) {
  const { last } = candidateDates(i);
  return last !== null && last < today;
}

function guessTitle(raw: unknown): string {
  const l = (raw as { listing?: { title?: unknown; name?: unknown } } | null)?.listing;
  const t = l?.title ?? l?.name;
  return typeof t === "string" ? t.slice(0, 120) : "(untitled)";
}

/* ── render: queue → review issue ───────────────────────────────────────────────────────────────────────────── */

export type RenderContext = {
  today: string;
  cityName: (key: string) => string;
  orgName: (slug: string) => string | undefined;
};

const MARK = (id: string, action: "publish" | "skip") => `<!-- review:${id}:${action} -->`;

/** Text from web pages goes into Markdown: neutralise formatting, links, HTML and @mentions. */
export function mdText(s: string, max = 600): string {
  const flat = s.replace(/\s+/g, " ").trim();
  const cut = flat.length > max ? `${flat.slice(0, max - 1).trimEnd()}…` : flat;
  return cut
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/([\\`*_{}[\]()#+!|~])/g, "\\$1")
    .replace(/@/g, "@​");
}

export function mdUrl(u: string): string {
  const safe = /^https?:\/\//i.test(u) ? u : "about:blank";
  return safe.replace(/[\s<>()"'\\]/g, (ch) => `%${ch.charCodeAt(0).toString(16).toUpperCase().padStart(2, "0")}`);
}

export function formatDay(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

function whenText(c: Candidate): string {
  const { first, last } = candidateDates(c);
  if (!first) return c.type === "opportunity" ? `Ongoing · ${c.listing.timeCommitment}` : c.listing.typicalTiming;
  const range = last && last !== first ? `${formatDay(first)} – ${formatDay(last)}` : formatDay(first);
  const time = c.type === "event" ? c.listing.confirmed?.time : undefined;
  return time ? `${range}, ${time}` : range;
}

export function agesText(c: Candidate): { ages: string; highSchool: "eligible" | "not eligible" | "check with organizer" } {
  if (c.type === "event") {
    const a = c.listing.audience;
    const hs = { yes: "eligible", with_guardian: "eligible", with_adult: "eligible", no: "not eligible", unverified: "check with organizer" } as const;
    const words = {
      yes: "High school students welcome",
      with_guardian: "Under 18 with a parent's permission",
      with_adult: "Under 18 with an adult",
      no: "Not open to high school students",
      unverified: "Age rules not published",
    } as const;
    return { ages: a.note ? `${words[a.highSchool]} (${a.note})` : words[a.highSchool], highSchool: hs[a.highSchool] };
  }
  const e = c.listing.eligibility;
  if (e.minors === "adults_only" || (e.minimumAge !== null && e.minimumAge >= 18)) return { ages: "18+ only", highSchool: "not eligible" };
  const min = e.minimumAge !== null ? `Ages ${e.minimumAge}+` : "No minimum age stated";
  const minors = {
    allowed: "teens can volunteer on their own",
    with_guardian_consent: "under 18 need a parent's permission",
    with_adult: "under 18 must be with an adult",
    youth_program: "separate teen program",
    adults_only: "18+ only",
    unverified: "teen rules not published",
  } as const;
  return { ages: `${min}; ${minors[e.minors]}`, highSchool: e.minors === "unverified" ? "check with organizer" : "eligible" };
}

export function renderIssue(items: QueueItem[], ctx: RenderContext): { title: string; body: string } {
  const pending = items.filter((i) => i.state === "pending");
  const n = pending.length;
  const title = `Review ${n} new listing${n === 1 ? "" : "s"} — ${formatDay(ctx.today)}`;
  const kindLabel = (c: Candidate) =>
    c.type === "event" ? "Charity event" : c.listing.kind === "event" ? "Volunteer event" : "Volunteer opportunity";

  const blocks = pending.map((c, idx) => {
    const host = c.type === "event" ? c.listing.host : (c.organization?.name ?? ctx.orgName(c.listing.orgSlug) ?? c.listing.orgSlug);
    const { ages, highSchool } = agesText(c);
    return [
      `### ${idx + 1}. ${mdText(candidateTitle(c), 120)}`,
      `**${kindLabel(c)}** · ${mdText(ctx.cityName(c.listing.cityKey))} · ${mdText(whenText(c), 200)}`,
      `**Host:** ${mdText(host, 120)} · **Ages:** ${mdText(ages, 200)} · **High school:** ${highSchool}`,
      "",
      mdText(c.listing.summary, 320),
      "",
      `*Checked on the page:* ${mdText(c.checked, 400)}`,
      "",
      `[Open the official page](${mdUrl(c.listing.infoUrl)})${c.sourceUrl !== c.listing.infoUrl ? ` · [where it was found](${mdUrl(c.sourceUrl)})` : ""}`,
      "",
      `- [ ] ✅ Publish ${MARK(c.id, "publish")}`,
      `- [ ] ❌ Skip ${MARK(c.id, "skip")}`,
    ].join("\n");
  });

  const body = [
    `**${n} listing${n === 1 ? "" : "s"} found this morning.** Tick ✅ to put one on the site or ❌ to skip it.`,
    "",
    "Open each official page before you tick ✅ — your check is what makes a listing verified. Ticks are applied about a minute later, and the site updates once Vercel rebuilds. Untick ✅ to take a listing back down while this issue is open.",
    "",
    "Anything you leave unticked carries over to the next review. This issue closes itself when every listing has a ✅ or ❌.",
    "",
    "---",
    "",
    blocks.join("\n\n---\n\n"),
    "",
  ].join("\n");
  return { title, body };
}

/* ── apply: ticks on the issue → approved listings ──────────────────────────────────────────────────────────── */

export function readTicks(body: string): Map<string, { publish: boolean; skip: boolean }> {
  const ticks = new Map<string, { publish: boolean; skip: boolean }>();
  const re = /^\s*[-*+]\s+\[([ xX])\][^\n]*?<!--\s*review:([a-f0-9]{10}):(publish|skip)\s*-->/gm;
  for (const m of body.matchAll(re)) {
    const t = ticks.get(m[2]) ?? { publish: false, skip: false };
    t[m[3] as "publish" | "skip"] = m[1] !== " ";
    ticks.set(m[2], t);
  }
  return ticks;
}

export type ApplyResult = {
  queue: QueueFile;
  approved: ApprovedFile;
  published: QueueItem[];
  unpublished: QueueItem[];
  skipped: QueueItem[];
  conflicts: QueueItem[];
  counts: { published: number; skipped: number; waiting: number };
  allDecided: boolean;
  changed: boolean;
};

export function applyTicks(ctx: { issue: number; body: string; queue: QueueFile; approved: ApprovedFile; existingOrgSlugs: Set<string>; today: string }): ApplyResult {
  const ticks = readTicks(ctx.body);
  let approved: ApprovedFile = structuredClone(ctx.approved);
  const out: Omit<ApplyResult, "queue" | "approved" | "counts" | "allDecided" | "changed"> = { published: [], unpublished: [], skipped: [], conflicts: [] };

  const items = ctx.queue.items.map((item) => {
    const t = ticks.get(item.id);
    if (!t) return item;
    if (t.publish && t.skip) {
      out.conflicts.push(item);
      return { ...item, issue: ctx.issue };
    }
    const want: ItemState = t.publish ? "published" : t.skip ? "skipped" : "pending";
    if (want === item.state) return { ...item, issue: ctx.issue };
    if (item.state === "published") {
      approved = removeApproved(approved, item.id);
      if (want === "pending") out.unpublished.push(item);
    }
    if (want === "published") {
      approved = addApproved(approved, item, ctx.issue, ctx.today, ctx.existingOrgSlugs);
      out.published.push(item);
    }
    if (want === "skipped") out.skipped.push(item);
    return { ...item, issue: ctx.issue, state: want };
  });

  const inIssue = items.filter((i) => ticks.has(i.id));
  const counts = {
    published: inIssue.filter((i) => i.state === "published").length,
    skipped: inIssue.filter((i) => i.state === "skipped").length,
    waiting: inIssue.filter((i) => i.state === "pending").length,
  };
  const changed = out.published.length + out.unpublished.length + out.skipped.length > 0 || items.some((i, k) => i.issue !== ctx.queue.items[k].issue);
  return {
    queue: { ...ctx.queue, items },
    approved,
    ...out,
    counts,
    allDecided: inIssue.length > 0 && counts.waiting === 0 && out.conflicts.length === 0,
    changed,
  };
}

function addApproved(file: ApprovedFile, item: QueueItem, issue: number, today: string, existingOrgSlugs: Set<string>): ApprovedFile {
  const next = removeApproved(file, item.id);
  const meta = { reviewId: item.id, approvedOn: today, reviewIssue: issue };
  if (item.type === "opportunity") {
    if (item.organization && !existingOrgSlugs.has(item.organization.slug) && !next.organizations.some((o) => o.slug === item.organization!.slug)) {
      next.organizations = [...next.organizations, item.organization];
    }
    next.opportunities = [...next.opportunities, { ...meta, listing: { slug: item.slug, ...item.listing, lastVerified: today, provenance: "verified" } }];
  } else {
    next.events = [...next.events, { ...meta, listing: { slug: item.slug, ...item.listing, lastVerified: today, provenance: "verified" } }];
  }
  return next;
}

function removeApproved(file: ApprovedFile, reviewId: string): ApprovedFile {
  return {
    ...file,
    opportunities: file.opportunities.filter((e) => e.reviewId !== reviewId),
    events: file.events.filter((e) => e.reviewId !== reviewId),
  };
}

/* ── finalize: issue finished or replaced → decisions log ───────────────────────────────────────────────────── */

/**
 * Moves decided items of an issue out of the queue into the decisions log. Undecided items stay queued (with no
 * issue) so the next review lists them again.
 */
export function finalizeIssue(ctx: { issue: number; body: string; queue: QueueFile; decisions: DecisionsFile; today: string }): { queue: QueueFile; decisions: DecisionsFile; moved: number } {
  const ids = new Set(readTicks(ctx.body).keys());
  const mine = (i: QueueItem) => ids.has(i.id) || i.issue === ctx.issue;
  const done = ctx.queue.items.filter((i) => mine(i) && i.state !== "pending");
  const decisions: Decision[] = done.map((i) => ({
    id: i.id,
    type: i.type,
    title: candidateTitle(i),
    url: i.listing.infoUrl,
    lastDay: candidateDates(i).last,
    decision: i.state === "published" ? "published" : "skipped",
    decidedOn: ctx.today,
    issue: ctx.issue,
  }));
  const items = ctx.queue.items.filter((i) => !done.includes(i)).map((i) => (mine(i) ? { ...i, issue: null } : i));
  return { queue: { ...ctx.queue, items }, decisions: { ...ctx.decisions, decisions: [...ctx.decisions.decisions, ...decisions] }, moved: done.length };
}

/* ── status comment ─────────────────────────────────────────────────────────────────────────────────────────── */

export const STATUS_MARK = "<!-- review-status -->";

export function statusComment(r: Pick<ApplyResult, "counts" | "conflicts" | "allDecided">, siteUrl: string): string {
  const { published, skipped, waiting } = r.counts;
  const lines = [STATUS_MARK, `**Published ${published} · Skipped ${skipped} · Waiting ${waiting}**`];
  if (r.conflicts.length) lines.push("", `Both boxes are ticked on: ${r.conflicts.map((c) => mdText(candidateTitle(c), 80)).join(", ")}. Untick one.`);
  if (published) lines.push("", `Published listings show on ${siteUrl} a couple of minutes after each change.`);
  if (r.allDecided) lines.push("", "Every listing has a decision, so this review is closed.");
  return lines.join("\n");
}
