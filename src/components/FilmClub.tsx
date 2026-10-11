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
        <SectionNav sections={[{ id: "overview", label: "Overview" }, ...projectSourceSections]} />

        <SectionHeading id="overview" title="Overview" />
        <p>
        Criterion Club is the site for a film club I've been part of since it started in 2020. It shows what we're watching next, where to stream it, who picks after that, and every film we've already seen, with each member's score and review. Film details come from OMDb and TMDb, and together with our scores they feed a set of stats on our picks and rating habits. Members can also keep their own lists, log films they watch outside the club, and react to and comment on each other's entries.
        </p>

        <ImageCarousel items={imagePaths} className="!min-h-[27em] !max-h-[30em]" />

        <p className="mb-4 mt-4">
        Most of our members aren't developers, so they needed a way to add films, scores, and reviews without writing code, editing JSON, or learning Git. Another favorite requirement of mine: all of this needs to cost exactly 0 dollars, with a humble exception made for the domain (.org probably gives my price point away). 
        </p> 

        <p className="mb-4">
        The first version was built around the Google Sheet we already used to track our films. Members added an IMDb ID, rating, and review to a row, and a GitHub workflow read the sheet twice a day, fetched the film's details, and redeployed the site.
        </p>

        <p className="mb-4">
        I've since replaced the sheet with editing on the site itself. Members sign in with Google, and a Cloudflare Worker verifies the token, matches the account to a club member, validates the change, and commits it to the repo through the GitHub API. Each commit triggers a build, so edits go live in about a minute. The worker and CI write to separate files, with CI merging member edits into the film data at build time, so there are no conflicts to resolve. The site itself is still static and only talks to the worker while someone is editing. The sync still reads the old sheet for historical data, but new content goes through the site.
        </p>

        <ProjectSources integrations={integrations} stack={stack} />
      </Container>
    </div>
  )
}


export default FilmClub