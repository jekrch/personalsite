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
    </Container>
  )
}

export default Home