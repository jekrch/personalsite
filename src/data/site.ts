// Single source for who the site is about and what's on it. The home page
// renders from this, and vite.config.ts uses it at build time to write the
// machine-readable copies (JSON-LD and plain-HTML profile in index.html,
// llms.txt, sitemap.xml), so the human page and what crawlers read can't drift.
//
// Plain data only: this file is also loaded by Vite in Node, so no React,
// DOM, or asset imports.

export const SITE_URL = "https://www.jacobkrch.com"

export const person = {
  name: "Jacob Krch",
  jobTitle: "Software Engineer and Architect",
  locality: "Minneapolis",
  region: "Minnesota",
  regionCode: "MN",
  country: "US",
  // the home page intro, kept word for word
  intro:
    "I'm a software engineer and architect based in Minneapolis who's interested in technology, music, and philosophy. Check out the links to see some of my current and past projects.",
  // search snippets and link previews; keep it under ~160 characters.
  // Describes the site, not a resume: only what the pages themselves say.
  description:
    "Software engineer and architect in Minneapolis. Web projects with write-ups on how they're built, logic lecture slides, and music.",
  links: {
    linkedin: "https://www.linkedin.com/in/jacob-krch-60541a61",
    github: "https://github.com/jekrch",
  },
}

export interface Project {
  name: string
  // hash route of the project's page on this site
  slug: string
  url: string
  repo?: string
  repoLabel?: string
  startYear: number
  // one line, shown on the home carousel
  description: string
  // two or three sentences for crawlers and llms.txt
  summary: string
  tech: string[]
  imageUrl: string
  gallery: string[]
}

export const projects: Project[] = [
  {
    name: "PlantyJ",
    slug: "plantyj",
    url: "https://plantyj.com",
    repo: "https://github.com/jekrch/plantyJ",
    startYear: 2026,
    description: "An agentic garden journal maintained with prompts and photos.",
    summary:
      "A garden journal driven from a Telegram group with an LLM agent built in. Photos and captions are committed to the repo by a Cloudflare Worker; questions and plain-English change requests go through a KV-backed job queue drained by a cron Worker that calls Gemini, and every proposed change waits for /confirm. A GitHub Actions pipeline runs BioCLIP for species prediction and embeddings and enriches records from GBIF, POWO and Wikipedia.",
    tech: ["React 19", "TypeScript", "Cloudflare Workers", "Cloudflare KV", "Gemini", "Telegram Bot API", "GitHub Actions", "Python", "PyTorch", "BioCLIP", "D3"],
    imageUrl: "/images/plantyj1.png",
    gallery: [
      "/images/plantyj2.png",
      "/images/plantyj3.png",
      "/images/plantyj4.png",
      "/images/plantyj5.png",
      "/images/plantyj6.png",
      "/images/plantyj7.png",
      "/images/plantyj8.png",
      "/images/plantyj9.png",
    ],
  },
  {
    name: "Modal ChordBuildr",
    slug: "modal-chordbuildr",
    url: "https://modal.chordbuildr.com",
    repo: "https://github.com/jekrch/chord-db",
    repoLabel: "chord-db (the open-source theory database)",
    startYear: 2021,
    description: "Explore modal chord progressions for songwriting.",
    summary:
      "A songwriting tool that generates chords for any mode and key, with a sequencer, MIDI export, staff notation, and song sheets saved locally or to Google Drive. The music-theory engine is a PostgreSQL database of chords, scales and modes with voice-leading pathfinding in SQL, exported to static JSON, plus a Go API and MCP server for prompting progressions from LLM clients.",
    tech: ["React", "TypeScript", "Zustand", "Web Audio", "VexFlow", "PostgreSQL", "Go", "MCP", "Python", "Docker Compose"],
    imageUrl: "/images/modal1.png",
    gallery: [
      "/images/modal2.png",
      "/images/modal3.png",
      "/images/modal4.png",
      "/images/modal7.png",
      "/images/modal5.png",
      "/images/modal6.png",
    ],
  },
  {
    name: "Eurovision Ranker",
    slug: "eurovision-ranker",
    url: "https://eurovision-ranker.com",
    repo: "https://github.com/jekrch/eurovision-ranker",
    startYear: 2022,
    description: "Rank and share Eurovision contestants from every year.",
    summary:
      "A web app for ranking Eurovision contestants from every contest since 1956, with rankings encoded in the URL so they can be shared without an account. Contest data is scraped from Wikipedia with Scrapy; optional accounts are served by a Go API on PostgreSQL 16, deployed as a Docker image from GitHub Actions to a Terraform-provisioned DigitalOcean droplet behind Caddy.",
    tech: ["React", "TypeScript", "Redux Toolkit", "Go", "PostgreSQL", "JWT", "Docker", "Terraform", "DigitalOcean", "GitHub Actions", "Scrapy", "PWA"],
    imageUrl: "/images/eurovision-ranker3.png",
    gallery: [
      "/images/eurovision-ranker1.png",
      "/images/eurovision-ranker2.png",
      "/images/eurovision-ranker4.png",
      "/images/eurovision-ranker5.png",
      "/images/eurovision-ranker6.png",
      "/images/eurovision-ranker7.png",
      "/images/eurovision-ranker8.png",
    ],
  },
  {
    name: "Comic Snaps",
    slug: "comic-snaps",
    url: "https://snaps.jacobkrch.com",
    repo: "https://github.com/jekrch/comic-snaps",
    startYear: 2025,
    description: "Collect comic panels with neural-network image analysis.",
    summary:
      "A zero-cost gallery of comic panels posted through a Telegram bot and a Cloudflare Worker that commits straight to GitHub. A Python pipeline in GitHub Actions computes SigLIP, DINOv2 and VGG-16 style embeddings, perceptual hashes and colour features for similarity browsing, and an LLM agent (Gemini with function calling, Cloudflare Queues) answers questions, proposes edits behind /confirm, and judges automated photo restorations.",
    tech: ["React 19", "TypeScript", "Cloudflare Workers", "Cloudflare Queues", "Gemini", "GitHub Actions", "Python", "PyTorch", "Hugging Face Transformers", "OpenCV", "WebGL"],
    imageUrl: "/images/comicSnaps1.png",
    gallery: [
      "/images/comicSnaps2.png",
      "/images/comicSnaps3.png",
      "/images/comicSnaps4.png",
      "/images/comicSnaps5.png",
      "/images/comicSnaps6.png",
      "/images/comicSnaps7.png",
    ],
  },
  {
    name: "Criterion Club",
    slug: "criterion-club",
    url: "https://www.criterionclub.org",
    repo: "https://github.com/jekrch/film-club",
    startYear: 2023,
    description: "A data-driven home for a long-running film club.",
    summary:
      "The site for a film club running since 2020: upcoming picks, where to stream them, every member's scores and reviews, and stats on the club's taste. Members sign in with Google and edit on the site; a Cloudflare Worker verifies the token and commits changes through the GitHub API, and a GitHub Actions pipeline enriches films from OMDb and TMDb and rebuilds the static site.",
    tech: ["React 19", "TypeScript", "Cloudflare Workers", "Google sign-in", "JWT", "GitHub Actions", "Python", "pandas", "Highcharts", "PWA"],
    imageUrl: "/images/filmclub1.png",
    gallery: [
      "/images/filmclub2.png",
      "/images/filmclub3.png",
      "/images/filmclub4.png",
      "/images/filmclub5.png",
    ],
  },
  {
    name: "JuxtaGlobe",
    slug: "juxtaglobe",
    url: "https://juxtaglobe.com",
    repo: "https://github.com/jekrch/juxtaglobe",
    startYear: 2025,
    description: "A dual-globe map for exploring Earth's antipodes.",
    summary:
      "Two linked 3D globes for exploring the point on the opposite side of the Earth, comparing the scale of any two places, and viewing prehistoric maps from Pangea to the present. View state lives in the URL for sharing.",
    tech: ["React 19", "TypeScript", "Three.js", "react-globe.gl", "Tailwind CSS", "PWA"],
    imageUrl: "/images/juxtaglobe1.png",
    gallery: [
      "/images/juxtaglobe2.png",
      "/images/juxtaglobe5.png",
      "/images/juxtaglobe3.png",
      "/images/juxtaglobe4.png",
    ],
  },
  {
    name: "GB Meter",
    slug: "gb-meter",
    url: "https://gbmeter.com",
    repo: "https://github.com/jekrch/energy-meter",
    startYear: 2025,
    description: "Turn Green Button utility data into energy insights.",
    summary:
      "A client-side analytics tool that parses Green Button XML and CSV utility exports, joins hourly usage with Open-Meteo temperature data, and answers questions about usage patterns through flexible aggregations and charts. Everything runs in the browser with IndexedDB and optional Google Drive storage.",
    tech: ["React 19", "TypeScript", "Recharts", "IndexedDB", "Google Drive API", "Open-Meteo"],
    imageUrl: "/images/gbmeter2.png",
    gallery: [
      "/images/gbmeter1.png",
      "/images/gbmeter3.png",
      "/images/gbmeter4.png",
    ],
  },
  {
    name: "ChordBuildr",
    slug: "chordbuildr",
    url: "https://chordbuildr.com",
    repo: "https://github.com/jekrch/chord-buildr",
    startYear: 2020,
    description: "Create and share chord progressions in the browser.",
    summary:
      "A browser tool for building, playing and sharing chord progressions, with guitar and ukulele diagrams, Roman numeral analysis, synth playback, and PNG chart export. Progressions are encoded in the URL, so it needs no backend.",
    tech: ["React 19", "TypeScript", "Tone.js", "Tonal", "shadcn/ui", "Vitest", "GitHub Actions"],
    imageUrl: "/images/chordbuildr3.png",
    gallery: [
      "/images/chordbuildr1.png",
      "/images/chordbuildr2.png",
      "/images/chordbuildr6.png",
      "/images/chordbuildr7.png",
      "/images/chordbuildr4.png",
      "/images/chordbuildr5.png",
      "/images/chordbuildrios.jpg",
    ],
  },
]

// The other pages on the site, for page titles, llms.txt, and the static profile.
export const otherPages = [
  {
    name: "Logic Lectures",
    slug: "logiclectures",
    summary:
      "Lecture slides and syllabus from the introductory symbolic logic course Jacob designed and taught as a graduate student at the University of Wisconsin–Madison.",
  },
  {
    name: "Music",
    slug: "music",
    summary: "Short songs Jacob has recorded between bands.",
  },
]

export const elsewhere = [
  {
    name: "My top 10 comics of 2025",
    url: "https://comics.jacobkrch.com",
  },
]

// <title> and meta description for each hash route
export function pageMeta(slug: string): { title: string, description: string } {
  const project = projects.find(p => p.slug === slug)
  if (project) return { title: `${project.name} | ${person.name}`, description: project.description }
  const page = otherPages.find(p => p.slug === slug)
  if (page) return { title: `${page.name} | ${person.name}`, description: page.summary }
  return { title: `${person.name} | ${person.jobTitle}`, description: person.description }
}
