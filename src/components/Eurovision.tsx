import { FC } from "react"
import "../App.css"
import {
  Container,
} from "reactstrap"
import "bootstrap/dist/css/bootstrap.min.css"
import ImageCarousel from "./ImageCarousel"
import PageHeader from "./PageHeader"
import MermaidDiagram from "./MermaidDiagram"
import ProjectSources, { Integration, StackLayer, projectSourceSections } from "./ProjectSources"
import SectionNav, { SectionHeading } from "./SectionNav"

const architectureChart = `flowchart TD
  user([Browser])
  wiki[Wikipedia]
  scraper[eurovision-scraper: Scrapy]
  scripts[Data scripts: Python · Go]
  ranker[(eurovision-ranker repo)]
  pages[GitHub Pages: React SPA + CSVs]
  apiRepo[(eurovision-api repo · private)]
  ghcr[GHCR image]
  tf[Terraform · private infra repo]
  yt[YouTube]
  brevo[Brevo]

  subgraph droplet[DigitalOcean droplet]
    caddy[Caddy: TLS + reverse proxy]
    api[Go API]
    pg[(Postgres 16 · block volume)]
  end

  wiki -->|crawl| scraper
  scraper -->|"votes · results · participants"| scripts
  scripts -->|commit| ranker
  ranker -->|deploy| pages
  user -->|load app| pages
  user -->|embedded videos| yt
  user -->|accounts| caddy
  caddy --> api
  api --> pg
  api -->|email| brevo
  apiRepo -->|Actions build| ghcr
  ghcr -->|"pull + restart"| api
  tf -->|"provisions · cloud-init"| droplet
  caddy ~~~ apiRepo

  classDef teal fill:#5b8592,stroke:#3f5e69,color:#ffffff
  classDef gray fill:#e5e7eb,stroke:#9ca3af,color:#374151
  classDef ext fill:#f3f4f6,stroke:#9ca3af,color:#4b5563
  class ranker,scraper,apiRepo,api teal
  class scripts,pages,ghcr,tf,caddy,pg gray
  class wiki,yt,brevo,user ext
  style droplet fill:#f7fafb,stroke:#5b8592,stroke-dasharray:4 3,color:#3f5e69
`

const imagePaths = [
  "/images/eurovision-ranker1.png",
  "/images/eurovision-ranker2.png",
  "/images/eurovision-ranker3.png",
  "/images/eurovision-ranker4.png",
  "/images/eurovision-ranker5.png",
  "/images/eurovision-ranker6.png",
  "/images/eurovision-ranker7.png",
  "/images/eurovision-ranker8.png"
]

const integrations: Integration[] = [
  { name: "Wikipedia", url: "https://en.wikipedia.org/wiki/Eurovision_Song_Contest", provides: "Contestants, songs, results, and voting history back to 1956", calledFrom: "eurovision-scraper" },
  { name: "YouTube", url: "https://www.youtube.com", provides: "Performance videos, thumbnails, and generated playlists", calledFrom: "Browser" },
  { name: "Flagcdn", url: "https://flagcdn.com", provides: "Country flags for ranking images (Flags API as fallback)", calledFrom: "Browser" },
  { name: "Brevo", url: "https://www.brevo.com", provides: "Transactional email for account verification and password resets", calledFrom: "Eurovision API" },
  { name: "Umami", url: "https://umami.is", provides: "Privacy-friendly page analytics", calledFrom: "Browser" },
]

const stack: StackLayer[] = [
  { layer: "Frontend", tech: "React 18, TypeScript, Vite" },
  { layer: "UI & state", tech: "Tailwind CSS 3, Redux Toolkit, Headless UI, @hello-pangea/dnd (drag-and-drop), React Joyride (tour), React Simple Maps (heat map), Font Awesome" },
  { layer: "Ranking state", tech: "Encoded in the URL so rankings are shareable without an account; pako for compressed sorter state" },
  { layer: "Contest data", tech: "CSV files parsed in the browser with PapaParse; Python and Go scripts to maintain them; Scrapy spiders (eurovision-scraper) to collect contest data from Wikipedia" },
  { layer: "Accounts API", tech: "Go, gorilla/mux, pgx, golang-migrate, JWT auth; PostgreSQL 16 (saved rankings and groups)" },
  { layer: "Hosting", tech: "GitHub Pages (custom domain), installable PWA via vite-plugin-pwa; API in Docker on a DigitalOcean droplet (provisioned with Terraform) behind Caddy, image built to GHCR by GitHub Actions" },
  { layer: "Tooling & tests", tech: "Bun, Vitest, Testing Library, ESLint, Prettier" },
]

const EurovisionRanker: FC = () => {
  return (
    <div className="App mb-24">

      <PageHeader
        mainLink="https://www.eurovision-ranker.com"
        mainLinkText="eurovision-ranker.com"
        githubLink="https://github.com/jekrch/eurovision-ranker"
        githubText="(github)"
        startYear={2022}
      />

      <Container style={{ fontFamily: "helvetica", fontSize: 14 }}>
        <SectionNav sections={[{ id: "overview", label: "Overview" }, { id: "architecture", label: "Architecture" }, ...projectSourceSections]} />

        <SectionHeading id="overview" title="Overview" />
        <p>
          Eurovision Ranker is a web app that makes it easy to rank your favorite Eurovision contestants for each contest year going back to 1956. The ranking is stored in the URL so you can save it for later reference or share it with friends. There's a "tour" on the site that demos other features: e.g. you can generate YouTube playlists, explore the official voting results from previous years, view a heat map of your ranking, and other functions that I've added per requests from the Eurovision fan community.
        </p>
        <p>
          When I first started working on this back in 2022 (roughly the time that I became a believer in this weird event) there were no modern, easily accessible tools for facilitaing viewer rankings. My partner, Jenny, and I would write out the contestants on pieces of paper so we could rearrange them while we debated. 
        </p> 
        <p className="mb-10">
          The lack of tooling back then was a bit surprising. After all, the 2023 Eurovision Song Contest finale drew 168 million viewers, eclipsing the Super Bowl of that same year by over 50 million! Viewers play a critical role in determining the winner over 3 separate events where they cast votes deciding the fates of around 50 contestants. So unsurprisingly, much of the social media surrounding the event is focused on ranking artists in various categories. In short, the contest seemed to be crying out for a solution here, and this app has been my ever-evolving reply. 
        </p>

        <ImageCarousel items={imagePaths} className="min-h-[20em] lg:min-h-[35em] md:min-h-[35em] sm:min-h-[25em] max-sm:min-h-[25em]" />
        <SectionHeading id="architecture" title="Architecture" className="mt-10" />
        <p>
          The ranker is a static React app on GitHub Pages. Its contest data comes from my <a href="https://github.com/jekrch/eurovision-scraper" target="_blank" rel="noopener noreferrer">eurovision-scraper</a>, a set of Scrapy spiders that crawl Wikipedia, and Python and Go scripts turn that output into the CSV files the app ships with. Rankings live in the URL, so the API is only needed for optional accounts with saved rankings and groups. It's written in Go and lives in a private repo.
        </p>
        <p>
          To keep hosting cheap, the API, Postgres 16, and Caddy (for TLS) run on one small DigitalOcean droplet. Terraform in a private repo provisions it with a firewall, a reserved IP, and a block volume for the database, and cloud-init sets up Docker Compose on first boot.
        </p>
        <MermaidDiagram chart={architectureChart} />
        <p>
          GitHub Actions runs the Go tests on each push to main and publishes an image to GHCR tagged with the commit SHA. A release pulls that image on the droplet and restarts only the API container. Migrations are embedded in the binary and run on startup. To roll back, I re-tag an earlier image; schema fixes go forward as new migrations.
        </p>
        <p>
          The droplet is a single point of failure, but only for accounts. If it goes down, people can still rank and share full ranking URLs; they lose sign-in, saved rankings, groups, and short share links. The database lives on a block volume that Terraform won't destroy, so recovering from a lost droplet means re-running Terraform, which reattaches the volume and the reserved IP.
        </p>

        <ProjectSources integrations={integrations} stack={stack} />
      </Container>
    </div>
  )
}


export default EurovisionRanker