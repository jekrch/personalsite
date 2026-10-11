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
  "/images/juxtaglobe1.png",
  "/images/juxtaglobe2.png",
  "/images/juxtaglobe5.png",
  "/images/juxtaglobe3.png",
  "/images/juxtaglobe4.png",
]

const integrations: Integration[] = [
  { name: "PALEOMAP PaleoAtlas", url: "https://doi.org/10.5281/zenodo.5460860", provides: "C. R. Scotese's prehistoric Earth maps, Triassic to Cretaceous (CC BY 4.0)", calledFrom: "Bundled textures" },
  { name: "three-globe", url: "https://github.com/vasturiano/three-globe", provides: "Modern Earth day texture and topology bump map (via unpkg)", calledFrom: "Browser" },
  { name: "Esri World Imagery", url: "https://www.arcgis.com/home/item.html?id=10df2279f9684e4a9f6a7f08febac2a9", provides: "Satellite map tiles when zoomed in", calledFrom: "Browser" },
  { name: "OpenStreetMap", url: "https://www.openstreetmap.org", provides: "Street map tiles", calledFrom: "Browser" },
  { name: "Photon", url: "https://photon.komoot.io", provides: "Place search and geocoding", calledFrom: "Browser" },
  { name: "ipapi", url: "https://ipapi.co", provides: "Approximate location from IP to center the first globe", calledFrom: "Browser" },
  { name: "Google Maps", url: "https://www.google.com/maps", provides: "Outbound links to open either point", calledFrom: "Browser" },
  { name: "Umami", url: "https://umami.is", provides: "Privacy-friendly page analytics", calledFrom: "Browser" },
]

const stack: StackLayer[] = [
  { layer: "Frontend", tech: "React 19, TypeScript, Vite, React Router" },
  { layer: "3D rendering", tech: "Three.js via react-globe.gl, with slippy-map tile layers" },
  { layer: "UI", tech: "Tailwind CSS 4, Lucide icons, React Icons" },
  { layer: "State", tech: "View state (mode, both points, altitude, tiles) kept in URL params for sharing" },
  { layer: "Hosting", tech: "GitHub Pages (custom domain), installable PWA via vite-plugin-pwa" },
  { layer: "Tooling", tech: "Bun, ESLint" },
]

const JuxtaGlobe: FC = () => {

  return (
    <div className="App mb-24">
      <PageHeader
        mainLink="https://juxtaglobe.com/"
        mainLinkText="juxtaglobe.com"
        githubLink="https://github.com/jekrch/juxtaglobe"
        githubText="(github)"
        startYear={2025}
      />
      <Container style={{ fontFamily: "Helvetica", fontSize: 14 }}>
        <SectionNav sections={[{ id: "overview", label: "Overview" }, ...projectSourceSections]} />

        <SectionHeading id="overview" title="Overview" />
        <div className="mb-10">

          <p>
            JuxtaGlobe is a fun little project that I created out of my own curiosity about what's on the other side of the earth from me. The answer, I'm sorry to say, is almost always water! That's right, only about 5% of land on earth is antipodal to land.
          </p>
          <p>
            Once the disappointment of this awkward discovery had worn off, I thought about what else I could do with this dual globe layout. I've often wondered how my home town and current town compare with respect to their relative scale. So I added a dual point feature to compare any two places. I also added prehistoric maps to compare our world across time, from Pangea to the present.
          </p>
          <p>
            I thought the result satisfied my "spacial" curiosities in novel ways. I hope you can have some similar fun with it. If you have any interesting ideas about where to take it next, feel free to reach out or start contributing on on github.
          </p>
        </div>
        <ImageCarousel
          items={imagePaths}
          className="!min-h-[30em] !max-h-[30em]"
        />
        <ProjectSources integrations={integrations} stack={stack} />
      </Container>
    </div>
  )
}


export default JuxtaGlobe;
