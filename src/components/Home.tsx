import { FC } from "react"
import { Container } from "reactstrap"
import ProjectCarousel from "./ProjectCarousel"
import Banner from "./Banner";

const projects = [
  {
    name: "PlantyJ",
    imageUrl: "/images/plantyj1.png",
    pageLink: "/#plantyj",
    url: "plantyj.com",
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
    name: "ChordBuildr",
    imageUrl: "/images/chordbuildr3.png",
    pageLink: "/#chordbuildr",
    url: "chordbuildr.com",
    gallery: [
      "/images/chordbuildr1.png",
      "/images/chordbuildr2.png",
      "/images/chordbuildr4.png",
      "/images/chordbuildr5.png",
      "/images/chordbuildrios.jpg",
    ]
  },
  {
    name: "Modal ChordBuildr",
    imageUrl: "/images/modal1.png",
    pageLink: "/#modal-chordbuildr",
    url: "modal.chordbuildr.com",
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
    name: "Criterion Club",
    imageUrl: "/images/filmclub1.png",
    pageLink: "/#criterion-club",
    url: "criterionclub.org",
    gallery: [
      "/images/filmclub2.png",
      "/images/filmclub3.png",
      "/images/filmclub4.png",
    ]
  },
  {
    name: "JuxtaGlobe",
    imageUrl: "/images/juxtaglobe1.png",
    pageLink: "/#juxtaglobe",
    url: "juxtaglobe.com",
    gallery: [
      "/images/juxtaglobe2.png",
      "/images/juxtaglobe3.png",
    ]
  },
    {
    name: "GB Meter",
    imageUrl: "/images/gbmeter2.png",
    pageLink: "/#gb-meter",
    url: "gbmeter.com",
    gallery: [
      "/images/gbmeter1.png",
      "/images/gbmeter3.png",
      "/images/gbmeter4.png",
    ]
  },
  {
    name: "Comic Snaps",
    imageUrl: "/images/comicSnaps1.png",
    pageLink: "/#comic-snaps",
    url: "snaps.jacobkrch.com",
    gallery: [
      "/images/comicSnaps2.png",
      "/images/comicSnaps3.png",
      "/images/comicSnaps4.png",
    ]
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
      <Banner
        href="https://comics.jacobkrch.com"
        title="I made a list →"
        subtitle="What were my fav comics from 2025?"
        images={[
          "/images/comics/assorted-crisis-events-1.jpg",
          "/images/comics/beneath-the-trees-1.jpg",
          "/images/comics/invisible-man-3.jpg",
          "/images/comics/were-taking-everyone-down-2.jpg",
        ]}
      />
     
      <Banner
        href="/#logiclectures"
        title="Logic Lectures"
        subtitle="Learn or teach symbolic logic with my"
        images={[
          "/images/logic1.png",
          "/images/logic2.png",
          "/images/logic3.png",
        ]}
        imageScale={2}
        disableRotation={true}
        accentColor="#564A3E"
        frames={[
          { top: -5, left: 10, right: 10, bottom: -5, opacity: 0.35 },
        ]}
      />

      <Banner
        href="/#music"
        title="Music"
        subtitle="Check out my soundcloud!"
        images={[
          "/images/music1.png",
          "/images/music1.png",
        ]}
        imageScale={1}
        disableRotation={false}
        accentColor="#466EDD"
      />
    </Container>
  )
}

export default Home