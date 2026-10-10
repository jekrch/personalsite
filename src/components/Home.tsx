import { FC } from "react"
import { Container } from "reactstrap"
import ProjectCarousel from "./ProjectCarousel"
import Banner from "./Banner";
import { ComicPile, IndexCardProof, MiniPlayer } from "./BannerVisuals";

const projects = [
  {
    name: "PlantyJ",
    imageUrl: "/images/plantyj1.png",
    pageLink: "/#plantyj",
    url: "plantyj.com",
    description: "An agentic garden journal maintained with prompts and photos",
    gallery: [
      "/images/plantyj2.png",
      "/images/plantyj3.png",
      "/images/plantyj4.png",
      "/images/plantyj5.png",
      "/images/plantyj6.png",
      "/images/plantyj7.png",
      "/images/plantyj8.png",
    ]
  },
  {
    name: "Modal ChordBuildr",
    imageUrl: "/images/modal1.png",
    pageLink: "/#modal-chordbuildr",
    url: "modal.chordbuildr.com",
    description: "Explore modal chord progressions for songwriting.",
    gallery: [
      "/images/modal2.png",
      "/images/modal3.png",
      "/images/modal4.png",
      "/images/modal5.png",
      "/images/modal6.png",
    ]
  },
  {
    name: "Eurovision Ranker",
    imageUrl: "/images/eurovision-ranker3.png",
    pageLink: "/#eurovision-ranker",
    url: "eurovision-ranker.com",
    description: "Rank and share Eurovision contestants from every year.",
    gallery: [
      "/images/eurovision-ranker1.png",
      "/images/eurovision-ranker2.png",
      "/images/eurovision-ranker4.png",
      "/images/eurovision-ranker5.png",
      "/images/eurovision-ranker6.png",
      "/images/eurovision-ranker7.png",
      "/images/eurovision-ranker8.png",
    ]
  },
  {
    name: "Comic Snaps",
    imageUrl: "/images/comicSnaps1.png",
    pageLink: "/#comic-snaps",
    url: "snaps.jacobkrch.com",
    description: "Collect comic panels with neural-network image analysis.",
    gallery: [
      "/images/comicSnaps2.png",
      "/images/comicSnaps3.png",
      "/images/comicSnaps4.png",
      "/images/comicSnaps5.png",
      "/images/comicSnaps6.png",
      "/images/comicSnaps7.png",
    ]
  },
  {
    name: "Criterion Club",
    imageUrl: "/images/filmclub1.png",
    pageLink: "/#criterion-club",
    url: "criterionclub.org",
    description: "A data-driven home for a long-running film club.",
    gallery: [
      "/images/filmclub2.png",
      "/images/filmclub3.png",
      "/images/filmclub4.png",
      "/images/filmclub5.png",
    ]
  },
  {
    name: "JuxtaGlobe",
    imageUrl: "/images/juxtaglobe1.png",
    pageLink: "/#juxtaglobe",
    url: "juxtaglobe.com",
    description: "A dual-globe map for exploring Earth's antipodes.",
    gallery: [
      "/images/juxtaglobe2.png",
      "/images/juxtaglobe5.png",
      "/images/juxtaglobe3.png",
      "/images/juxtaglobe4.png",
    ]
  },
    {
    name: "GB Meter",
    imageUrl: "/images/gbmeter2.png",
    pageLink: "/#gb-meter",
    url: "gbmeter.com",
    description: "Turn Green Button utility data into energy insights.",
    gallery: [
      "/images/gbmeter1.png",
      "/images/gbmeter3.png",
      "/images/gbmeter4.png",
    ]
  },
  {
    name: "ChordBuildr",
    imageUrl: "/images/chordbuildr3.png",
    pageLink: "/#chordbuildr",
    url: "chordbuildr.com",
    description: "Create and share chord progressions in the browser.",
    gallery: [
      "/images/chordbuildr1.png",
      "/images/chordbuildr2.png",
      "/images/chordbuildr4.png",
      "/images/chordbuildr5.png",
      "/images/chordbuildrios.jpg",
    ]
  },
];

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
        I'm a software engineer and architect based in Minneapolis who's interested in technology, music, and philosophy. Check out the links to see some of my current and past projects.
      </div>
      
      {/* Project showcase carousel */}
      <div className="mb-5">
        <ProjectCarousel 
          projects={projects as any}
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