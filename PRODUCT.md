# Product

<!-- impeccable:product-schema 1 -->

> Source: the founder's written project brief (November 2026). The Impeccable init interview was not run as a
> separate Q&A because the brief already answered its three core questions in detail; every fact below comes
> from that brief. Items marked **OPEN** are undecided and must not be invented.

## Platform

web

## Stack

Next.js 16 (App Router) + TypeScript + Tailwind CSS v4, Supabase/PostgreSQL for persistence (optional at
first), deployed on Vercel. Lucide icons. ScrollReveal for scroll entrances, Rellax for restrained parallax.
Chosen by the founder in the brief.

## Organization

- **Name:** The Cause Krewe (official, with the pelican emblem in `src/assets/brand/`). Formerly developed under the
  placeholder "The Giving League". All brand strings live in `src/config/site.ts`. Must never be called "Geaux Impact".
- **Serves high school AND college students** throughout Louisiana. Geaux Give Week is the exception: college-only.
- **Social:** Instagram only — https://www.instagram.com/thecausekrewe/
- Founded by an LSU student. Starts in **Baton Rouge**, plans to grow across Louisiana, and to be run from
  **New Orleans** after the founder graduates. A long-term statewide organization, not an LSU club or a
  one-time fundraiser.
- **Legal status:** not yet a federally recognized 501(c)(3). Present it as an *emerging, independent,
  student-led community service initiative*. Never claim tax-exempt status, tax-deductible gifts, or
  confirmed partnerships.

**Description.** We connect Louisiana high school and college students with meaningful opportunities to volunteer,
support charitable causes, and strengthen their communities.

**Mission.** To empower high school and college students across Louisiana to create meaningful change through
accessible volunteer opportunities, community service, charitable giving, and collaboration.

**Vision.** To build Louisiana's leading student-driven service network, connecting young people with the
organizations, resources, and opportunities needed to make a lasting difference.

**Tagline.** Connecting Students. Strengthening Communities.

## Users

1. **High school students** (no account, no listed school required) who need age-appropriate opportunities,
   guardian rules and service-hour options, usually by city. **College students** who start from their campus.
   Both want to volunteer but don't know where to start. Their question:
   *"Where can I volunteer near my school?"* Usually on a phone, between classes, deciding quickly.
2. **Local nonprofits and community organizations** that need volunteers, resources and exposure. They want
   to list an opportunity with little effort and keep their own sign-up systems.
3. **Student leaders** — student government, Greek life, service orgs — evaluating whether to bring the
   initiative to their campus. They judge credibility and how much work it asks of them.
4. **Businesses and community supporters** looking for a credible, local way to support service.
5. **University leadership** (presidents, student affairs) who need to see a serious, honest organization
   before lending their name.

## Product Purpose

Bridge the gap between students who want to help and organizations that need help. Programs:

1. **Find Volunteering** — a statewide directory that points students to *existing* opportunities run by
   established organizations and sends them to the organization's official sign-up page. We do not replace
   anyone's scheduling or volunteer-management system. The most important feature on the site.
2. **Charity Events** — a directory of annual, seasonal and scheduled charitable events hosted by organizations
   across Louisiana (walks, runs, toy drives, cleanups, galas). Dates only when the organizer confirms them;
   annual events stay listed between editions. Separate data model from volunteer opportunities.
3. **Donate** — a directory of trusted charities linking to their own official donation pages, business &
   corporate giving resources, and a verified-only impact counter (never clicks, never estimates).
4. **Geaux Give Week — Coming Soon** — a future annual statewide fundraising competition **exclusively for Louisiana
   colleges and universities**. High schools do not participate. No dates, beneficiary or partners confirmed.

Success: a student finds a real, official way to volunteer near campus in under a minute; nonprofits,
student leaders and businesses can each raise their hand through a clear form; university leaders leave
believing this is a credible, honest, ambitious organization.

## Positioning

Not a campus club and not a volunteer-management platform. A **statewide, cross-campus connector** run by
students: one place that maps service near every Louisiana campus, plus a shared annual moment (Geaux Give
Week) that unites rival schools around one cause.

## Operating Context

- Students arrive on phones; the finder must be fast, filterable, and usable without animation.
- Partners arrive on laptops from an email or a meeting and skim for credibility, then fill a form.
- Directory listings link out to official nonprofit pages; each shows when it was last verified.
- Forms go to a review queue (Supabase when configured). No email service yet.

## Capabilities and Constraints

- Searchable, filterable volunteer directory (keyword, university, city, cause, individual/group,
  one-time/recurring, in-person/remote) with campus prefill from the homepage.
- Distinguish an **ongoing volunteer resource** from a **dated volunteer event**. Never invent open shifts.
- Campus directory with three statuses: Participating, Launching Soon, Not Yet Participating. **Default: no
  campus has joined.** The 13 listed universities are geographic search options and outreach targets only.
- Events page starts in an honest "being planned" state; event concepts are not scheduled events.
- Geaux Give Week leaderboard is a preview only until a real campaign is live. No fabricated totals.
- No donation collection on this site; future donations go through the beneficiary's own platform.
- Forms: contact (with a "Partnership" subject — there is no separate partnership feature), school representative
  (adults only), submit an opportunity, submit a charity event, updates signup.
- Daily review-gated discovery job (GitHub Actions + Python stdlib, $0): link health, cancellation hints, explicit
  age rules, new items from organizations' public feeds — all proposed in a pull request.
- Youth safety: no student accounts, no public student data, no student messaging, forms for adults.
- Strict $0/month operating budget: Vercel Hobby, GitHub Actions on a public repo, free Supabase tier (optional).
  Client + server validation. Persist only when Supabase is configured; never claim otherwise.
- No public admin interface. A secure admin dashboard is planned later.
- **OPEN:** official name, logo, domain, contact email, social accounts, founder name/bio/photo, leadership,
  legal entity, beneficiary charity, Geaux Give Week dates, any partner.

## Brand Commitments

- Voice: warm, plain, optimistic, confident without hype. Students talking to students and to adults who
  will judge their seriousness.
- Required copy from the brief is used verbatim (headlines, CTAs, values, About text).
- "Geaux" is the Louisiana spelling used in the flagship event name.

## Evidence on Hand

- None yet: no events held, no partners, no donations, no testimonials, no leadership roster, no statistics.
- Allowed facts: the founding story (LSU student, Baton Rouge start, New Orleans future), the three programs,
  the planned Spring 2027 timing labeled as tentative, and verified public information about third-party
  nonprofits with links to their own pages.
- Photography is licensed stock/public-domain documentary imagery, credited, and never presented as our own
  members or events.

## Product Principles

1. **Honesty is the brand.** Every claim is true today; anything planned says so.
2. **Get students to the official sign-up fast.** The finder beats the brochure.
3. **Statewide from day one, Baton Rouge first.** Show the ambition without pretending it's done.
4. **Every audience gets a clear door.** Students, nonprofits, campus leaders, and businesses each have one
   obvious next step.
5. **Change is cheap.** Name, contacts, status and data are centralized so they can be updated in minutes.

## Accessibility & Inclusion

WCAG 2.2 AA: contrast, keyboard access, visible focus, semantic structure, reduced-motion support, content
visible without JavaScript. Giving back should be accessible regardless of university, major, finances or
organization membership — the copy must never assume Greek membership, a car, or money.
