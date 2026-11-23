/**
 * File and command-line side of the review queue (logic lives in queue.ts). Used by the GitHub workflows:
 *
 *   node --experimental-strip-types scripts/review/cli.ts add discovery/.cache/claude-candidates.json
 *   node --experimental-strip-types scripts/review/cli.ts render --out discovery/.cache/issue.md
 *   node --experimental-strip-types scripts/review/cli.ts assign --issue 12
 *   node --experimental-strip-types scripts/review/cli.ts apply --issue 12 --body body.md --status-out status.md --finalize-if-done
 *   node --experimental-strip-types scripts/review/cli.ts finalize --issue 12 --body body.md
 *
 * Each command prints a one-line JSON summary and, inside GitHub Actions, writes the same values to $GITHUB_OUTPUT.
 */
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { cities } from "../../src/data/reference/geography.ts";
import { allCharityEvents } from "../../src/data/verified/charity-events.ts";
import { organizations } from "../../src/data/verified/organizations.ts";
import { verifiedOpportunities } from "../../src/data/verified/opportunities.ts";
import {
  addCandidates,
  applyTicks,
  candidateTitle,
  finalizeIssue,
  louisianaToday,
  renderIssue,
  statusComment,
  type ApprovedFile,
  type DecisionsFile,
  type Existing,
  type QueueFile,
} from "./queue.ts";

const PATHS = {
  queue: "discovery/review/queue.json",
  decisions: "discovery/review/decisions.json",
  approved: "src/data/discovered/approved.json",
};

const readJson = <T>(path: string, fallback: T): T => (existsSync(path) ? (JSON.parse(readFileSync(path, "utf8")) as T) : fallback);
const writeJson = (path: string, value: unknown) => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
};

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
}
const flag = (name: string) => process.argv.includes(`--${name}`);
function requireArg(name: string): string {
  const v = arg(name);
  if (!v) throw new Error(`Missing --${name}`);
  return v;
}

function report(values: Record<string, string | number | boolean>) {
  console.log(JSON.stringify(values));
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, Object.entries(values).map(([k, v]) => `${k}=${v}\n`).join(""));
  }
}

const today = process.env.REVIEW_TODAY ?? louisianaToday();
const queue = readJson<QueueFile>(PATHS.queue, { items: [] });
const decisions = readJson<DecisionsFile>(PATHS.decisions, { decisions: [] });
const approved = readJson<ApprovedFile>(PATHS.approved, { organizations: [], opportunities: [], events: [] });

const existing: Existing = {
  opportunities: verifiedOpportunities,
  events: allCharityEvents,
  organizations,
};
const orgSlugs = new Set(organizations.map((o) => o.slug));

const command = process.argv[2];

switch (command) {
  case "add": {
    const file = process.argv[3];
    if (!file) throw new Error("Usage: add <claude-candidates.json>");
    const raw = existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : { candidates: [] };
    const r = addCandidates(raw, { queue, decisions, existing, today });
    writeJson(PATHS.queue, r.queue);
    for (const d of r.dropped) console.error(`dropped: ${d.title} — ${d.reason}`);
    for (const e of r.expired) console.error(`expired: ${candidateTitle(e)}`);
    const unassigned = r.queue.items.filter((i) => i.state === "pending" && i.issue === null).length;
    report({ added: r.added.length, dropped: r.dropped.length, expired: r.expired.length, unassigned });
    break;
  }

  case "render": {
    const pending = queue.items.filter((i) => i.state === "pending");
    const { title, body } = renderIssue(pending, {
      today,
      cityName: (k) => cities[k as keyof typeof cities]?.name ?? k,
      orgName: (s) => organizations.find((o) => o.slug === s)?.name,
    });
    writeFileSync(requireArg("out"), body);
    const titleOut = arg("title-out");
    if (titleOut) writeFileSync(titleOut, title);
    report({ pending: pending.length, bytes: Buffer.byteLength(body) });
    break;
  }

  case "assign": {
    const issue = Number(requireArg("issue"));
    let assigned = 0;
    const items = queue.items.map((i) => (i.state === "pending" && i.issue === null ? (assigned++, { ...i, issue }) : i));
    writeJson(PATHS.queue, { ...queue, items });
    report({ assigned });
    break;
  }

  case "apply": {
    const issue = Number(requireArg("issue"));
    const body = readFileSync(requireArg("body"), "utf8");
    const r = applyTicks({ issue, body, queue, approved, existingOrgSlugs: orgSlugs, today });
    let nextQueue = r.queue;
    let nextDecisions = decisions;
    if (flag("finalize-if-done") && r.allDecided) {
      const f = finalizeIssue({ issue, body, queue: r.queue, decisions, today });
      nextQueue = f.queue;
      nextDecisions = f.decisions;
    }
    writeJson(PATHS.queue, nextQueue);
    writeJson(PATHS.approved, r.approved);
    writeJson(PATHS.decisions, nextDecisions);
    const statusOut = arg("status-out");
    if (statusOut) writeFileSync(statusOut, statusComment(r, process.env.SITE_URL ?? "https://thecausekrewe.vercel.app"));
    const titles = (xs: typeof r.published) => xs.map((x) => candidateTitle(x)).join("; ").replace(/[\r\n=]/g, " ");
    report({
      changed: r.changed,
      all_decided: r.allDecided,
      published: r.published.length,
      unpublished: r.unpublished.length,
      skipped: r.skipped.length,
      conflicts: r.conflicts.length,
      published_titles: titles(r.published),
    });
    break;
  }

  case "finalize": {
    const issue = Number(requireArg("issue"));
    const body = readFileSync(requireArg("body"), "utf8");
    const f = finalizeIssue({ issue, body, queue, decisions, today });
    writeJson(PATHS.queue, f.queue);
    writeJson(PATHS.decisions, f.decisions);
    report({ moved: f.moved });
    break;
  }

  default:
    console.error("Commands: add | render | assign | apply | finalize");
    process.exit(2);
}
