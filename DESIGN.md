---
version: 1
name: The Line — design system for The Cause Krewe
description: >-
  A statewide route-map identity for a student-led Louisiana service network, dressed in the colors of the
  official Cause Krewe pelican emblem. Deep teal owns whole regions of the page, cream carries the reading, and
  antique gold marks the line, the emblem's ring and the flagship moment (Geaux Give Week). A warm grotesk display face with a wide optical range sets headlines;
  a quiet humanist sans does the work. Photography is documentary, credited, and never passed off as ours.

colors:                     # from the official pelican emblem (token names kept from v1 for code stability)
  ink: "#0E2A2C"            # body text on light grounds (13.7:1 on cream)
  ink-muted: "#46605F"      # secondary text (6.1:1 on cream, 5.5:1 on sand)
  ivory: "#FAF3E4"          # cream page ground
  sand: "#F2E6CC"           # alternate section ground
  paper: "#FFFDF8"          # cards, inputs, menus
  hairline: "#E3D6BB"
  hairline-strong: "#C4B391"
  navy: "#0B3033"           # DEEP TEAL — the emblem field: hero scrims, dark bands, footer, mobile menu
  navy-deep: "#07252A"      # deepest teal (Geaux Give Week, impact counter)
  navy-muted: "#A9C2BF"     # secondary text on teal (7.5:1)
  forest: "#155C5C"         # ACTION TEAL — primary buttons, links (7.0:1 on cream; white on it 7.7:1)
  forest-deep: "#0B3033"    # hover/press
  forest-tint: "#DCEAE5"
  gold: "#D9A043"           # ANTIQUE GOLD — emblem ring and beak: accents, buttons on dark, focus on dark (6.1:1 on teal)
  gold-bright: "#E6B25E"
  gold-ink: "#7A5414"       # gold-family text on cream (6.1:1)
  gold-tint: "#F6E7C8"
  error: "#A3321F"
  emblem-cream: "#FBE9CB"   # lettering in the emblem; used in the OG image

typography:
  display:
    fontFamily: "Bricolage Grotesque", ui-sans-serif, system-ui, sans-serif
    weights: [500, 600, 700]
    axes: { opsz: "12–96", wdth: "75–100" }
    tracking: "-0.035em at hero size, -0.02em at h3"
  body:
    fontFamily: Figtree, ui-sans-serif, system-ui, sans-serif
    weights: [400, 500, 600, 700]
  event:
    fontFamily: "Big Shoulders", ui-sans-serif  # Google Fonts family (formerly "Big Shoulders Display")
    weights: [700, 800, 900]
    use: Geaux Give Week only — scoreboard numerals, status plates, the event wordmark
  scale:            # fluid, clamp(min, preferred, max)
    display-xl: "clamp(2.75rem, 1.6rem + 5.2vw, 6rem) / 0.95"
    display-lg: "clamp(2.25rem, 1.5rem + 3.4vw, 4.25rem) / 1.0"
    h2: "clamp(1.875rem, 1.35rem + 2.2vw, 3.25rem) / 1.05"
    h3: "clamp(1.25rem, 1.1rem + 0.6vw, 1.625rem) / 1.2"
    lead: "clamp(1.125rem, 1.05rem + 0.35vw, 1.375rem) / 1.5"
    body: "1.0625rem / 1.6"
    small: "0.875rem / 1.45"
    label: "0.75rem / 1.2, 600, +0.08em, uppercase"

spacing: { base: 4px, scale: [4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128, 160] }
radius: { none: 0, sm: 4px, md: 8px, pill: 999px }
container: { max: 1280px, reading: 68ch, gutter: "20px → 32px (md) → 48px (lg)" }
breakpoints: { sm: 640px, md: 768px, lg: 1024px, xl: 1280px }
motion:
  ease-out: "cubic-bezier(0.16, 1, 0.3, 1)"
  duration: { micro: 160ms, ui: 240ms, reveal: 700ms }
---

# The Line

## 1. Where this came from

Reference study (VoltAgent `awesome-design-md`), with what we kept and what we refused:

| Reference | Kept (the discipline) | Refused (the clothes) |
|---|---|---|
| **Starbucks** | Tiered greens with distinct jobs; gold reserved for one ceremonial program; colour-block page rhythm (light body bookended by a dark band and dark footer). | Full-pill buttons, the floating circular CTA, the café cream canvas as a default. |
| **Airbnb** | Search is the product — the finder leads with a working control; photography carries warmth; restrained type weights. | Rausch red, heavy rounding, marketplace card grids as page structure. |
| **Wise** | A working tool in the first screens (their converter → our campus picker). Plain, confident copy. | Lime/green fintech palette, oversized display weight. |
| **Wired** | Editorial pacing: big headline, strict column, image as a full-width plate, metadata in small tracked caps. | Black-and-white severity, serif display. |

The identity itself is original. Impeccable's direction roll for this surface assigned a carnival
parade-route world; its literal imagery (beads, krewe emblems, a party register) was declined because it
undercuts credibility with university leadership and is not statewide or year-round. Its **route grammar**
was kept — the page as a route with stops, the medallion as a campus token — and fused with a transit-map
reading of "connecting students." From the declined star-atlas challenger we took one discipline: **dot
size carries hierarchy** (map dots scale with the number of verified listings near each campus) and an
**index of named objects** sits beside the map.

## 2. Colour

**Brand source:** the official pelican emblem (`src/assets/brand/cause-krewe-emblem.png`, cleaned copy of the
founder's file — a stray gray smudge left of the wing was removed). Teal, antique gold and cream are sampled from it.
Token names (`navy`, `forest`, `ivory`) are kept from v1 so components didn't need renaming; their VALUES are the
brand colors listed above.

Strategy: **Committed.** Deep teal owns whole regions (hero scrim, flagship band, closing band, footer)
rather than appearing as scattered accents. Ivory carries reading. Gold is ceremonial.

| Token | Hex | Job | Never |
|---|---|---|---|
| `ink` | #182628 | All text on light grounds | — |
| `ink-muted` | #4A5857 | Secondary text, metadata | On navy (use `navy-muted`) |
| `ivory` | #F8F6F0 | Page ground | Card fill (use `paper`) |
| `sand` | #EFEBE1 | Alternate section ground, filter rail | — |
| `paper` | #FFFFFF | Cards, inputs, menus | Page ground |
| `navy` | #122A3A | Hero scrim, flagship band, footer, mobile menu | Body copy on ivory |
| `forest` | #24584C | Primary buttons, links, selected state | Large decorative fields next to navy |
| `gold` | #D5A653 | The line, station dots, flagship accents, focus ring on dark | Text on light grounds (use `gold-ink`) |
| `error` | #A3321F | Field errors with icon + text | Decoration |

All text pairings meet WCAG 2.2 AA (see values in the front matter). Colour is never the only signal:
status badges carry a word, errors carry an icon and message, selected chips carry a check.

## 3. Typography

- **Display — Bricolage Grotesque** (variable `opsz`, `wdth`, `wght`). Headlines at 600, tracked tight, set
  in sentence case exactly as written in the brief. Large sizes use the high optical size; the slightly
  condensed width (`wdth 92`) gives headlines a sign-painted, Southern-storefront warmth without nostalgia.
- **Body — Figtree.** 17px base, 1.6 leading, 68ch measure. Buttons and labels at 600.
- **Event — Big Shoulders.** Only inside Geaux Give Week surfaces: the event wordmark, the status
  plate, the scoreboard. It reads as stadium signage and gives the flagship its louder voice.
- **Labels** — 12px, 600, uppercase, +0.08em. Used for metadata (city, cause, verification) and for the
  eyebrows the brief specifies. Eyebrows appear **only** where the copy deck names one.
- Numerals in tables, counts and dates use `font-variant-numeric: tabular-nums`.
- Headings use `text-wrap: balance`; paragraphs use `text-wrap: pretty`.

Hierarchy: one `h1` per page; `h2` opens every section; `h3` for cards and sub-blocks.

## 4. The signature: the line

A 2px route line with station dots. It is structure, not ornament:

- **Scroll-story progress line** — on the homepage, a gold line under the pinned story draws with scroll
  progress and lights four stops: Discover → Volunteer → Serve → Give.
- **Campus map** — a schematic Louisiana outline with 13 campus stations plotted from real coordinates;
  station size reflects verified listings nearby. Paired with an index list (keyboard and screen-reader path).
- **Steps** — Geaux Give Week's three steps sit on one line (the sequence carries meaning, so numbers are allowed).
- **Section joins** — a short vertical segment with a dot at a section's top-left marks a new stop on long pages.

On light grounds the line is `forest`; on dark grounds it is `gold`.

## 5. Components

### Buttons
| Variant | Default | Hover | Active | Focus | Disabled |
|---|---|---|---|---|---|
| Primary | `forest` fill, white text, 4px radius, 48px tall | `forest-deep`, arrow nudges 2px | translateY(1px) | 3px `gold` ring offset 2px (dark) / `forest` ring (light) | 45% opacity, no pointer |
| Secondary | 1.5px `ink` border, transparent | `ink` fill, ivory text | translateY(1px) | as above | as above |
| On-dark primary | `gold` fill, `navy` text | lighter gold `#E3BC73` | translateY(1px) | ivory ring | — |
| On-dark secondary | 1.5px ivory/60% border, ivory text | ivory fill, navy text | — | gold ring | — |
| Text link | `forest`, underline offset 0.2em, 1px | underline thickens to 2px | — | ring | — |

External links carry an `ArrowUpRight` icon and visually hidden "(opens in a new tab)".

### Cards
One card family: `paper` fill, 1px `hairline` border, 8px radius, no shadow at rest; linked cards lift 2px
and gain a soft shadow (`0 10px 30px -12px rgb(18 42 58 / 0.25)`) on hover. Cards never nest.
Opportunity cards lead with the organization, then the title, then a metadata row (city · cause · type),
then a two-line description and the verification line. Two actions: **Details** and **Volunteer ↗**.

### Status badges
Small label type in a bordered 4px-radius plate with a leading dot:
- `Participating` — forest dot · `Launching soon` — gold dot · `Not yet participating` — hollow ink dot.
- Directory types: `Ongoing resource` (forest) vs `Dated event` (gold, with the date in the badge).
- `Concept — not yet scheduled` for event series. `In development — Spring 2027` for Geaux Give Week.

### Forms
Labels above fields (never placeholder-only), 48px fields, 1px `hairline-strong` border on `paper`,
4px radius. Focus: 2px `forest` border + ring. Errors: `error` border, icon, message below, and an error
summary at the top on submit. Required marked with "Required" text, not only an asterisk. Success and
not-configured states are full panels that replace the form and say exactly what happened.

### Navigation
Sticky header (cream with a hairline once scrolled; transparent over the home and Geaux Give Week heroes) with
the emblem + wordmark. Order: Home · Find Volunteering · Charity Events · College Campuses · High Schools ·
Donate · Geaux Give Week (Coming Soon) · About Us · **Contact** (button). Desktop (≥1280px) shows the first six
inline and groups Geaux Give Week and About Us under "More". Below 1280px a "Menu" button opens a full-screen
teal sheet with every item, focus trapped, Escape to close. It is a sibling of the header (iOS fixed-position bug).

### Footer
Teal. Emblem + mission, updates signup, four link columns (Programs, Students, Organization, Legal), Instagram
(@thecausekrewe, the only social account), the one photo-credit line, and the legal-status note.

## 6. Layout

- Container 1280px max; gutters 20 / 32 / 48px. 12-column grid at ≥1024px, 6 at tablet, 4 on phones.
- Section padding `clamp(4rem, 8vw, 8.5rem)` vertically. More space above a heading than below it.
- One idea per section; sections are one or two screens tall at 1440×900.
- Editorial pairings: image spans 7 columns, text 5 (or reversed); the image bleeds to the viewport edge
  on one side only when the text column keeps the container line on the other.
- Reading measure 68ch for body text.

## 7. Spacing

4px base. Components use 8/12/16/24; layout uses 32/48/64/96/128. Tight groups (label → field = 8px,
heading → lead = 16–20px), generous separation between groups (48px+).

## 8. Imagery

- Documentary, candid, daylight. People doing the work: sorting food, cleaning parks and shorelines,
  gardening, reading with kids. **No construction-site imagery** (hard hats, framing) — the founder found it
  read as "construction" rather than community. Louisiana places: the Baton Rouge riverfront and bridge, cypress swamp, live oaks, New Orleans
  streets and streetcar.
- Licensed (Unsplash License), credited on `/credits` with one footer line. **No captions claim a photo shows
  our members or events.** Photos with another organization's logo in focus are avoided.
- Treatment: no filters, no duotone. Dark scrims are gradients of `navy` at 0–85% for text legibility.
  Images are optimized with `next/image`, blurred placeholders, and explicit `sizes`.
- No stock handshakes, no posed corporate teams, no illustrated "diverse people" clip art.

## 9. Responsive behaviour

- Phones (<640px): one column, buttons full width, filter rail collapses into a "Filters" disclosure with
  a live result count, map becomes the index list with a compact map above.
- Tablet (640–1023px): two-column card grids, editorial pairs stack text-first.
- Desktop (≥1024px): filter rail beside results; editorial 7/5 splits; full map with index.
- Touch targets ≥44px. No horizontal scroll at 320px (all routes verified at 375px).

### iPhone (Safari) rules — tested in the iOS Simulator (iPhone 16)
- `viewport-fit=cover` with `env(safe-area-inset-*)` padding on the container, mobile menu and footer, so
  nothing sits under the notch, Dynamic Island or home indicator.
- Form fields are never smaller than 16px (`font-size: max(16px, 1em)`), so Safari does not zoom on focus.
- The mobile menu is a sibling of the header (a `backdrop-filter` parent would clip a fixed child on iOS);
  scroll lock is applied to both `<html>` and `<body>`.
- Pinned sections size themselves from `window.innerHeight`, which tracks Safari's collapsing toolbar.
- `svh`/`dvh` units instead of `vh`; parallax is disabled under 768px; the header CTA hides below 640px.
- Apple touch icon (`app/apple-icon.png`) and `theme-color` navy for the status bar.

## 10. Motion & accessibility

- **Scroll story (homepage)** — the one authored motion moment. A section four screens tall pins a stage
  (`position: sticky`) while scroll progress picks the chapter and draws the gold progress line. Outgoing
  chapter text clears in 150ms; the incoming one fades in after a 150ms beat, so text never overlaps.
  Focusing a link in a hidden chapter scrolls it into view. Reduced motion or no JavaScript → a normal
  stacked layout with identical content.
- **ScrollReveal** (GPL-3.0 — see README licensing note): section headings and editorial image/text pairs
  rise 24px and fade in once (700ms, ease-out). Homepage featured cards reveal in groups with an 80ms
  interval. **Never** on the directory results, filters, forms or navigation. Mounted as the last child
  of each page so it only touches DOM that has finished hydrating.
- **Rellax**: the home hero photograph (speed −2), two large editorial plates (−1), and the closing band's
  photograph (−1.5). Disabled under 768px and for `prefers-reduced-motion: reduce`.
- Both libraries load client-side via dynamic `import()` after hydration and are destroyed on route change.
  Content is visible by default; nothing is hidden by CSS waiting for JavaScript.
- `prefers-reduced-motion: reduce` disables reveals, parallax and transitions beyond 1ms.
- Visible focus on every interactive element; skip link; landmarks; one `h1`; form errors announced via
  `aria-live`; filters update a polite live region with the result count.
- Text selection, caret and scrollbar are themed from the palette.

## 11. Do / Don't

**Do** keep every claim true today; label anything planned; give each audience one obvious door; let the
finder be the fastest thing on the site.

**Don't** use purple gradients, glassmorphism, gradient text, hard offset shadows, icon-tile card grids as
page structure, fabricated numbers, countdowns to unconfirmed dates, or captions that imply stock photos
are ours.
