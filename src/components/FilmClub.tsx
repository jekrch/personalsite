import { FC } from "react"
import "../App.css"
import {
  Container,
} from "reactstrap"
import "bootstrap/dist/css/bootstrap.min.css"
import ImageCarousel from "./ImageCarousel"
import PageHeader from "./PageHeader"

const imagePaths = [
  "/images/filmclub1.png",
  "/images/filmclub2.png",
  "/images/filmclub3.png",
  "/images/filmclub4.png",
  "/images/filmclub5.png",
]

const FilmClub: FC = () => {
  return (
    <div className="App mb-24">

      <PageHeader
        mainLink="https://www.criterionclub.org"
        mainLinkText="criterionclub.org"
        githubLink="https://github.com/jekrch/film-club"
        githubText="(github)"
      />

      <Container style={{ fontFamily: "helvetica", fontSize: 14 }}>
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

        <div className="mt-10" />
      </Container>
    </div>
  )
}


export default FilmClub