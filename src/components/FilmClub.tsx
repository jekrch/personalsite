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
        Criterion Club is a web app that I made for several reasons. First and foremost, it's a fun way to organize and celebrate a film club that I've been a part of since its founding in 2020. The site provides an informative anchor for the club: telling us what our next film is, where to watch it, who's selecting next, and reminding us what we've already seen. I've leveraged our data, with the help of OMDb, to produce a wide array of interesting stats about our films and scoring patterns, which gives us a unique data-driven perspective on our journey through film history. 
        </p>

        <ImageCarousel items={imagePaths} className="!min-h-[27em] !max-h-[30em]" />

        <h4 className="my-4">
          An Approachable design
        </h4>

        <p className="mb-4 mt-4">
          One interesting challenge was figuring out how to simply and efficiently enable my fellow club members to update the site themselves: e.g. adding new films, scores, reviews etc. Given that most of them have no previous experience with this kind of web development, I needed something that wouldn't require them to write code, fiddle with JSON, or learn Git.  
        </p>

        <p className="mb-4">
        The solution I landed on was to leverage something familiar: Google Sheets. We already had a shared spreadsheet where we tracked our watched films, so I built an automated pipeline around it. Now all anyone has to do is add a film's IMDb ID to the sheet along with their rating and review. My GitHub workflow picks up these changes twice daily, fetches rich film data from the OMDB API, transforms everything into the format the site needs, and automatically deploys the updated version.
        </p>

        <p className="mb-4">
        This system has been a huge win. Contributing to the site is as easy as filling in a spreadsheet cell. No need to touch code or understand how the site works under the hood. The automation handles the tedious parts like fetching poster images, formatting data, and pushing changes to production.
        </p>

        <h4 className="mb-4">
          Experiments in AI-driven development
        </h4>

        <p className="mb-4">
        Now beyond the practical purpose behind this project, I also used it as an opportunity to see how far I could push AI tools in a real development workflow. From initial concept to production, I leaned heavily on Claude 3.7 Sonnet (with thinking enabled) and Gemini 2.5 to accelerate and enhance my work.
        </p>

        <p className="mb-4">
        The results were honestly pretty eye-opening. I got the main site up and running in a weekend, then expanded its functionality significantly—including the entire Google Sheets sync behavior—within just two weeks. That's way faster than I could have managed solo.
        </p>

        <p className="mb-4">
        The AI tools initially shined when handling repetitive, tedious tasks. I had them generate scripts for extracting and formalizing our club data from various sources. But they also helped me work through edge cases in the sync pipeline that I might have missed. When I hit roadblocks with the google sheets integration, they suggested workable solutions that saved me hours of debugging.
        </p>

        <p className="mb-4">
        For the frontend, I experimented with creating rough UI mockups and wireframes based on requirements in one prompt, then used those as starting points for new prompts that fleshed out broader design implementations. This iterative approach let me quickly pivot when something wasn't working visually.
        </p>

        <p className="mb-4">
        The process wasn't without frustrations. Sometimes the AI would confidently suggest approaches that were unworkable or unnecessarily complex: e.g. trying to recreate functionality that was already well maintained in popular libraries. I still had to verify and test everything thoroughly. But the boost in productivity from having an always-available coding partner to bounce ideas off of and generate starter code was undeniable.
        </p>

        <p className="mb-4">
        What impressed me most was how this workflow let me focus more on the creative and architectural aspects while the AI handled much of the implementation grunt work. Instead of getting bogged down writing boilerplate (i.e. initial tailwind/vite configs) or struggling with highchart quirks, I could think more about maintainability, user experience, and the overall structure.
        </p>

        <p className="mb-4">
        This is an ongoing project, but I've been genuinely impressed with how this AI-assisted approach has worked out. I see huge potential here for developers who know how to effectively direct AI tools while maintaining the critical thinking necessary to evaluate and refine their output. In my opinion, the future here is definitely not about replacing development skills—it's about amplifying them.
        </p>


        <div className="mt-10" />
      </Container>
    </div>
  )
}


export default FilmClub