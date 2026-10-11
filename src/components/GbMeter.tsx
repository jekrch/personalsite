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
  "/images/gbmeter1.png",
  "/images/gbmeter2.png",
  "/images/gbmeter3.png",
  "/images/gbmeter4.png",
]

const integrations: Integration[] = [
  { name: "Green Button", url: "https://www.greenbuttondata.org/", provides: "Standard utility export (ESPI XML) with interval usage and cost", calledFrom: "Browser (file import)" },
  { name: "Open-Meteo Historical Weather API", url: "https://open-meteo.com/en/docs/historical-weather-api", provides: "Hourly outdoor temperatures for the weather overlay", calledFrom: "Browser" },
  { name: "Open-Meteo Geocoding API", url: "https://open-meteo.com/en/docs/geocoding-api", provides: "ZIP code to coordinates for the weather lookup", calledFrom: "Browser" },
  { name: "Google Identity Services", url: "https://developers.google.com/identity/gsi/web", provides: "OAuth token for optional Drive sync (drive.file scope)", calledFrom: "Browser" },
  { name: "Google Drive API", url: "https://developers.google.com/drive/api", provides: "Stores datasets in a folder in the user's own Drive", calledFrom: "Browser" },
  { name: "Umami", url: "https://umami.is", provides: "Privacy-friendly page analytics", calledFrom: "Browser" },
]

const stack: StackLayer[] = [
  { layer: "Frontend", tech: "React 19, TypeScript, Vite" },
  { layer: "UI & charts", tech: "Tailwind CSS 4, Recharts, Lucide icons" },
  { layer: "Parsing", tech: "DOMParser for Green Button XML, PapaParse for CSV with auto-detected columns" },
  { layer: "Storage", tech: "All client-side: IndexedDB for recent datasets and cached weather, optional Google Drive folder (no backend)" },
  { layer: "Hosting", tech: "GitHub Pages (custom domain)" },
  { layer: "Tooling & tests", tech: "Bun, bun test, happy-dom, fake-indexeddb, ESLint" },
]

const GbMeter: FC = () => {

  return (
    <div className="App mb-24">
      <PageHeader
        mainLink="https://gbmeter.com/"
        mainLinkText="gbmeter.com"
        githubLink="https://github.com/jekrch/energy-meter"
        githubText="(github)"
      />
      <Container style={{ fontFamily: "Helvetica", fontSize: 14 }}>
        <SectionNav sections={[{ id: "overview", label: "Overview" }, ...projectSourceSections]} />

        <SectionHeading id="overview" title="Overview" />
        <div className="mb-6">
          <p>
            After having a heat pump installed in our old Minneapolis house, I started paying close attention to our energy bill in order to get a better sense of our usage patterns and to understand where we might be able to improve efficiency. While the utility company provided a basic breakdown of our monthly consumption, I was looking for something more granular and visual that could help me track trends over time.
          </p>
          <p>
           This led me to create GB Meter. 
          </p>
        </div>
        <ImageCarousel
          items={imagePaths}
          className="!min-h-[30em] !max-h-[30em]"
        />
        <div className="mt-8">
          <p>
            I learned that our utility company, like many others in the US, provides access to detailed hourly energy usage data through the Green Button initiative. This data is available in a standardized XML format, which makes it relatively straightforward to download. However, I wasn't able to find any free tools that could parse the data in the complex ways that I really wanted. 
          </p>
          <p>
            I wanted to answer questions like: on average, which hours of the day am I using the most and least energy? And how does that answer change according to different months, years, outdoor temperature-ranges? Or during what months are my average weekday nighttime usage levels highest? Questions like this require aggregating and visualizing large amounts of data in flexible ways, which is where GB Meter comes in.
          </p>
          <p>
            After building out the initial version for myself, I wanted to make it accessible to a wider audience. After discussing the concept with a few friends, including one in the energy efficiency space, I worked on incorporating temperature data from Open-Meteo, and providing a user friendly set of questions that users could click on to generate complex filters/aggregations that answered those questions visually and intuitively.
          </p>
          <p>
            I'm still actively developing GB Meter and am open to feedback and suggestions. My hope is that it can serve as a useful tool for other homeowners like myself who are looking to better understand and manage their energy consumption.
          </p>
        </div>

        <ProjectSources integrations={integrations} stack={stack} />
      </Container>
    </div>
  )
}


export default GbMeter;
