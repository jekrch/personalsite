---
name: update-thumbs
description: Regenerate this site's project screenshots (public/images/*.png used in Home.tsx cards and project-page carousels) by capturing fresh images from each project's live website. Use when the user runs /update-thumbs or asks to refresh/update/regenerate project thumbnails, screenshots, or gallery images for named projects.
argument-hint: <project name> [more projects...]
---

# Update project thumbnails

Recapture project screenshots from the live sites and overwrite the files in `public/images/`.
Everything is driven by [thumbs.json](thumbs.json); the scripts live in [scripts/](scripts/).

Arguments: `$ARGUMENTS` — one or more project names (e.g. `criterion club`, `juxtaglobe`).
Names match loosely against each manifest key, `name`, and `aliases`. With no arguments,
run `--list` and ask which projects to update.

## 1. Setup (first run only)

```bash
cd .claude/skills/update-thumbs/scripts && [ -d node_modules ] || npm install
```

Playwright is pinned to 1.61.1 because that matches the Chromium build already cached in
`~/.cache/ms-playwright` (chromium-1228). If the browser is missing, run
`npx playwright install chromium` from the scripts dir.

## 2. Make sure each project has shots in the manifest

```bash
node .claude/skills/update-thumbs/scripts/capture.mjs --list
```

If a requested project is **not** in `thumbs.json`, author an entry before capturing:

1. Find its images in `src/components/Home.tsx` (`imageUrl` + `gallery`) and its project page
   component (e.g. `src/components/JuxtaGlobe.tsx`). Every file referenced there should get a shot.
   The site URL is the `url` field in `Home.tsx` (or `mainLink` in the page's `PageHeader`).
2. Read the existing images to learn which page/section each one shows and its rough aspect ratio.
3. Run `probe.mjs` against the live site to find routes and the y-ranges of the matching
   sections. Build clips from selectors and aspect ratios, not from pixel guesses, so they
   survive layout changes:
   ```bash
   node .claude/skills/update-thumbs/scripts/probe.mjs https://example.com/some/page --max-y 2000
   ```
   The live site may have been redesigned since the old image was taken. Capture the closest
   current equivalent and tell the user about any meaningful differences.
4. Show the app in use, not idle. If the old image shows live state (notes on a staff, lit
   keys, a tooltip, an open menu), reproduce that state with actions. Verify it through the
   DOM (e.g. count the rendered notes) rather than assuming a click produced it. See
   [Project notes](#project-notes) for known recipes.
5. Add the project under `projects` with a `note` per shot describing what it should show.

### Adding new shots to an existing project

When the user asks for a new view (not a refresh), give it the next free file number
(e.g. `comicSnaps6.png`) and add it to the manifest. After capturing, reference the new file in
**both** places, or it won't appear on the site:
- the project's `gallery` array in `src/components/Home.tsx`
- the `imagePaths` (or equivalent) array in the project page component

Then run `npx tsc --noEmit -p .`.

### Shot schema

```jsonc
{
  "file": "juxtaglobe2.png",            // written to defaults.outDir (public/images)
  "note": "what this shot shows",       // for humans; used when re-authoring
  "path": "/#/route",                   // resolved against the project's `site`
  "waitFor": "text=Some heading",       // Playwright selector that must appear before capture
  "viewport": { "width": 1280, "height": 800 },  // optional, else project/defaults
  "scale": 2,                           // deviceScaleFactor (2 ≈ the ~2400px-wide originals)
  "colorScheme": "dark",
  "actions": [ { "click": "button:has-text('Decade')", "wait": 800 } ],  // also hover/fill/press/select/eval
  "hide": [ ".cookie-banner" ],         // selectors to hide before capture (also allowed per project)
  "wait": 1500,                         // extra settle time in ms
  "fullPage": false,                    // capture the viewport as-is (also per project); use for fixed
                                        //   modals and apps that scroll an inner container
  "localStorage": { "key": "value" },   // seeded before page scripts run (also per project); objects
                                        //   are JSON-stringified. Dismiss welcome dialogs, seed user data
  "clip": {
    "element": "selector",              // crop to this element's box, OR use a full-width band:
    "top": 0,                           //   number (page y) or selector (its top edge)
    "bottom": "selector",               //   selector's bottom edge, or
    "height": 900,                      //   fixed height, or
    "aspect": 1.45,                     //   height = width / aspect
    "pad": 24                           // padding around selector-derived edges
  }
}
```

Keep aspect ratios in the ~1.3–1.6 range: `ImageCarousel` frames a whole gallery at the
narrowest ratio among its images, so one tall screenshot letterboxes all the others.
The script scrolls each page top to bottom before capturing so lazy images load.

Selector gotchas: `button:text-is('X')` only matches when the text is the button's own text
node. If the label is wrapped in a `<span>` it matches nothing, so use `button >> text="X"`
or `button:has-text('X')` instead. Many of these sites uppercase labels in CSS, so match the
source-case text (e.g. `Settings`, not `SETTINGS`). Prefer state in the URL (`?panel=`,
`?view=`, `?s=`) over clicking through the UI when a site supports it.

## Project notes

Recipes the manifest depends on that aren't obvious from the live site:

- **Modal Chord Buildr (`modal1.png`): notes on the staff need the sequencer playing.**
  Selecting a chord only draws it as one stacked chord, and the chord bar's own Play button
  doesn't draw notes. Select a chord in the bottom chord bar, then press the **Sequencer**
  section's Play (`button >> text="Play"`). While it plays, the staff shows one note per
  sequencer step. The number of notes is set by the pattern length, not the chord size: the
  default `1.2.3.4` pattern shows 4 notes for any chord. Use a 5-note chord (`Amaj9`) with an
  8-step pattern written into the `?s=v9_<key>_<mode>_<pattern>_…` URL. The pattern is dot
  separated, e.g. `1.2.3.4.5.4.3.2`. Avoid `+` octave steps there, since `+` can decode as a
  space in a query string. Check it through the DOM: the staff SVG has 8 `.vf-stavenote`
  elements while it plays, and the button reads "Stop". Lit keys fade about 2s after a
  chord click, but they stay lit while the sequencer is playing.
- **Modal Chord Buildr (`modal5`/`modal6`):** songs live only in localStorage
  (`mcb-song-library`). The manifest seeds public-domain folk songs. Don't seed copyrighted
  lyrics.
- **Modal Chord Buildr, general:** the page scrolls an inner `.overflow-y-auto` container, not
  the window. Use `fullPage: false` and scroll sections into view with an `eval` action.
  To build a new progression, use the Chord Explorer's *Enter Progression* in the probe, then
  copy the resulting `?s=` URL into the manifest.
- **PlantyJ:** set `plantyj:welcomed` in localStorage to skip the welcome dialog.
  `plantyj2.png` is Telegram phone screenshots, and `chordbuildrios.jpg` is an App Store
  image. Neither comes from a website, so leave both out of the manifest.
- **Comic Snaps (`comicSnaps6`/`comicSnaps7`):** the series view and filters live in the URL
  (`?view=series|artists`, `credits=`, `artists=`, `series=`…). Writers such as James Tynion IV
  are in `credits`, not `artists`. A person's profile has no URL, so open a panel, press
  *Show details*, and click the person's credit button (`[role=dialog] button:text-is('Name')`).
  The collaborator graph is the profile's "Worked with" section. The drawer and the profile
  each have their own `.info-modal-scroll`, so scroll `el.closest('.info-modal-scroll')` from
  the "Worked with" label, not the first one `querySelector` returns. The source is at
  `~/projects/comic-snaps` if you need to find more URL params or selectors.
- **Eurovision Ranker:** URLs without a ranking show a *Get Started* intro, so dismiss it with a
  conditional `eval` click. Rankings, year, and categories (`c`, `r1`…) all live in the URL.

## 3. Capture

Check first whether any target images have uncommitted changes (`git status public/images`).
If they do, ask before overwriting them, because git can't restore them.

```bash
node .claude/skills/update-thumbs/scripts/capture.mjs "criterion club"
node .claude/skills/update-thumbs/scripts/capture.mjs juxtaglobe --only juxtaglobe1.png   # a subset
node .claude/skills/update-thumbs/scripts/capture.mjs juxtaglobe --out <scratchpad>/preview  # dry run
```

Each shot prints its pixel size, file size, and the headings inside the crop. Compare those
headings with the shot's `note` to confirm it framed the right section. A `⚠ suspiciously small` warning or a `✗`
failure means a selector didn't match or the page didn't render. Fix the manifest entry
(re-probe the page) and rerun that shot with `--only`.

## 4. Report

- The user reviews visuals themselves. Don't open the new screenshots to judge how they look.
  Checking dimensions, file sizes, and DOM or selector state is fine.
- Summarize which files were updated, their new dimensions, and any shot whose content
  differs from the old image because the site changed (e.g. a section that no longer exists).
- Remind them that `git diff --stat public/images` or `git checkout -- public/images/<file>`
  reverts any shot they don't like.
- If you added or changed manifest entries, say so. They're part of the skill and should be
  committed with it.
