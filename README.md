# The Giving League (working name)

Website for an emerging, student-led Louisiana community service initiative: a verified volunteer
directory, year-round community events, and **Geaux Give Week**, a statewide college fundraising challenge
in development for Spring 2027.

> **"The Giving League" is a placeholder.** Every brand string lives in [`src/config/site.ts`](src/config/site.ts).
> Change it there and the header, footer, metadata, Open Graph image and legal pages all update.

- Product truth: [`PRODUCT.md`](PRODUCT.md) · Design system: [`DESIGN.md`](DESIGN.md)

---

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack, Cache Components, Partial Prefetching) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 (CSS-first tokens in `src/app/globals.css`) |
| Fonts | Bricolage Grotesque (display), Figtree (body), Big Shoulders (Geaux Give Week), via `next/font` |
| Icons | lucide-react |
| Motion | Custom scroll story (homepage), ScrollReveal 4, Rellax 1.12 |
| Forms | Server Actions + zod (same schema on client and server) |
| Data | Static verified data in `src/data`; Supabase/PostgreSQL schema ready in `supabase/` |
| Hosting | Vercel |

## Run locally

Requires Node.js 22+.

```bash
npm install
```

```bash
cp .env.example .env.local
```

```bash
npm run dev
```

Open http://localhost:3000. Other scripts:

```bash
npm run build && npm start
```

```bash
npm run lint
```

```bash
npx tsc --noEmit
```

### Test on an iPhone

- **Simulator (Mac with Xcode):** boot an iPhone simulator and open `http://localhost:3000` in its Safari.
  Use the production build (`npm run build && npm start`) for interaction testing; Safari in the
  simulator can be flaky with the dev server's hot reload.
- **Real phone on the same Wi-Fi:** run `npm run dev -- -H 0.0.0.0`, then open `http://<your-mac's-LAN-IP>:3000`.
  Next.js may ask you to add that address to `allowedDevOrigins` in `next.config.ts`.

## Project structure

```
src/
  app/                    Routes (App Router)
    page.tsx              Homepage (hero, scroll story, campus picker, featured listings, GGW, paths, CTA)
    volunteer/            Finder, listing detail pages ([slug]), submit form
    events/               Events (list/calendar, concepts) and event detail pages ([slug])
    campuses/             Campus directory and campus pages ([slug])
    geaux-give-week/      Flagship landing page with leaderboard preview, FAQ, interest forms
    partners/  about/  contact/  privacy/  terms/  credits/
    actions/forms.ts      The one server action behind every form
    sitemap.ts robots.ts opengraph-image.tsx icon.svg apple-icon.png error.tsx not-found.tsx
  components/
    layout/               Header (mobile menu), footer, page hero, legal page shell
    ui/                   Button, badges, photo, section heading, primitives
    home/                 Scroll story, campus picker
    directory/            Opportunity finder + card
    events/  campuses/  ggw/  about/  forms/  motion/
  config/                 site.ts (brand, legal status, contacts), navigation.ts
  data/
    verified/             VERIFIED LIVE DATA — organizations + opportunities (checked by hand)
    reference/            Universities, cities, causes
    programs/             Event concepts, Geaux Give Week campaign record + FAQ
    photos.ts             Licensed photography registry with credits
  lib/                    types.ts, directory.ts (filtering/sorting), validation.ts, supabase/server.ts
  assets/photos/          Optimized via next/image (blur placeholders)
supabase/
  migrations/0001_init.sql   Schema + Row Level Security
  seed.sql                   EXAMPLE rows only (provenance = 'example', never shown publicly)
```

### Seeded example data vs. verified live data

- `src/data/verified/*` holds the only listings the site displays. Every one carries `provenance: "verified"`
  and a `lastVerified` date. The directory filters out anything else.
- `supabase/seed.sql` contains obviously fake example rows for local database testing. The public RLS policy
  only exposes `provenance = 'verified'`, so they can never appear on the site.

### Adding or updating a volunteer listing

1. Open the organization's official volunteer page and confirm the sign-up link works.
2. Add or edit an entry in `src/data/verified/opportunities.ts`, copying only facts stated on that page.
   Use `kind: "event"` with `startDate`/`endDate` only for a dated event the organization announced.
3. Set `lastVerified` to today. `nearbyCampuses` is computed automatically (campuses within ~55 miles;
   statewide listings are near every campus).

### Changing campus status

`src/data/reference/geography.ts` → set a university's `status` to `"launching"` or `"participating"`
**only after a written agreement** with a recognized campus organization. Add `studentContact` only with
that person's consent.

### Publishing the founder profile

`src/config/site.ts` → `founder`: fill in `name` and `bio`, put a photo in `public/team/`, set
`photo: "/team/<file>.jpg"`, then set `published: true`.

## Forms & Supabase

Five forms (contact, campus representative / Geaux Give Week interest, submit an opportunity, partnership
inquiry, updates signup) all post to `submitForm` in `src/app/actions/forms.ts`:

1. Client-side validation with the zod schema in `src/lib/validation.ts` (instant, accessible errors).
2. Server-side validation with the same schema (authoritative), plus a hidden honeypot field.
3. **If Supabase isn't configured:** the visitor sees "Submissions aren't switched on yet — nothing was saved."
   The site never claims to have saved anything it didn't save.
4. **If Supabase is configured:** the row is inserted with the server-only service-role key.

### Set up Supabase

1. Create a project at supabase.com.
2. In the SQL editor, run `supabase/migrations/0001_init.sql` (or `supabase db push` with the CLI).
3. Optionally run `supabase/seed.sql` in a **local/dev** project only.
4. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` and in Vercel.
   The service-role key bypasses RLS. Never expose it (no `NEXT_PUBLIC_` prefix); `server-only` guards the import.

**Security model:** RLS is enabled on every table. Anonymous visitors can read published directory data
only and cannot write anything directly. All writes go through the validated server action. Staff access
for a future admin dashboard is modeled with `public.staff` + `public.is_staff()`.

### Planned admin dashboard (not built, by design)

No admin UI is exposed publicly. When it's built it should live behind Supabase Auth (magic link or SSO),
check `is_staff()` on every request, and cover: add/edit listings, approve submitted listings
(`submitted_opportunities.status`), mark verification (`last_verified`, `verified_by`), update campus status,
manage events, review inquiries, and expire past events (`expire_past_events()` via a daily scheduled job).

### Email

No email service is connected. When one is chosen (for example Resend or Postmark), send confirmations from
the server action after a successful insert, and add an unsubscribe link to every announcement.

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. In Vercel: **Add New → Project**, import the repository (framework auto-detected as Next.js).
3. Add environment variables: `NEXT_PUBLIC_SITE_URL` (for example `https://your-domain.org`) and, when ready,
   `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
4. Deploy. Add your custom domain under **Settings → Domains**, then update `NEXT_PUBLIC_SITE_URL`.

Or from the terminal:

```bash
npx vercel
```

## Design resources used

| Resource | How it was used |
|---|---|
| **VoltAgent awesome-design-md** | Studied the Starbucks, Airbnb, Wise and Wired DESIGN.md files; their disciplines (tiered greens, gold reserved for ceremony, search-led layout, editorial pacing) shaped our original `DESIGN.md`. Cloned for reference only, not shipped. |
| **Taste Skill** (`design-taste-frontend`) | Dealt the type pairing (Bricolage Grotesque / Figtree), set copy and photography rules, and its headless-Chrome scripts (`shoot.mjs`, `consistency.mjs`) were used for screenshots and layout checks at 1440/768/390. |
| **Impeccable** | `context` + PRODUCT.md init, direction roll (`concept-seed`), surface brief, craft-floor rules (no eyebrows except where the brief requires them, contrast, states), and `detect` for anti-patterns. |
| **ScrollReveal 4.0.9** | Section and card entrances (`data-reveal`, `data-reveal-group`), loaded dynamically, destroyed on unmount. |
| **Rellax 1.12.1** | Restrained parallax on the hero, editorial plates and closing band; off under 768px and for reduced motion. |

The design skills are third-party tools and are not committed to this repository (`.agents/`, `.claude/` and
`.impeccable/` are git-ignored). To reinstall them for Claude Code:

```bash
npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"
```

```bash
npx impeccable install --providers=claude --project
```

### Licensing note: ScrollReveal is GPL-3.0

ScrollReveal is dual-licensed: GPL-3.0 for open-source projects, or a paid commercial license. Before
launch, either (a) publish this site's source under a GPL-compatible license, or (b) buy a ScrollReveal
commercial license. All ScrollReveal usage is isolated in `src/components/motion/MotionLayer.tsx`, so it can
be swapped for an IntersectionObserver implementation in about an hour if needed. Rellax is MIT.

Photographs are from Unsplash under the Unsplash License; credits are on `/credits`.

## Needs your approval, credentials, or real information

- [ ] Official organization name, logo and domain (`src/config/site.ts`, `NEXT_PUBLIC_SITE_URL`)
- [ ] Contact email and social accounts (`site.contact`, `site.social`; the UI hides them while `null`)
- [ ] Supabase project + keys (forms currently validate but do not save)
- [ ] Email provider for confirmations/announcements
- [ ] Founder name, bio and approved photo
- [ ] Legal review of `/privacy` and `/terms` (sections marked [Legal review]); entity formation and 501(c)(3) status (`site.isTaxExempt`, `site.legalStatus`)
- [ ] Geaux Give Week beneficiary (written approval), dates and rules
- [ ] Any campus status change or partner listing (requires written agreement)
- [ ] ScrollReveal license decision (see above)
- [ ] Re-verify directory listings periodically (every listing shows its `lastVerified` date)
