import { FC } from "react"
import { Container } from "reactstrap"
import ProjectCarousel from "./ProjectCarousel"

const projects = [
  {
    name: "ChordBuildr",
    imageUrl: "/images/chordbuildr3.png", 
    pageLink: "/#chordbuildr",
    url: "chordbuildr.com"
  },
  {
    name: "Modal ChordBuildr",
    imageUrl: "/images/modal1.png", 
    pageLink: "/#modal-chordbuildr",
    url: "modal.chordbuildr.com"
  },
  {
    name: "Eurovision Ranker",
    imageUrl: "/images/eurovision-ranker3.png", 
    pageLink: "/#eurovision-ranker",
    url: "eurovision-ranker.com"
  },
  {
    name: "Criterion Club",
    imageUrl: "/images/filmclub1.png", 
    pageLink: "/#criterion-club",
    url: "criterionclub.org"
  },
  {
    name: "JuxtaGlobe",
    imageUrl: "/images/juxtaglobe1.png", 
    pageLink: "/#juxtaglobe",
    url: "juxtaglobe.com"
  }
];

const backgroundImages = [
  "/images/trees.jpg",
  "/images/plants.jpg",
  "/images/sky.jpg"
];

const Home: FC = () => {
  return (
    <Container className="pb-[1em]">
      <div className="content-text my-[3em]">
        I'm a software engineer and architect based in Minneapolis who's interested in technology, music, and philosophy. Check out the links to see some of my current and past projects.
      </div>
      
      {/* Project showcase carousel */}
      <div className="mb-5">
        <ProjectCarousel 
          projects={projects as any}
          backgroundImages={backgroundImages}
        />
      </div>

      {/* Comics Top 10 Banner */}
      <a 
        href="https://comics.jacobkrch.com" 
        className="block group no-underline"
      >
        <div className="relative overflow-hidden bg-[var(--jk-teal)] px-5 py-4 my-8 border-2 border-transparent hover:border-white/30 transition-colors">
          {/* Overlapping frame accents */}
          <div className="absolute top-2 left-2 w-12 h-12 border-2 border-white/15" />
          <div className="absolute top-4 left-4 w-12 h-12 border-2 border-white/10" />
          <div className="absolute bottom-2 right-2 w-10 h-10 border-2 border-white/15" />
          <div className="absolute bottom-4 right-4 w-10 h-10 border-2 border-white/10" />
          
          {/* Content */}
          <div className="relative z-10 text-center">
            <p className="text-white/70 text-sm m-0 mb-1">
              What are my favorite comics from 2025? 
            </p>
            <h3 className="text-white text-lg font-semibold m-0 group-hover:underline">
              I made a list →
            </h3>
          </div>
        </div>
      </a>
    </Container>
  )
}

export default Home