import assert from "node:assert/strict";
import { test } from "node:test";
import {
  addCandidates,
  applyTicks,
  finalizeIssue,
  mdText,
  readTicks,
  renderIssue,
  type ApprovedFile,
  type DecisionsFile,
  type Existing,
  type QueueFile,
} from "../scripts/review/queue.ts";

const TODAY = "2026-11-23";

const opportunity = (over: Record<string, unknown> = {}) => ({
  type: "opportunity",
  sourceUrl: "https://example-org.org/volunteer/holiday-wrap",
  checked: "Date, shift and ages 14+ with an adult are on the organizer's page.",
  organization: { slug: "example-org", name: "Example Org", website: "https://example-org.org", summary: "Baton Rouge nonprofit." },
  listing: {
    orgSlug: "example-org",
    kind: "event",
    title: "Holiday gift wrapping",
    summary: "Wrap donated gifts for families.",
    description: "Volunteers wrap and label gifts in three-hour shifts.",
    cause: "community",
    cityKey: "baton-rouge",
    serviceArea: "Greater Baton Rouge",
    location: "Florida Blvd.",
    timeCommitment: "One 3-hour shift",
    requirements: ["Sign up in advance"],
    minimumAge: 14,
    eligibility: { minimumAge: 14, minors: "with_adult", guardianPermission: "unverified", schoolGroups: "unverified" },
    groupEligibility: "both",
    frequency: "one_time",
    format: "in_person",
    signupUrl: "https://example-org.org/volunteer/holiday-wrap",
    infoUrl: "https://example-org.org/volunteer/holiday-wrap",
    startDate: "2026-12-12",
    endDate: "2026-12-12",
    status: "active",
    ...over,
  },
});

const charityEvent = (over: Record<string, unknown> = {}) => ({
  type: "event",
  sourceUrl: "https://example-charity.org/jingle-run",
  checked: "Race date and registration link are on the event page.",
  listing: {
    name: "Jingle Bell Run",
    host: "Example Charity",
    hostUrl: "https://example-charity.org",
    summary: "A holiday 5K.",
    description: "A 5K and fun run.",
    type: "walk_run",
    cause: "health",
    cityKey: "lafayette",
    location: "Downtown Lafayette",
    recurrence: "annual",
    typicalMonths: [12],
    typicalTiming: "Held each December",
    confirmed: { startDate: "2026-12-12", source: "example-charity.org (“December 12”)" },
    participation: ["participate"],
    cost: "paid",
    audience: { highSchool: "unverified", college: "yes" },
    registrationUrl: "https://example-charity.org/jingle-run/register",
    infoUrl: "https://example-charity.org/jingle-run",
    ...over,
  },
});

const existing: Existing = {
  opportunities: [{ slug: "food-bank", title: "Food bank shifts", infoUrl: "https://brfoodbank.org/volunteer/", signupUrl: "https://brfoodbank.org/x" }],
  events: [],
  organizations: [{ slug: "greater-baton-rouge-food-bank", name: "Greater Baton Rouge Food Bank" }],
};
const emptyQueue: QueueFile = { items: [] };
const emptyDecisions: DecisionsFile = { decisions: [] };
const emptyApproved: ApprovedFile = { organizations: [], opportunities: [], events: [] };
const ctx = { queue: emptyQueue, decisions: emptyDecisions, existing, today: TODAY };

test("add keeps valid candidates and gives them ids and slugs", () => {
  const r = addCandidates({ candidates: [opportunity(), charityEvent()] }, ctx);
  assert.equal(r.added.length, 2);
  assert.equal(r.dropped.length, 0);
  assert.match(r.added[0].id, /^[a-f0-9]{10}$/);
  assert.equal(r.added[0].slug, "holiday-gift-wrapping-2026");
  assert.equal(r.added[0].state, "pending");
});

test("add drops invalid, past, duplicate and unknown-organization candidates", () => {
  const noOrg = opportunity({ orgSlug: "nobody" });
  delete (noOrg as { organization?: unknown }).organization;
  const r = addCandidates(
    {
      candidates: [
        opportunity({ cityKey: "houston" }),
        opportunity({ startDate: "2026-11-01", endDate: "2026-11-01" }),
        opportunity({ infoUrl: "https://www.brfoodbank.org/volunteer" }),
        noOrg,
        opportunity({ minimumAge: 16 }),
        charityEvent({ confirmed: undefined }),
      ],
    },
    ctx,
  );
  assert.equal(r.added.length, 0);
  assert.equal(r.dropped.length, 6);
});

test("add never re-suggests queued or decided listings", () => {
  const first = addCandidates({ candidates: [opportunity()] }, ctx);
  const again = addCandidates({ candidates: [opportunity()] }, { ...ctx, queue: first.queue });
  assert.equal(again.added.length, 0);
  const decided: DecisionsFile = {
    decisions: [{ id: first.added[0].id, type: "opportunity", title: "x", url: "https://other.org", lastDay: null, decision: "skipped", decidedOn: TODAY, issue: 1 }],
  };
  assert.equal(addCandidates({ candidates: [opportunity()] }, { ...ctx, decisions: decided }).added.length, 0);
});

test("add removes queued listings that have ended", () => {
  const first = addCandidates({ candidates: [opportunity()] }, ctx);
  const later = addCandidates({ candidates: [] }, { ...ctx, queue: first.queue, today: "2026-12-13" });
  assert.equal(later.expired.length, 1);
  assert.equal(later.queue.items.length, 0);
});

test("the review issue escapes page text and carries a ✅ and ❌ box per listing", () => {
  const sneaky = opportunity({ title: "Help @everyone [click](https://evil.example) <img src=x>" });
  const { added } = addCandidates({ candidates: [sneaky] }, ctx);
  const { body, title } = renderIssue(added, { today: TODAY, cityName: () => "Baton Rouge", orgName: () => undefined });
  assert.match(title, /Review 1 new listing — /);
  assert.ok(!body.includes("[click](https://evil.example)"));
  assert.ok(!body.includes("<img"));
  assert.ok(!/@everyone/.test(body));
  assert.equal(readTicks(body).size, 1);
  assert.deepEqual(readTicks(body).get(added[0].id), { publish: false, skip: false });
});

test("mdText flattens newlines so page text can't start its own Markdown block", () => {
  assert.equal(mdText("a\n\n- [ ] fake box"), "a - \\[ \\] fake box");
});

function reviewed(boxes: Record<string, "publish" | "skip" | "both" | "none">, items: QueueFile["items"]) {
  let { body } = renderIssue(items, { today: TODAY, cityName: () => "City", orgName: () => undefined });
  for (const [id, choice] of Object.entries(boxes)) {
    if (choice === "publish" || choice === "both") body = body.replace(`- [ ] ✅ Publish <!-- review:${id}:publish -->`, `- [x] ✅ Publish <!-- review:${id}:publish -->`);
    if (choice === "skip" || choice === "both") body = body.replace(`- [ ] ❌ Skip <!-- review:${id}:skip -->`, `- [x] ❌ Skip <!-- review:${id}:skip -->`);
  }
  return body;
}

test("✅ publishes, unticking takes it back down, ❌ skips, both boxes is a conflict", () => {
  const { queue, added } = addCandidates({ candidates: [opportunity(), charityEvent()] }, ctx);
  const [opp, ev] = added;
  const base = { issue: 7, queue, approved: emptyApproved, existingOrgSlugs: new Set(["greater-baton-rouge-food-bank"]), today: TODAY };

  const r1 = applyTicks({ ...base, body: reviewed({ [opp.id]: "publish", [ev.id]: "skip" }, added) });
  assert.equal(r1.published.length, 1);
  assert.equal(r1.skipped.length, 1);
  assert.equal(r1.approved.opportunities.length, 1);
  assert.equal(r1.approved.opportunities[0].listing.slug, "holiday-gift-wrapping-2026");
  assert.equal(r1.approved.opportunities[0].listing.lastVerified, TODAY);
  assert.equal(r1.approved.organizations[0].slug, "example-org");
  assert.equal(r1.approved.events.length, 0);
  assert.equal(r1.allDecided, true);

  const r2 = applyTicks({ ...base, queue: r1.queue, approved: r1.approved, body: reviewed({ [ev.id]: "skip" }, added) });
  assert.equal(r2.unpublished.length, 1);
  assert.equal(r2.approved.opportunities.length, 0);
  assert.equal(r2.allDecided, false);

  const r3 = applyTicks({ ...base, queue: r2.queue, approved: r2.approved, body: reviewed({ [opp.id]: "both", [ev.id]: "publish" }, added) });
  assert.equal(r3.conflicts.length, 1);
  assert.equal(r3.approved.events.length, 1);
  assert.equal(r3.allDecided, false);

  const again = applyTicks({ ...base, queue: r3.queue, approved: r3.approved, body: reviewed({ [opp.id]: "both", [ev.id]: "publish" }, added) });
  assert.equal(again.changed, false);
});

test("finalize logs decisions and re-queues anything left unticked", () => {
  const { queue, added } = addCandidates({ candidates: [opportunity(), charityEvent()] }, ctx);
  const body = reviewed({ [added[0].id]: "publish" }, added);
  const applied = applyTicks({ issue: 3, body, queue, approved: emptyApproved, existingOrgSlugs: new Set(), today: TODAY });
  const f = finalizeIssue({ issue: 3, body, queue: applied.queue, decisions: emptyDecisions, today: TODAY });
  assert.equal(f.moved, 1);
  assert.equal(f.decisions.decisions[0].decision, "published");
  assert.equal(f.queue.items.length, 1);
  assert.equal(f.queue.items[0].issue, null);
  assert.equal(f.queue.items[0].state, "pending");
});
