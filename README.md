# The Cause Krewe

Website for **The Cause Krewe**, a student-led Louisiana service initiative connecting **high school and college
students** with volunteer opportunities, charity events and trusted charities — plus **Geaux Give Week**, a future
statewide fundraising competition for Louisiana colleges and universities (coming soon, college-only).

Live: https://thecausekrewe.vercel.app · Instagram: [@thecausekrewe](https://www.instagram.com/thecausekrewe/)

- Product truth: [`PRODUCT.md`](PRODUCT.md) · Design system: [`DESIGN.md`](DESIGN.md)
- Brand strings, contacts, legal status: [`src/config/site.ts`](src/config/site.ts) · Emblem: `src/assets/brand/`
- **Operating budget: $0/month** — Vercel Hobby, GitHub Actions (free on public repos), optional Supabase free tier.
  The morning listings search runs Claude through the owner's existing Claude Pro/Max plan, not a paid API key.
- **Visitor stats:** Vercel Web Analytics (`<Analytics />` in `src/app/layout.tsx`): cookieless, 50,000 events/month free on Hobby —
  collection pauses (no charge) if the limit is reached. View it in the Vercel dashboard → project → Analytics.

## Pages

| Route | What it is |
|---|---|
| `/` | Hero, scroll story (mission, volunteering, charity events, giving), browse by school or city, Geaux Give Week (coming soon), get involved |
| `/volunteer` · `/volunteer/[slug]` · `/volunteer/submit` | Volunteer Finder (keyword, school, city & area, student level, age, guardian rules, cause, groups, commitment, remote), listing pages, nonprofit submission form |
| `/events` · `/events/[slug]` · `/events/submit` | Charity Events directory (city, region, month, cause, type, high school/college, cost, upcoming vs. awaiting next date), event pages, submission form |
| `/campuses` · `/campuses/[slug]` | College Campuses directory and campus pages |
| `/high-schools` · `/high-schools/[city]` | High Schools: city areas (incl. surrounding communities), high school finder, teen-eligible events, age guide and school involvement form; each city page lists what's allowed, what to check first, and nearby events |
| `/donations` | Impact counter (verified only), charity directory, Business & Corporate Giving, tax-benefit information |
| `/geaux-give-week` | Coming-soon page with a university-only interest form |
| `/about` · `/contact` · `/privacy` · `/terms` · `/credits` | About, contact (subjects include "Partnership"), legal (needs legal review), photo credits |

`/partners` redirects to `/contact?topic=partnership`; there is no separate partnership feature.

## Run locally

Requires Node.js 22+ (and Python 3.10+ only for the discovery job).

```bash
npm install
```

```bash
npm run dev
```

```bash
npm test
```

```bash
npm run lint && npm run typecheck && npm run build
```

Test on an iPhone: boot an iOS Simulator and open `http://localhost:3000` in Safari, using `npm run build && npm start`
for interaction testing (Safari in the simulator can be unreliable with the dev server's hot reload).

## Data

| Where | What |
|---|---|
| `src/data/verified/opportunities.ts` | Volunteer listings (verified by hand; youth eligibility only as published) |
| `src/data/verified/charity-events.ts` | Charity events (separate model; confirmed dates only from official sites) |
| `src/data/verified/charities.ts` | Donation directory + optional corporate-giving fields |
| `src/data/reference/geography.ts` · `locations.ts` | Cities, regions, universities, and the **shared service-area config** for College Campuses and High Schools |
| `src/data/programs/fundraising.ts` | Verified fundraising campaigns/reports (empty until a charity provides attributable reporting) |
| `src/data/discovery/report.json` | Latest reviewed discovery report (merged via PR) |
| `src/data/discovered/approved.json` | Listings approved with a ✅ on a morning review issue (written by `scripts/review/cli.ts`; merged into the verified lists above) |

**Adding a college city** to `universities` automatically creates its high school area and `/high-schools/<city>` page.

**Youth eligibility is never assumed.** Labels: "Ages 14+/16+/18+", "Parent/guardian permission required",
"Eligibility not verified — check with organizer". 18+ listings never appear in high school results; events are
called high-school-eligible only when the organizer's published policy supports it.

## Daily discovery (review-gated)

`.github/workflows/daily-discovery.yml` runs every morning (and on demand from the Actions tab):

1. Exports the verified data (`scripts/export-snapshot.ts`).
2. `discovery/run.py` (Python standard library only, robots.txt respected, polite rate limits):
   - re-checks every listing's official page — broken links, cancellation/closure wording, age rules that differ from ours;
   - reads the organizations' own public feeds in `discovery/sources.json` (CRCL iCal; HandsOn New Orleans and
     St. Vincent de Paul Baton Rouge need feeds; KLB, Greater Baton Rouge Food Bank and Second Harvest news feeds),
     associates new items with cities via the shared location config, extracts age rules only when explicitly stated,
     and skips anything already over.
3. Opens a pull request with `discovery/REPORT.md` and `src/data/discovery/report.json`. **Nothing goes live until you merge it.**
   After merging, listings whose link failed two days running are hidden from every directory and city page; new
   items are published by adding them to the verified data files with their confirmed age rules.

One-time GitHub setting for the PR step: **Settings → Actions → General → Workflow permissions → "Allow GitHub Actions
to create and approve pull requests."** Without it, the job opens an issue linking to the findings branch instead.
This feed job uses no paid APIs and no AI.

## Morning listings (Claude search, ✅ / ❌ review)

`.github/workflows/morning-listings.yml` runs once a day (and on demand from the Actions tab):

1. Exports the site's listings and reads the organizations' feeds above for leads.
2. **Claude searches the web** for new Louisiana volunteer opportunities and charity events, following
   [`discovery/claude/INSTRUCTIONS.md`](discovery/claude/INSTRUCTIONS.md): facts only from the organizer's own page,
   age rules never guessed, nothing already listed, queued or decided. It can only read, search and write one file:
   no shell, no git.
3. `scripts/review/cli.ts add` checks every find against `scripts/review/schema.ts`, drops duplicates and anything
   already over, and adds the rest to `discovery/review/queue.json`.
4. A GitHub issue labelled `listing-review` and assigned to you lists each find with **✅ Publish** and **❌ Skip**
   boxes. Yesterday's issue is replaced; anything you hadn't ticked carries over.

`.github/workflows/publish-reviewed.yml` runs when you tick a box (about 30 seconds later, so quick ticks are batched):
✅ adds the listing to `src/data/discovered/approved.json` and commits to `main`, which Vercel deploys; ❌ records it so
it's never suggested again; unticking ✅ takes a listing back down while the issue is open. The issue closes itself
when every listing has a ✅ or ❌. Only the repository owner's ticks count. Open the official page before you tick ✅:
that check is what makes a listing "verified" on the site.

**How it runs on your Claude plan:** Claude runs through
[Claude Code's GitHub Action](https://github.com/anthropics/claude-code-action) with a Claude Code sign-in token, so it
uses your Pro/Max plan's usage instead of billed API credits. One-time setup on this computer:

```bash
claude setup-token
```

```bash
gh secret set CLAUDE_CODE_OAUTH_TOKEN --repo Gavin-Morris-04/giving-league-website
```

The first command opens a browser to sign in and prints a token; paste it when the second command asks. If a
morning run ever fails with an authentication error, run both commands again. The model is set
in `claude_args` in the workflow (`--model claude-sonnet-5-5`, chosen to use less of the plan than Opus).

**Timing:** the job is scheduled for 10:23 PM Louisiana time because GitHub starts this repository's scheduled runs
6–10 hours late; the review issue is there by morning either way.

`vercel.json` skips Vercel builds for commits that only touch `discovery/` or `.github/` (the review queue), so only
published listings trigger a deploy.

## Donations & verified fundraising

We never process donations. Every Donate button opens the charity's own page (Team Gleason uses its exact Neon CRM
form). The impact counter shows **"Donation Tracking Coming Soon"** until a verified total exists — never $0, never clicks.

- **Method A — charity fundraising campaigns (preferred):** when a charity creates a dedicated page for us, add it to
  `fundraising_campaigns` (URL + the charity's campaign id) and record its confirmed cumulative totals.
- **Method B — approved integrations:** implement `FundraisingProvider` in `src/lib/fundraising/providers.ts` only with
  access the charity grants (no scraping). St. Jude and Make-A-Wish slots exist but are disabled — we don't assume APIs.
- **Method C — verified manual reporting:** staff record totals from official reports via `record_fundraising_report()`
  (append-only history; corrections supersede; voided rows ignored; nested campaigns aren't double-counted).
  The math lives in `src/lib/fundraising/totals.ts` and is unit-tested.
- Outbound link clicks are counted anonymously (no cookies/IPs; Do Not Track/GPC honored) in `link_metrics` — internal only, never shown as donations.

## Forms & Supabase (optional, free tier)

All forms post to one server action (`src/app/actions/forms.ts`) with the same zod schemas on client and server.
Without Supabase they validate and show "Submissions aren't switched on yet — nothing was saved."

1. Create a Supabase project; run `supabase/migrations/0001_init.sql` then `0002_students_events_donations.sql`.
2. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (server-only) in `.env.local` and Vercel.

RLS is on for every table; the public can read published data only. School-involvement forms are for adults; no
student accounts, student profiles or student messaging exist.

## Deploy (Vercel, free)

Already deployed. To redeploy from this machine:

```bash
npx vercel deploy --prod
```

For automatic deploys on every push, give the Vercel GitHub App access to this repository
(GitHub → Settings → Applications → Vercel → Configure → add `giving-league-website`), then run `npx vercel git connect`.

## Licensing

ScrollReveal is GPL-3.0 (or commercial); Rellax is MIT. Publish this site's source under a GPL-compatible license or
buy a ScrollReveal commercial license; ScrollReveal is isolated in `src/components/motion/MotionLayer.tsx`.
Photos: Unsplash License (credits at `/credits`).

## Design tools

VoltAgent awesome-design-md (reference study), Taste Skill and Impeccable are installed locally for Claude Code but
not committed. Reinstall:

```bash
npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"
```

```bash
npx impeccable install --providers=claude --project
```

## Needs your approval, credentials, or information

- [ ] Supabase project + keys (forms validate but don't save yet)
- [ ] GitHub setting allowing Actions to open PRs (discovery) and Vercel GitHub App access (auto-deploys)
- [x] Contact email: thecausekrewe@gmail.com (`site.contact.email`)
- [ ] An email provider for automatic confirmations (optional; replies can come from the Gmail inbox)
- [ ] Legal review of `/privacy` and `/terms` (incl. COPPA/teen privacy before any youth registration feature); entity and 501(c)(3) status
- [ ] Any charity's dedicated fundraising campaign + reporting access (required before a donation total can appear)
- [ ] Geaux Give Week beneficiary, dates and rules
- [ ] Custom domain; ScrollReveal license decision
- [ ] Review the discovery pull requests as they arrive
- [ ] `CLAUDE_CODE_OAUTH_TOKEN` secret for the morning listings search (`claude setup-token`, see above)
