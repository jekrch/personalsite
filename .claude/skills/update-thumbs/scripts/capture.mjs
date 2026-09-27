#!/usr/bin/env node
// Capture fresh project screenshots from live sites, driven by ../thumbs.json.
//
//   node capture.mjs <project...>        capture every shot for the named projects
//   node capture.mjs criterion --only filmclub1.png,filmclub3.png
//   node capture.mjs criterion --out /tmp/preview   write somewhere other than public/images
//   node capture.mjs --list              show projects in the manifest
//
// Project names match case-/punctuation-insensitively against the key, `name`, and `aliases`.

import { chromium } from "playwright";
import { readFile, mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const skillDir = path.resolve(here, "..");
const repoRoot = path.resolve(skillDir, "../../..");
const manifest = JSON.parse(await readFile(path.join(skillDir, "thumbs.json"), "utf8"));

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

function parseArgs(argv) {
  const opts = { names: [], only: null, out: null, list: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--list") opts.list = true;
    else if (a === "--only") opts.only = argv[++i].split(",").map((s) => s.trim());
    else if (a === "--out") opts.out = path.resolve(argv[++i]);
    else opts.names.push(a);
  }
  return opts;
}

function findProject(query) {
  const q = norm(query);
  const entries = Object.entries(manifest.projects);
  const exact = entries.filter(([key, p]) =>
    [key, p.name, ...(p.aliases ?? [])].some((n) => norm(n) === q));
  if (exact.length) return exact[0];
  const partial = entries.filter(([key, p]) =>
    [key, p.name, ...(p.aliases ?? [])].some((n) => norm(n).includes(q)));
  if (partial.length === 1) return partial[0];
  if (partial.length > 1) throw new Error(`"${query}" is ambiguous: ${partial.map(([k]) => k).join(", ")}`);
  return null;
}

// Page-coordinate box of the first element matching `selector`.
async function box(page, selector) {
  const loc = page.locator(selector).first();
  await loc.waitFor({ state: "attached", timeout: 15000 });
  return loc.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { x: r.left + scrollX, y: r.top + scrollY, width: r.width, height: r.height };
  });
}

// Scroll the whole page so lazy images load, then wait for every <img> to settle.
async function primeLazyContent(page) {
  await page.evaluate(async () => {
    const step = innerHeight * 0.8;
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 200));
    }
    scrollTo(0, 0);
  });
  await page.evaluate(() => Promise.race([
    Promise.all([...document.images].map((img) =>
      img.complete ? null : new Promise((r) => { img.onload = img.onerror = r; }))),
    new Promise((r) => setTimeout(r, 8000)),
  ]));
}

async function runActions(page, actions = []) {
  for (const a of actions) {
    if (a.click) await page.locator(a.click).first().click();
    else if (a.hover) await page.locator(a.hover).first().hover();
    else if (a.fill) await page.locator(a.fill).first().fill(a.value ?? "");
    else if (a.press) await page.keyboard.press(a.press);
    else if (a.select) await page.locator(a.select).first().selectOption(a.value);
    else if (a.eval) await page.evaluate(a.eval);
    await page.waitForTimeout(a.wait ?? 500);
  }
}

async function computeClip(page, clip = {}, viewport) {
  const docHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  const pad = clip.pad ?? 0;
  let x = 0, width = viewport.width, top, bottom;

  if (clip.element) {
    const b = await box(page, clip.element);
    x = Math.max(0, b.x - pad);
    width = Math.min(viewport.width - x, b.width + pad * 2);
    top = b.y - pad;
    bottom = b.y + b.height + pad;
  }
  if (clip.top !== undefined) {
    top = typeof clip.top === "number" ? clip.top : (await box(page, clip.top)).y - pad;
  }
  top = Math.max(0, top ?? 0);

  if (clip.bottom !== undefined) {
    const b = typeof clip.bottom === "number" ? { y: clip.bottom, height: 0 } : await box(page, clip.bottom);
    bottom = b.y + b.height + pad;
  } else if (clip.height) {
    bottom = top + clip.height;
  } else if (clip.aspect) {
    bottom = top + width / clip.aspect;
  }
  bottom = Math.min(docHeight, bottom ?? top + viewport.height);

  return { x: Math.round(x), y: Math.round(top), width: Math.round(width), height: Math.round(bottom - top) };
}

async function captureShot(browser, project, shot, outDir) {
  const viewport = shot.viewport ?? project.viewport ?? manifest.defaults.viewport;
  const scale = shot.scale ?? project.scale ?? manifest.defaults.scale;
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: scale,
    colorScheme: shot.colorScheme ?? project.colorScheme ?? manifest.defaults.colorScheme,
  });
  // Seed localStorage before any page script runs (for apps that keep user data there).
  const storage = { ...(project.localStorage ?? {}), ...(shot.localStorage ?? {}) };
  if (Object.keys(storage).length) {
    const entries = Object.entries(storage).map(([k, v]) => [k, typeof v === "string" ? v : JSON.stringify(v)]);
    await context.addInitScript((entries) => {
      for (const [k, v] of entries) localStorage.setItem(k, v);
    }, entries);
  }
  const page = await context.newPage();
  try {
    const url = new URL(shot.path ?? "/", project.site).toString();
    await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
    if (shot.waitFor) await page.locator(shot.waitFor).first().waitFor({ timeout: 20000 });
    await primeLazyContent(page);
    await runActions(page, shot.actions);
    for (const sel of [...(project.hide ?? []), ...(shot.hide ?? [])]) {
      await page.locator(sel).evaluateAll((els) => els.forEach((el) => (el.style.visibility = "hidden")));
    }
    await page.waitForTimeout(shot.wait ?? project.wait ?? manifest.defaults.wait);

    // fullPage: false captures the viewport as-is (after any action-driven scroll), which keeps
    // fixed-position modals where the user sees them; clip coordinates are then viewport-relative.
    const fullPage = shot.fullPage ?? project.fullPage ?? true;
    if (!fullPage) await page.evaluate(() => scrollTo(0, 0));
    const clip = await computeClip(page, shot.clip, viewport);
    if (!fullPage) clip.height = Math.min(clip.height, viewport.height - clip.y);
    const file = path.join(outDir, shot.file);
    await page.screenshot({ path: file, fullPage, clip, animations: "disabled" });

    // Headings fully inside the crop — a text-only check that the crop hit the right section.
    const headings = await page.evaluate(({ y, height }) =>
      [...document.querySelectorAll("h1,h2,h3,h4")]
        .filter((h) => {
          const r = h.getBoundingClientRect();
          const top = r.top + scrollY;
          return r.height > 0 && top >= y && top + r.height <= y + height;
        })
        .map((h) => h.textContent.trim().replace(/\s+/g, " ").slice(0, 40)), clip);

    const { size } = await stat(file);
    const px = `${Math.round(clip.width * scale)}x${Math.round(clip.height * scale)}`;
    const warn = size < 40_000 ? "  ⚠ suspiciously small — page may not have rendered" : "";
    console.log(`  ✓ ${shot.file}  ${px}  ${(size / 1024).toFixed(0)} KB  (${url})${warn}`);
    if (headings.length) console.log(`      contains: ${headings.slice(0, 8).join(" · ")}${headings.length > 8 ? " …" : ""}`);
    return { file: shot.file, ok: true };
  } catch (err) {
    console.log(`  ✗ ${shot.file}  ${err.message.split("\n")[0]}`);
    return { file: shot.file, ok: false, error: err.message };
  } finally {
    await context.close();
  }
}

const opts = parseArgs(process.argv.slice(2));

if (opts.list || !opts.names.length) {
  for (const [key, p] of Object.entries(manifest.projects)) {
    console.log(`${key.padEnd(20)} ${p.name.padEnd(20)} ${p.site}  (${p.shots.length} shots)`);
  }
  if (!opts.list) console.log("\nUsage: node capture.mjs <project...> [--only a.png,b.png] [--out dir]");
  process.exit(0);
}

const outDir = opts.out ?? path.join(repoRoot, manifest.defaults.outDir);
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
let failures = 0;
for (const name of opts.names) {
  const found = findProject(name);
  if (!found) {
    console.log(`✗ no project matching "${name}" in thumbs.json`);
    failures++;
    continue;
  }
  const [key, project] = found;
  const shots = project.shots.filter((s) => !opts.only || opts.only.includes(s.file));
  console.log(`${project.name} (${key}) → ${path.relative(repoRoot, outDir) || outDir}`);
  for (const shot of shots) {
    const res = await captureShot(browser, project, shot, outDir);
    if (!res.ok) failures++;
  }
}
await browser.close();
process.exit(failures ? 1 : 0);
