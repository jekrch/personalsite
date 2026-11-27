# Design refresh plan

Goal: make jacobkrch.com look more modern, sleek and professional while keeping
what already makes it recognizably yours. Most of the gain comes from
consistency (one type scale, one palette, one set of shadows) and from a few
missing professional basics (a real name/title on the page, readable contrast,
self-hosted fonts). The site's personality doesn't need replacing.

Written 2026-11-24 from a read of the source, not from screenshots. Every visual
step below needs your eye before it's kept.

---

## 1. What to keep (the guardrails)

These are the site's signature. Every change below should strengthen them, and
any change that waters one of them down should be dropped.

| Signature | Where it lives |
|---|---|
| **Brand teal `#5b8592`** as the surface color, with white on top | `App.css` `:root`, nav, banners, tab band, footer |
| **Layered offset squares** (the logo motif): white 1px outlines offset on the diagonal | `OffsetFrames.tsx`, `.menu-toggle__*`, loader `.frame-*`, nav indicator |
| **Diagonal bands with paired thin lines** (strong + faint) | `GeometricBackground.tsx`, `Banner.tsx` MOTIFS, `.tab-band__shape::before/after` |
| **Near-square corners** (`rounded-sm` / 2px) | everywhere |
| **Paper-on-desk lighting**: shadow falls down-right, light from top-left | `shadow-[5px_6px_11px…]`, banner radial lights |
| **Real objects on cards** (index card proof, mini player, comic pile) that bleed off the edge and shift on hover | `BannerVisuals.tsx` |
| **Stepped diamonds** as section and header markers | `PageHeader.tsx`, `SectionHeading` |
| **Lowercase, plain-spoken nav labels**, and the logo's little dances | `AppNavbar.tsx` |
| **Unhurried motion** with long ease-out curves (`cubic-bezier(0.22,1,0.36,1)`) | `.reveal`, `.page-enter`, `.smooth-reveal` |

Things to avoid because they would read as a generic template (or as AI-made):
glassmorphism, big gradient blobs, pill-shaped everything, large border radii,
colored accent stripes down the left edge of rounded cards, emoji section icons,
and hover effects that change an element's size and push the layout around.

---

## 2. Why it doesn't read as polished yet

Concrete findings from the code, roughly in order of visual impact.

1. **No typographic identity, and the font changes between devices.**
   `fontFamily: ['Helvetica','Arial','sans-serif']` renders as Helvetica on
   Apple, Arial on Windows and Roboto on Android. Bootstrap's reboot is imported
   *after* `App.css` (from route components), and it resets `body` to the
   system-ui stack. That's why 11 pages set
   `style={{ fontFamily: "helvetica", fontSize: 14 }}` inline on their `Container`.
2. **No headline anywhere.** There is no `<h1>` on any page. The home page opens
   with a single 14px paragraph under a logo image, so your name never appears
   as text. Project pages open on a URL, not the project's name.
3. **Body text is small and the sizes are scattered.** Prose is 14px. The
   components use about 20 distinct sizes (`text-[11px]`, `[10.5px]`,
   `[11.5px]`, `[12.5px]`, `[13px]`, `[0.65rem]`, `[0.68rem]`, `[0.7rem]`,
   `[0.75rem]`, `[0.9rem]`, `[0.95rem]`, …), so nothing settles into a rhythm.
4. **Contrast on teal is below AA.** White on `#5b8592` is **4.03:1**, white/80
   (banner descriptions, carousel captions) is **3.2:1**, and the nav's
   `text-slate-300` inactive links are **2.7:1**. Teal text on white (section
   headings, year labels) is also 4.03:1. This makes the small text look washed
   out as well as failing accessibility checks.
5. **The palette has drifted.** There are about 30 hard-coded hexes, including
   six near-duplicate teals (`#527882`, `#4e6268`, `#3f5e69`, `#6d8791`,
   `#79b0bb`, `#93b2bc`). They're mixed with Tailwind's `gray-*` and `slate-*`,
   which are blue-greys and sit slightly off the teal's hue.
6. **Elevation is ad hoc.** There are about 12 different shadow recipes. The
   signature `5px 6px 11px` offset shadow is good; the other recipes around it
   dilute it.
7. **The chrome looks dated.** There's a 110px logo in a full-width teal bar and
   a hamburger at every width, including desktop, where a hidden menu reads as
   unfinished. The footer is a 5em teal band with two icons in bordered boxes
   (`border-1` is a Bootstrap class).
8. **Two CSS frameworks are fighting.** Bootstrap, reactstrap and Tailwind 3 all
   ship. `App.css` already contains workarounds for the collisions (`.collapse`,
   z-index order, `!important` spacing). There's also a Tailwind v4 `@theme`
   block that v3 ignores.
9. **Missing professional basics.** `index.html` has no description, Open Graph
   or Twitter card tags, so shared links show no preview. There are no visible
   focus styles. The logo animations (`tada`, `shiver`, `bouncy-dance`) don't
   honor `prefers-reduced-motion`.
10. **The background animation costs more than it looks.**
    `GeometricBackground` calls `setState` on every animation frame, forever, so
    React re-renders at 60fps even while you're just reading. On phones that
    means battery drain and occasional jank, which works against feeling "sleek".

---

## 3. The plan

Phases are ordered so each one makes the next cheaper. Phase 1 is a
prerequisite for the rest; after it, phases 3–6 can go in any order.

### Phase 1: Foundations (tokens and plumbing, no visible change intended)

**1a. Design tokens.** Put every color, size, shadow and easing curve in one
place.
- Move to **Tailwind v4** (comic-snaps already uses it) and define tokens in
  `@theme` in `App.css`. If you'd rather stay on v3, put them in
  `tailwind.config.js` `theme.extend` and CSS custom properties. Either way,
  delete the dead `@theme` block if you stay on v3.
- Tokens to define (values in Phase 2/3):
  `--color-teal-{50…900}`, `--color-ink-{…}` (teal-tinted neutrals),
  `--color-paper`, `--text-{meta,small,body,lead,title,display}`,
  `--shadow-{rest,lift,float}`, `--ease-settle: cubic-bezier(0.22,1,0.36,1)`,
  `--radius: 2px`.

**1b. Contain Bootstrap.** It only needs to supply the carousel and collapse
behavior; it shouldn't be styling the page.
- Import Bootstrap once, from `App.tsx`, *before* `App.css`, rather than from 10
  route files. Then the cascade order is fixed and your rules always win.
- Longer term (Phase 6), replace the reactstrap `Carousel`/`Collapse`/`Navbar`
  with small components of your own and remove Bootstrap. That also removes the
  `.collapse.show` and z-index workarounds in `App.css`.

**1c. One project-page layout.** Add a `ProjectPage` component (or a `.prose-jk`
class) that sets the font, size, line-height and paragraph spacing. Remove the
11 inline `style={{ fontFamily, fontSize: 14 }}`.

Verify: `npm run build` and `npm run lint`. The site should look identical
except where Bootstrap's reboot was leaking through.

### Phase 2: Typography (the biggest single upgrade)

**2a. Pick a self-hosted grotesque in the Helvetica family of feel.** Install
it from `@fontsource-variable/*` so it loads with no third-party request, which
fits the self-hosted analytics. Candidates to try side by side on the home page
and one project page:
- **Inter Tight**: closest to Helvetica's proportions, with excellent screen
  rendering. The safe choice.
- **Instrument Sans**: slightly warmer, with more character at headline sizes.
- **Geist**: crisp and engineered. It's very common on dev sites, so it may
  read as generic.

My lean: Inter Tight for text and headlines, so the site still reads as
"Helvetica, done properly everywhere".

**2b. Add a monospace for metadata only**: years, URLs, stack labels, table
headers, the "PERSONAL / PROJECTS" nav captions. Try **Geist Mono** or **IBM
Plex Mono** at 11–12px uppercase with tracking. This brings in the engineer's
voice without changing the prose, and it suits labels that are already small
caps with wide tracking.

**2c. Pin the serif on the objects.** The index card uses Tailwind's generic
`font-serif`, which falls back to Times New Roman on Windows. Use one real
serif (e.g. **Source Serif 4**) only inside `BannerVisuals`, so the objects
look the same on every device.

**2d. One type scale**, replacing the ~20 arbitrary sizes:

| Token | Size / line-height | Use |
|---|---|---|
| `meta` | 11px / 1.4, mono, uppercase, +0.12em | years, labels, table heads, nav captions |
| `small` | 13px / 1.5 | captions, table cells, footnotes |
| `body` | 16px / 1.65 (up from 14px / 1.5) | all prose |
| `lead` | 19px / 1.5 | home intro, project one-liner |
| `title` | 24–28px / 1.2, semibold, −0.01em | card titles, project H1 on mobile |
| `display` | `clamp(2.25rem, 5vw, 3.5rem)` / 1.05, −0.02em | home name, project H1 on desktop |

At 16px, the 700px column runs to about 85 characters per line. Either keep
paragraphs at `max-width: 68ch` while carousels and diagrams use the full 700px
(the media is wider than the text, which is a common editorial layout), or
widen nothing and accept the long lines. I'd try the 68ch measure.

**2e. Small typographic details that read as "professional":**
`text-wrap: balance` on headings, `text-wrap: pretty` on prose,
`font-variant-numeric: tabular-nums` for years and tables (already used in one
place), real en dashes in year ranges (already done), and `hanging-punctuation`
where supported.

### Phase 3: Color, contrast, elevation

**3a. Teal ramp.** Build it in OKLCH around `#5b8592`, which stays as
`teal-500`, the surface color. The point is that you never have to invent a
teal again:
- `teal-600` ≈ `#527a87` (white on it is 4.67:1). Use it for any surface that
  carries small white text: nav, footer, tab band, banner cards. It's only one
  step darker than today's teal, and that difference is just perceptible.
- `teal-700` ≈ `#3f5e69`: text-on-white teal (headings, year labels, links),
  hover/pressed states, the dark slab behind the carousel (replacing `#3f4e53`).
- `teal-200/300` ≈ `#a9c7cd` / `#93b2bc`: unplayed waveform bars, faint lines.
- `teal-50` ≈ `#f3f7f8`: table zebra and subtle panels, replacing
  `rgba(91,133,146,0.05)`.

Map every existing hex onto a ramp step, then search the codebase for any
remaining hard-coded hex.

**3b. Teal-tinted neutrals.** Replace `gray-*`/`slate-*` with an `ink` ramp at
the teal's hue and very low chroma. Body text would be an ink-900 near
`#1f2a2e` rather than pure black. This one change makes the page feel like a
single, deliberate palette.

**3c. Fix contrast on teal.** Small text on teal is full white, weight 500 or
more, on `teal-600`. Remove the `/80` opacity on banner descriptions and
carousel captions, and get the hierarchy from size and weight instead. Nav links
become full white on `teal-600` (4.67:1) instead of `slate-300` (2.7:1). The
active link is marked by weight 600 plus the existing rotating-square
indicator, not by dimming the others. Any dimmed white falls below AA here,
even white/90 (4.15:1).

**3d. Paper as a second surface.** You already have `#f4f1e8` on the index
card. Make it a token and use it sparingly for objects and one or two callouts
(e.g. the Telegram chat frame or SQL query results), so the site gains a
second, warm material without adding a new accent hue.

**3e. Three shadows, one light source.** Keep the down-right offset, which is
the signature, and layer it so it looks softer and more expensive:
- `rest`: `1px 1px 2px rgb(0 0 0 / .12), 5px 6px 11px rgb(0 0 0 / .22)`
- `lift` (hover): `1px 1px 2px rgb(0 0 0 / .14), 7px 9px 18px rgb(0 0 0 / .28)`
- `float` (modals, lightbox): `0 24px 60px rgb(0 0 0 / .45)`

Replace the ~12 existing recipes with these three. Radii: standardize on 2px
for everything rectangular. Keep `rounded-full` only for genuine circles
(avatars, dots).

### Phase 4: Site chrome (nav, page header, footer)

**4a. Nav.**
- **Desktop (md+):** a compact bar with the logo at ~56–64px (down from 110px),
  your name as text beside it, and inline links: *projects*, *music*,
  *lectures*, *comics*. Keep them lowercase. The current active-link marker
  (the rotating outlined square) slides between them along the baseline,
  reusing `indicatorPos`. The squares toggle stays as the mobile control only.
- **Mobile:** keep the current toggle and its fan-out frames, which are good.
  The open panel should take up the full width under the bar.
- **On scroll:** the bar becomes `position: sticky` and condenses (logo
  shrinks, a 1px white/20 hairline appears at the bottom). Set fixed heights
  for both states so the content doesn't jump.
- The logo animations stay, but under `prefers-reduced-motion` they collapse to
  a short opacity blink.

**4b. Page header → project hero.** `PageHeader` currently shows the diamonds,
the URL, "(github)" and "Since 2025". Expand it into:
```
◆◆◆  PROJECT · SINCE 2025                       (meta, mono)
Comic Snaps                                     (display, H1)
Collect comic panels with neural-network        (lead)
image analysis.
[ Visit snaps.jacobkrch.com ↗ ]  [ Source ↗ ]   (two buttons)
```
- The buttons are 2px-radius rectangles: primary filled `teal-600`, secondary a
  1px teal outline. On hover/focus they show `OffsetFrames`, so the logo
  motif becomes the site's interaction signature.
- The one-line description already exists in `Home.tsx` `projects[]`. Move that
  array to `src/data/projects.ts` so the home carousel and each project hero
  read from the same source.

**4c. Footer.** Replace the icon band with a proper teal footer: name, one line
("Software engineer & architect · Minneapolis"), text links (GitHub,
LinkedIn, email), and © year in the meta mono. Draw a faint diagonal band with
paired lines in the corner, using the `Banner` MOTIF SVG, so the footer
belongs to the same family as the cards. Remove the `border-1` (Bootstrap)
boxes.

### Phase 5: Home page

**5a. A typographic hero above the carousel.**
```
Jacob Krch                                         (display)
Software engineer and architect in Minneapolis.    (lead)
Interested in technology, music and philosophy.
```
Put the layered-squares motif *behind* the name: two offset outlines at the
size of the text block, drawn in teal at low opacity on the white page, easing
apart once on load. This replaces the current 14px intro paragraph, and the
existing copy moves into the lead line.

**5b. Section labels.** Add a `SectionHeading`-style label ("Selected projects",
"Elsewhere") above the carousel and the banner grid, so the home page scans as
a portfolio rather than a feed.

**5c. Project carousel:** keep the tab band, ghosts and marquee strip; they
are some of the most distinctive things on the site. Polish only:
- Caption text on the band: full white, `lead`/`small` tokens, no italic
  `/80`.
- The featured screenshot uses the `rest` → `lift` shadow on hover.
- Consider letting the home page alone widen to ~960px on `lg`, so the carousel
  and the 2-column banner grid have room. This needs care: the tab band's
  `--overhang` is computed from the gutter, so check it at 1024/1280/1440 widths.

**5d. Banners:** these are already the strongest part of the home page. Add an
↗ glyph after titles that leave the site, so the comics banner reads as
external. Move the description to full-white `small` per 3c.

### Phase 6: Interaction, motion, accessibility

- **Focus styles:** every link and button gets `OffsetFrames` (or a 2px
  `teal-700` outline offset 3px) on `:focus-visible`. `Banner` already does this
  with `group-focus-visible`; extend it to nav links, buttons and table links.
- **Link styling in prose:** use a 1px underline in `teal-300` with
  `text-underline-offset: 3px` that darkens to `teal-700` on hover. This is
  calmer and more modern than a color shift alone.
- **`GeometricBackground` perf:** write transforms straight to the three `<g>`
  elements through refs instead of `setState`. Pause on
  `document.visibilityState === 'hidden'`, and under reduced motion render the
  shapes static with scroll parallax only. Same look, no 60fps React renders.
- **Reduced motion:** guard `tada`/`shiver`/`bouncy-*`/`rotate-with-quiver`.
- **Bootstrap removal** (optional, after everything above): replace
  `ImageCarousel`'s reactstrap carousel and the navbar `Collapse` with your own,
  drop `bootstrap`/`reactstrap`, and delete the collision workarounds. This
  shrinks the CSS bundle considerably and removes a source of drift.

### Phase 7: Professional finish (small, high leverage)

- `index.html`: `<meta name="description">`, Open Graph/Twitter tags, and a
  1200×630 share image. Design that image in the site's own language (teal,
  name in the display face, offset squares) so links in Slack or LinkedIn look
  intentional.
- Move the inline `style="background-color: #5b8592"` on `<html>`/`<body>`
  into CSS (keep the `theme-color` meta).
- Per-route `document.title` ("Comic Snaps — Jacob Krch").
- Screenshots: serve WebP/AVIF alongside the PNGs. This is mostly a perf
  change, but faster image loads also make the carousel feel smoother.

### Optional: dark mode

Tailwind is set to `darkMode: 'media'`, but nothing uses it. If you want it
later, the tokens from Phase 1 make it mostly a matter of remapping: page in
ink-950 (`#0c0c0e` is already the lightbox theme), surfaces stay teal
(`teal-600/700`), white lines stay white, and the background bands switch from
teal-on-white to white at very low opacity. Leave it until the light theme is
settled.

---

## 4. Suggested order and size

| # | Work | Size | Visible? |
|---|---|---|---|
| 1 | Tokens, Bootstrap import order, `ProjectPage` layout | M | barely |
| 2 | Font trial → pick → type scale applied | M | **a lot** |
| 3 | Teal ramp, ink neutrals, contrast fixes, 3 shadows | M | yes, subtle |
| 4 | Home hero + section labels | S | **a lot** |
| 5 | Project hero (`PageHeader` v2) + shared `projects.ts` | M | yes |
| 6 | Desktop nav + sticky condense | M | yes |
| 7 | Footer | S | yes |
| 8 | Focus/links/reduced motion/background perf | S | feel |
| 9 | Meta/OG/share image/titles | S | off-site |
| 10 | Bootstrap removal | L | no (cleanup) |
| — | Dark mode | L | optional |

Steps 2 and 4 together are most of the "modern and professional" impression,
for maybe a fifth of the total effort. If you only do part of this, do those
two (plus the contrast fix in 3, which comes almost free once the ramp exists).

## 5. How each step gets checked

- `npm run build` and `npm run lint` after every step.
- Contrast: check each text-on-surface pair against 4.5:1 (3:1 for ≥24px or
  ≥18.5px bold) with a small script over the token values, not by eye.
- Visuals: you review on desktop and phone after each phase. In particular,
  check the font trial (2a), the `teal-600` surface shift (3a/3c), the nav
  (4a), and the 960px home widening (5c), since those are judgment calls the
  code can't settle.
