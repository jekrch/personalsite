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
  gis[Google sign-in]
  worker[Cloudflare Worker: editor API]
  repo[(GitHub Repo: JSON data)]
  deploy[GitHub Action: build on push]
  sync[GitHub Action: sheet sync · twice daily]
  sheet[Google Sheet: historical data]
  films[OMDb · TMDb]
  pages[GitHub Pages]

  user -->|sign in| gis
  user -->|"edit + ID token"| worker
  worker -->|verify token| gis
  worker -->|title search| films
  worker -->|commit| repo
  repo -->|push| deploy
  deploy -->|"new films · credits"| films
  deploy -->|"merge edits · build"| pages
  sheet -->|CSV| sync
  sync -->|film details| films
  sync -->|commit| repo
  pages -->|static site| user

  classDef teal fill:#5b8592,stroke:#3f5e69,color:#ffffff
  classDef gray fill:#e5e7eb,stroke:#9ca3af,color:#374151
  classDef ext fill:#f3f4f6,stroke:#9ca3af,color:#4b5563
  class repo,worker,deploy teal
  class sync,pages gray
  class user,gis,sheet,films ext
`

const imagePaths = [
  "/images/filmclub1.png",
  "/images/filmclub2.png",
  "/images/filmclub3.png",
  "/images/filmclub4.png",
  "/images/filmclub5.png",
]

const integrations: Integration[] = [
  { name: "OMDb API", url: "https://www.omdbapi.com", provides: "Core film details by IMDb ID; title search for the add-film picker", calledFrom: "Sync Action, editor Worker" },
  { name: "TMDb API", url: "https://developer.themoviedb.org", provides: "IMDb ID lookup, cast and crew credits, person profiles, keywords, images, trailer keys", calledFrom: "Sync Action" },
  { name: "Google Identity Services", url: "https://developers.google.com/identity/gsi/web", provides: "Member sign-in; ID tokens verified against Google's JWKS", calledFrom: "Browser, editor Worker" },
  { name: "GitHub API", url: "https://docs.github.com/en/rest", provides: "Commits member edits to the repo", calledFrom: "Editor Worker" },
  { name: "Google Sheets", url: "https://www.google.com/sheets/about/", provides: "Historical scores and reviews (CSV export of the original sheet)", calledFrom: "Sync Action" },
  { name: "YouTube", url: "https://www.youtube.com", provides: "Trailer embeds (youtube-nocookie)", calledFrom: "Browser" },
  { name: "Umami", url: "https://umami.is", provides: "Privacy-friendly page analytics", calledFrom: "Browser" },
]

const stack: StackLayer[] = [
  { layer: "Frontend", tech: "React 19, TypeScript, Vite, React Router" },
  { layer: "UI & visualization", tech: "Tailwind CSS 4, Framer Motion, Swiper, Highcharts (stats), React Flow + dagre (film connection graph), react-markdown, Heroicons" },
  { layer: "Editing", tech: "Cloudflare Worker (Wrangler), jose (JWT verification), Google sign-in" },
  { layer: "Data pipeline", tech: "GitHub Actions on a twice-daily cron and on push, Python (pandas, requests)" },
  { layer: "Storage", tech: "JSON committed to the GitHub repo; Worker and CI write separate files, merged at build" },
  { layer: "Hosting", tech: "GitHub Pages (custom domain), installable PWA via vite-plugin-pwa" },
  { layer: "Tooling & tests", tech: "Bun, Jest, Testing Library, ESLint, Prettier" },
]

const FilmClub: FC = () => {
  return (
    <div className="App mb-24">

      <PageHeader
        mainLink="https://www.criterionclub.org"
        mainLinkText="criterionclub.org"
        githubLink="https://github.com/jekrch/film-club"
        githubText="(github)"
        startYear={2023}
      />

      <Container style={{ fontFamily: "helvetica", fontSize: 14 }}>
        <SectionNav sections={[{ id: "overview", label: "Overview" }, { id: "architecture", label: "Architecture" }, ...projectSourceSections]} />

        <SectionHeading id="overview" title="Overview" />
        <p>
        Criterion Club is the site for a film club I've been part of since it started in 2020. It shows what we're watching next, where to stream it, who picks after that, and every film we've already seen, with each member's score and review. Film details come from OMDb and TMDb, and together with our scores they feed a set of stats on our picks and rating habits. Members can also keep their own lists, log films they watch outside the club, and react to and comment on each other's entries.
        </p>

        <ImageCarousel items={imagePaths} className="!min-h-[27em] !max-h-[30em]" />

        <SectionHeading id="architecture" title="Architecture" className="mt-10" />
        <p className="mb-4">
        Most of our members aren't developers, so they needed a way to add films, scores, and reviews without writing code, editing JSON, or learning Git. Another favorite requirement of mine: all of this needs to cost exactly 0 dollars, with a humble exception made for the domain (.org probably gives my price point away). 
        </p> 

        <p className="mb-4">
        The first version was built around the Google Sheet we already used to track our films. Members added an IMDb ID, rating, and review to a row, and a GitHub workflow read the sheet twice a day, fetched the film's details, and redeployed the site.
        </p>

        <p className="mb-4">
        I've since replaced the sheet with editing on the site itself. Members sign in with Google, and a Cloudflare Worker verifies the token, matches the account to a club member, validates the change, and commits it to the repo through the GitHub API. Each commit triggers a build, so edits go live in about a minute. The site stays static and only talks to the Worker while someone is editing. The old sheet is still synced for historical data, but new content goes through the site.
        </p>

        <MermaidDiagram chart={architectureChart} />

        <p className="mb-4">
        Before each build, CI adds films members submitted (with details from OMDb and TMDb), merges member edits into the film data, and caches posters for films that only appear on members' lists and watch logs.
        </p>

        <p className="mb-4">
        The Worker handles the writes, token checks, and an OMDb search proxy that keeps the API key off the client. The list of member emails is a Worker secret, since the repo is public, and an account that isn't on it can't save.
        </p>

        <ProjectSources integrations={integrations} stack={stack} />
      </Container>
    </div>
  )
}


export default FilmClub