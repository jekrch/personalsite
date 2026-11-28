import { FC } from "react"
import "../App.css"
import {
  Container,
} from "reactstrap"
import "bootstrap/dist/css/bootstrap.min.css"
import ImageCarousel from "./ImageCarousel"
import PageHeader from "./PageHeader"
import MermaidDiagram from "./MermaidDiagram"
import ProjectSources, { Integration, StackLayer, projectSourceSections } from "./ProjectSources"
import SectionNav, { SectionHeading } from "./SectionNav"

const architectureChart = `flowchart TD
  utility([Utility portal])
  file[Green Button XML · CSV]
  parse[Parser: DOMParser · PapaParse]
  readings[Readings in memory]
  gis[Google sign-in]
  agg[Aggregation: chunked on idle]
  worker[Web Worker: rankings]
  charts[Charts · insights · tables]
  export[CSV · JSON export]
  zip([ZIP code])
  geo[Open-Meteo geocoding]
  weather[Open-Meteo historical weather]
  wcache[(IndexedDB: weather cache)]

  subgraph saved[Saved datasets]
    local[(IndexedDB: five recent)]
    drive[(Your Google Drive folder)]
  end

  utility -->|download| file
  file -->|import| parse
  parse --> readings
  readings <-->|"save · reopen · merge"| saved
  gis -->|drive.file token| drive
  readings --> agg
  readings --> worker
  readings --> export
  export -.->|re-import| parse
  agg --> charts
  worker --> charts
  zip --> geo
  geo -->|coordinates| weather
  weather -->|hourly temps| wcache
  wcache -->|"overlay · temp filters"| agg

  classDef teal fill:#5b8592,stroke:#3f5e69,color:#ffffff
  classDef gray fill:#e5e7eb,stroke:#9ca3af,color:#374151
  classDef ext fill:#f3f4f6,stroke:#9ca3af,color:#4b5563
  class parse,readings,agg teal
  class local,wcache,worker,charts,export gray
  class utility,file,drive,gis,zip,geo,weather ext
`

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
        startYear={2025}
      />
      <Container style={{ fontFamily: "Helvetica", fontSize: 14 }}>
        <SectionNav sections={[{ id: "overview", label: "Overview" }, { id: "architecture", label: "Architecture" }, ...projectSourceSections]} />

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

        <SectionHeading id="architecture" title="Architecture" className="mt-10" />
        <p>
          GB Meter is a static React app on GitHub Pages with no backend. Hourly usage data says a lot about when a household is home, asleep, or away, so I didn't want it passing through a server of mine. Every import, merge, and aggregation happens in the browser, and the only places a dataset is saved are the browser's own IndexedDB and, if you sign in, a folder in your own Google Drive.
        </p>
        <p>
          A Green Button export is ESPI XML, which the browser's DOMParser reads directly. CSV exports go through PapaParse, with the date, usage, and unit columns detected automatically, since every utility lays these out a little differently. Both end up as the same list of readings, and that list is what gets saved, merged, charted, and exported.
        </p>
        <MermaidDiagram chart={architectureChart} />
        <p>
          A few years of fifteen minute readings is a few hundred thousand rows, and every filter change re-aggregates all of them. The analysis runs in chunks scheduled with requestIdleCallback, so the page keeps responding to input while it works, and the top rankings are computed in a Web Worker because sorting every bucket blocked the UI on large datasets.
        </p>
        <p>
          The weather overlay sends Open-Meteo a ZIP code for geocoding and then the coordinates and date range for hourly temperatures. It never sends any usage data. Temperatures are cached in IndexedDB so reopening a dataset doesn't fetch them again. Drive sync uses the drive.file scope, which only gives the app access to files it created, and Drive datasets are cached locally by their modifiedTime, so reopening one makes no network request unless it was changed on another device.
        </p>

        <ProjectSources integrations={integrations} stack={stack} />
      </Container>
    </div>
  )
}


export default GbMeter;
