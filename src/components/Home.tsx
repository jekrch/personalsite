import { FC } from "react"
import { Container } from "reactstrap"
import ProjectCarousel from "./ProjectCarousel"
import Banner from "./Banner";
import { ComicPile, IndexCardProof, MiniPlayer } from "./BannerVisuals";
import { person, projects as siteProjects } from "../data/site";

// carousel shape: an on-site page link plus the bare domain as the caption
const projects = siteProjects.map(p => ({
  name: p.name,
  imageUrl: p.imageUrl,
  pageLink: `/#${p.slug}`,
  url: p.url.replace(/^https?:\/\/(www\.)?/, ""),
  description: p.description,
  gallery: p.gallery,
}));

const backgroundImages = [
  "/images/trees.jpg",
  "/images/plants.jpg",
  "/images/sky.jpg"
];

// Pile order, back to front; the wide splash page goes last so it
// bleeds off the card's right edge.
const comicPages = [
  "/images/comics/assorted-crisis-events-1.jpg",
  "/images/comics/beneath-the-trees-1.jpg",
  "/images/comics/were-taking-everyone-down-2.jpg",
  "/images/comics/invisible-man-3.jpg",
];

const Home: FC = () => {
  return (
    <Container className="pb-[1em]">
      <div className="content-text my-[3em]">
        {person.intro}
      </div>
      
      {/* Project showcase carousel */}
      <div className="mb-5">
        <ProjectCarousel 
          projects={projects}
          backgroundImages={backgroundImages}
        />
      </div>
      {/* Content cards — each shows real material from what it links to,
          as an object on the card. */}
      <div className="grid gap-[3rem] mb-4 md:grid-cols-2">
        <Banner
          href="/#logiclectures"
          title="Logic Lectures"
          description="Slides from the intro course I designed and taught at UW–Madison."
        >
          <IndexCardProof />
        </Banner>

        <Banner
          href="/#music"
          title="Music"
          revealDelay={100}
          motif={1}
          description="Bite-sized songs I've recorded between bands."
        >
          <MiniPlayer src="/images/music1.png" />
        </Banner>

        <Banner
          href="https://comics.jacobkrch.com"
          title="My top 10 comics of 2025"
          description="comics.jacobkrch.com"
          className="md:col-span-2"
          revealDelay={200}
          motif={2}
        >
          <ComicPile pages={comicPages} />
        </Banner>
      </div>
    </Container>
  )
}

export default Home