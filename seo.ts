import type { Plugin } from "vite"
import { SITE_URL, person, projects, otherPages, elsewhere, pageMeta } from "./src/data/site"

// Writes the machine-readable copies of the site from src/data/site.ts.
//
// The app is a client-rendered SPA, so before React mounts, index.html is an
// empty <div id="root">. Search engines run the JS, but most other readers
// (LLM crawlers, link unfurlers, recruiting and ATS tools, curl) don't. This
// fills in what they read:
//   - <head>: description, canonical, Open Graph/Twitter tags, and JSON-LD
//     (Person, WebSite, ProfilePage, and each project as a WebApplication)
//   - inside #root: a plain-HTML profile that React replaces on mount; it's
//     hidden with CSS unless JS is off, so it never flashes for normal visitors
//   - /llms.txt: a markdown summary for LLM tools (llmstxt.org)
//   - /sitemap.xml

const home = `${SITE_URL}/`
const ids = {
  person: `${home}#person`,
  website: `${home}#website`,
  profile: `${home}#profile`,
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

// Everything here mirrors what the site already says. It isn't a resume, so
// no skills lists, education, or work history.
function jsonLd(): string {
  const graph = [
    {
      "@type": "Person",
      "@id": ids.person,
      name: person.name,
      url: home,
      jobTitle: person.jobTitle,
      description: person.intro,
      address: {
        "@type": "PostalAddress",
        addressLocality: person.locality,
        addressRegion: person.regionCode,
        addressCountry: person.country,
      },
      sameAs: Object.values(person.links),
    },
    {
      "@type": "WebSite",
      "@id": ids.website,
      url: home,
      name: person.name,
      inLanguage: "en",
      publisher: { "@id": ids.person },
    },
    {
      "@type": "ProfilePage",
      "@id": ids.profile,
      url: home,
      name: pageMeta("").title,
      description: person.description,
      isPartOf: { "@id": ids.website },
      mainEntity: { "@id": ids.person },
      hasPart: projects.map(p => ({ "@id": `${home}#${p.slug}` })),
    },
    ...projects.map(p => ({
      "@type": "WebApplication",
      "@id": `${home}#${p.slug}`,
      name: p.name,
      url: p.url,
      description: p.summary,
      applicationCategory: "WebApplication",
      operatingSystem: "Any (web browser)",
      dateCreated: String(p.startYear),
      keywords: p.tech.join(", "),
      creator: { "@id": ids.person },
      ...(p.repo && {
        isBasedOn: {
          "@type": "SoftwareSourceCode",
          codeRepository: p.repo,
          author: { "@id": ids.person },
        },
      }),
    })),
  ]
  // "</" would close the <script> early
  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph }, null, 2).replace(/<\//g, "<\\/")
}

function headTags(): string {
  const { title, description } = pageMeta("")
  const image = `${SITE_URL}/icon-512.png`
  return [
    `<meta name="description" content="${esc(description)}">`,
    `<meta name="author" content="${esc(person.name)}">`,
    `<meta name="robots" content="index, follow, max-image-preview:large">`,
    `<link rel="canonical" href="${home}">`,
    `<link rel="alternate" type="text/markdown" href="/llms.txt" title="${esc(person.name)} (Markdown)">`,
    `<link rel="me" href="${person.links.github}">`,
    `<link rel="me" href="${person.links.linkedin}">`,
    `<meta property="og:type" content="profile">`,
    `<meta property="og:site_name" content="${esc(person.name)}">`,
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(description)}">`,
    `<meta property="og:url" content="${home}">`,
    `<meta property="og:image" content="${image}">`,
    `<meta property="og:image:alt" content="${esc(person.name)} logo">`,
    `<meta property="og:locale" content="en_US">`,
    `<meta property="profile:first_name" content="${esc(person.name.split(" ")[0])}">`,
    `<meta property="profile:last_name" content="${esc(person.name.split(" ").slice(1).join(" "))}">`,
    `<meta name="twitter:card" content="summary">`,
    `<meta name="twitter:title" content="${esc(title)}">`,
    `<meta name="twitter:description" content="${esc(description)}">`,
    `<meta name="twitter:image" content="${image}">`,
    `<script type="application/ld+json">\n${jsonLd()}\n</script>`,
    // the static profile below only shows when JS is off
    `<style>#static-profile{display:none}</style>`,
    `<noscript><style>#static-profile{display:block;max-width:46rem;margin:2rem auto;padding:1.5rem 2rem;background:#fff;color:#1f2933;font:16px/1.55 Helvetica,Arial,sans-serif}#static-profile a{color:#3d6470}#static-profile h2{margin-top:2rem;font-size:1.15rem}#static-profile ul{list-style:disc;padding-left:1.5rem}</style></noscript>`,
  ].join("\n    ")
}

function staticProfile(): string {
  const link = (href: string, text: string) => `<a href="${esc(href)}">${esc(text)}</a>`
  const host = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "")
  const project = (p: typeof projects[number]) => `
        <article>
          <h3>${link(p.url, p.name)}</h3>
          <p>${esc(p.summary)}</p>
          <p><strong>Tech:</strong> ${esc(p.tech.join(", "))}</p>
          <p>Live: ${link(p.url, host(p.url))}${p.repo ? ` · Source: ${link(p.repo, host(p.repo))}` : ""} · Since ${p.startYear} · ${link(`/#${p.slug}`, "Project write-up")}</p>
        </article>`
  return `
      <main id="static-profile">
        <header>
          <h1>${esc(person.name)}</h1>
          <p>${esc(person.intro)}</p>
          <p>${link(person.links.linkedin, "LinkedIn")} · ${link(person.links.github, "GitHub")} · ${link("/llms.txt", "This page in Markdown")}</p>
        </header>
        <section>
          <h2>Projects</h2>${projects.map(project).join("")}
        </section>
        <section>
          <h2>Also here</h2>
          <ul>${otherPages.map(p => `
            <li>${link(`/#${p.slug}`, p.name)}: ${esc(p.summary)}</li>`).join("")}${elsewhere.map(e => `
            <li>${link(e.url, e.name)}</li>`).join("")}
          </ul>
        </section>
      </main>
    `
}

function llmsTxt(): string {
  const lines = [
    `# ${person.name}`,
    "",
    `> ${person.description}`,
    "",
    person.intro,
    "",
    `- Website: ${home}`,
    `- LinkedIn: ${person.links.linkedin}`,
    `- GitHub: ${person.links.github}`,
    "",
    "## Projects",
    "",
    ...projects.flatMap(p => [
      `### ${p.name}`,
      "",
      p.summary,
      "",
      `- Live: ${p.url}`,
      ...(p.repo ? [`- Source: ${p.repo}${p.repoLabel ? ` (${p.repoLabel})` : ""}`] : []),
      `- Started: ${p.startYear}`,
      `- Tech: ${p.tech.join(", ")}`,
      `- Write-up: ${home}#${p.slug}`,
      "",
    ]),
    "## Also here",
    "",
    ...otherPages.map(p => `- [${p.name}](${home}#${p.slug}): ${p.summary}`),
    ...elsewhere.map(e => `- [${e.name}](${e.url})`),
    "",
  ]
  return lines.join("\n")
}

function sitemap(): string {
  const today = new Date().toISOString().slice(0, 10)
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${home}</loc><lastmod>${today}</lastmod></url>
  <url><loc>${SITE_URL}/llms.txt</loc><lastmod>${today}</lastmod></url>
</urlset>
`
}

export default function seo(): Plugin {
  return {
    name: "site-seo",
    transformIndexHtml(html) {
      return html
        .replace("<!--seo:head-->", headTags())
        .replace("<!--seo:profile-->", staticProfile())
    },
    // dev server: serve the generated files too
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // no @types/node here, so IncomingMessage is missing its fields
        const url = (req as { url?: string }).url
        const body = url === "/llms.txt" ? llmsTxt() : url === "/sitemap.xml" ? sitemap() : null
        if (body === null) return next()
        res.setHeader("Content-Type", url === "/llms.txt" ? "text/markdown; charset=utf-8" : "application/xml")
        res.end(body)
      })
    },
    generateBundle() {
      this.emitFile({ type: "asset", fileName: "llms.txt", source: llmsTxt() })
      this.emitFile({ type: "asset", fileName: "sitemap.xml", source: sitemap() })
    },
  }
}
