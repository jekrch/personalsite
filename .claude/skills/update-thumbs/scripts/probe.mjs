#!/usr/bin/env node
// Print a text outline of a page's layout (headings, text, images, buttons, cards) with
// page-coordinate y-ranges, plus its same-site links. Used to author shots in thumbs.json
// without eyeballing screenshots.
//
//   node probe.mjs https://criterionclub.org/#/almanac [--max-y 1500] [--width 1280]

import { chromium } from "playwright";

const args = process.argv.slice(2);
const url = args.find((a) => !a.startsWith("--"));
const flag = (name, dflt) => {
  const i = args.indexOf(name);
  return i >= 0 ? Number(args[i + 1]) : dflt;
};
if (!url) {
  console.log("Usage: node probe.mjs <url> [--max-y N] [--width N]");
  process.exit(1);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: flag("--width", 1280), height: 800 }, colorScheme: "dark" });
await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
await page.waitForTimeout(1500);

const info = await page.evaluate((maxY) => {
  const rows = [];
  const sel = "h1,h2,h3,h4,h5,p,button,img,canvas,svg[role=img],section,[class*=card]";
  for (const el of document.querySelectorAll(sel)) {
    const r = el.getBoundingClientRect();
    const y = Math.round(r.top + scrollY);
    if (y > maxY || r.height === 0 || r.width === 0) continue;
    const label = el.tagName === "IMG"
      ? `[img ${(el.alt || el.src.split("/").pop()).slice(0, 40)}]`
      : (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 60);
    rows.push([y, `${String(y).padStart(5)}-${String(Math.round(y + r.height)).padEnd(5)} x=${Math.round(r.left)} w=${Math.round(r.width)}  ${el.tagName}${el.className && typeof el.className === "string" && /card/.test(el.className) ? "(card)" : ""}  ${label}`]);
  }
  const links = [...new Set([...document.querySelectorAll("a[href]")]
    .map((a) => a.href)
    .filter((h) => h.startsWith(location.origin)))];
  return {
    title: document.title,
    docHeight: document.documentElement.scrollHeight,
    rows: rows.sort((a, b) => a[0] - b[0]).map((r) => r[1]),
    links,
  };
}, flag("--max-y", 2500));

console.log(`${info.title}  (document height ${info.docHeight}px)\n`);
console.log(info.rows.join("\n"));
console.log(`\nLinks (${info.links.length}):\n${info.links.slice(0, 40).join("\n")}`);
await browser.close();
