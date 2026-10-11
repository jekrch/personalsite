import { FC } from "react"
import "../App.css"
import {
  Container,
} from "reactstrap"
import "bootstrap/dist/css/bootstrap.min.css"
import ImageCarousel from "./ImageCarousel"
import PageHeader from "./PageHeader"
import ProjectSources, { Integration, StackLayer, projectSourceSections } from "./ProjectSources"
import SectionNav, { SectionHeading } from "./SectionNav"

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
  { name: "Eurovision Dataset", url: "https://github.com/Spijkervet/eurovision-dataset", provides: "Contestants, songs, lyrics, and voting history back to 1956 (compiled from Eurovisionworld)", calledFrom: "Data scripts (CSV)" },
  { name: "YouTube", url: "https://www.youtube.com", provides: "Performance videos, thumbnails, and generated playlists", calledFrom: "Browser" },
  { name: "Flagcdn", url: "https://flagcdn.com", provides: "Country flags for ranking images (Flags API as fallback)", calledFrom: "Browser" },
  { name: "Brevo", url: "https://www.brevo.com", provides: "Transactional email for account verification and password resets", calledFrom: "Eurovision API" },
  { name: "Umami", url: "https://umami.is", provides: "Privacy-friendly page analytics", calledFrom: "Browser" },
]

const stack: StackLayer[] = [
  { layer: "Frontend", tech: "React 18, TypeScript, Vite" },
  { layer: "UI & state", tech: "Tailwind CSS 3, Redux Toolkit, Headless UI, @hello-pangea/dnd (drag-and-drop), React Joyride (tour), React Simple Maps (heat map), Font Awesome" },
  { layer: "Ranking state", tech: "Encoded in the URL so rankings are shareable without an account; pako for compressed sorter state" },
  { layer: "Contest data", tech: "CSV files parsed in the browser with PapaParse; Python and Go scripts to maintain them" },
  { layer: "Accounts API", tech: "Go, gorilla/mux, pgx, golang-migrate, JWT auth; PostgreSQL 16 (saved rankings and groups)" },
  { layer: "Hosting", tech: "GitHub Pages (custom domain), installable PWA via vite-plugin-pwa; API in Docker on a DigitalOcean droplet behind Caddy, image built to GHCR by GitHub Actions" },
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
      />

      <Container style={{ fontFamily: "helvetica", fontSize: 14 }}>
        <SectionNav sections={[{ id: "overview", label: "Overview" }, ...projectSourceSections]} />

        <SectionHeading id="overview" title="Overview" />
        <p>
          The Eurovision Ranker is a web app that makes it easy to rank your favorite Eurovision contestants for each contest year going back to 1956. The ranking is stored in the URL so you can save it for later reference or share it with friends. There's a "tour" on the site that demos other features: e.g. you can generate YouTube playlists, explore the official voting results from previous years, and view a heat map of your ranking.
        </p>
        <p className="mb-10">
          The Eurovision Song Contest finale drew 168 million viewers in 2023, eclipsing the Super Bowl of that same year by over 50 million. Viewers play a critical role in determining the winner over 3 separate events involving around 50 contestants. Unsurprisingly, much of the social media surrounding the event is focused on ranking artists in various categories. Despite this, there are currently no modern, easily-accessible tools for facilitating viewer rankings. This, along with my own love of the contest, inspired me to create this app.
        </p>

        <ImageCarousel items={imagePaths} className="min-h-[20em] lg:min-h-[35em] md:min-h-[35em] sm:min-h-[25em] max-sm:min-h-[25em]" />
        <ProjectSources integrations={integrations} stack={stack} />
      </Container>
    </div>
  )
}


export default EurovisionRanker