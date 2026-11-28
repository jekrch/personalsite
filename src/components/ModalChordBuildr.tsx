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
import { SqlQueryCard } from "./SqlQuery"
import { chordDbQueries } from "./chordDbQueries"

const architectureChart = `flowchart TD
  user([Browser])
  json[(Static JSON: modes · chords · scales)]
  deploy[GitHub Action: build · deploy]
  pages[GitHub Pages]
  sf[MIDI.js soundfonts]
  ls[(localStorage: song library)]
  drive[(Google Drive JSON file)]
  gis[Google sign-in]
  llm([LLM clients])

  subgraph compose[Docker Compose · local]
    flyway[Flyway migrations]
    db[(Postgres: chord-db views · voice-leading)]
    gen[Python exporter]
    api[Go API]
    mcp[MCP server]
  end

  flyway -->|"schema · seed · views"| db
  db -->|query views| gen
  gen -->|commit| json
  json --> deploy
  deploy --> pages
  pages -->|"app + JSON"| user
  sf -->|samples| user
  user <-->|autosave| ls
  user <-->|"save · load"| drive
  gis -->|drive.file token| drive
  db --> api
  db --> mcp
  mcp -->|progressions| llm

  classDef teal fill:#5b8592,stroke:#3f5e69,color:#ffffff
  classDef gray fill:#e5e7eb,stroke:#9ca3af,color:#374151
  classDef ext fill:#f3f4f6,stroke:#9ca3af,color:#4b5563
  class db,gen,json teal
  class flyway,api,mcp,deploy,pages,ls gray
  class user,sf,drive,gis,llm ext
`

const imagePaths = [
  "/images/modal1.png",
  "/images/modal2.png",
  "/images/modal3.png",
  "/images/modal4.png",
  "/images/modal7.png",
  "/images/modal5.png",
  "/images/modal6.png",
]

const integrations: Integration[] = [
  { name: "MIDI.js Soundfonts", url: "https://github.com/gleitz/midi-js-soundfonts", provides: "MusyngKite instrument samples for playback", calledFrom: "Browser" },
  { name: "Google Identity Services", url: "https://developers.google.com/identity/gsi/web", provides: "OAuth token for optional Drive sync (drive.file scope)", calledFrom: "Browser" },
  { name: "Google Drive API", url: "https://developers.google.com/drive/api", provides: "Saves and loads the song library as a JSON file in the user's own Drive", calledFrom: "Browser" },
  { name: "Umami", url: "https://umami.is", provides: "Privacy-friendly page analytics", calledFrom: "Browser" },
]

const stack: StackLayer[] = [
  { layer: "Frontend", tech: "React 18, TypeScript, Vite" },
  { layer: "UI & state", tech: "Tailwind CSS 4, Zustand, Headless UI, dnd-kit (progression reordering), Heroicons, Lucide icons" },
  { layer: "Music & audio", tech: "Web Audio via soundfont-player, Tonal (chord parsing), VexFlow (staff notation), react-piano, @tonejs/midi (MIDI export), html-to-image (song sheet export)" },
  { layer: "Theory engine", tech: "PostgreSQL views for chord, scale, and mode relations; voice-leading graph and progression pathfinding in SQL; Flyway migrations. The database is open source as chord-db; the rest of the app is closed source" },
  { layer: "API & MCP", tech: "Go, pgx, MCP Go SDK (streamable HTTP and stdio) for prompting progressions from LLM clients" },
  { layer: "Data pipeline", tech: "Python (psycopg2) exports the database views to static JSON for the frontend" },
  { layer: "Hosting", tech: "GitHub Pages, deployed by GitHub Actions; the live site reads the static JSON, so no server is needed" },
  { layer: "Tooling & tests", tech: "Docker Compose, Bun, Vitest, Testing Library, ESLint, Prettier, SQL tests" },
]

const ChordBuildr: FC = () => {

  return (
    <div className="App mb-24">
      <PageHeader
        mainLink="https://modal.chordbuildr.com/"
        mainLinkText="modal.chordbuildr.com"
        githubLink="https://github.com/jekrch/chord-db"
        githubText="(database on github)"
        startYear={2021}
      />
      <Container style={{ fontFamily: "Helvetica", fontSize: 14 }}>
        <SectionNav sections={[{ id: "overview", label: "Overview" }, { id: "architecture", label: "Architecture" }, { id: "database", label: "Database" }, ...projectSourceSections]} />

        <SectionHeading id="overview" title="Overview" />
        <div className="mb-6">
          <p>
            After creating ChordBuildr, which focused on sharing and transcribing chord progressions, I began thinking about how I could use similar tools to enhance my music writing experience.
          </p>

        </div>
        <ImageCarousel
          items={imagePaths}
          className="!min-h-[30em] !max-h-[30em]"
        />
        <div className="mt-8">
          <p>
            When I write music, I tend to start with a chord progression: i.e. the underlying infrastructure of the piece. This is typically an exploratory process, where I experiment with different chords and phrasings in various sequences until I find something novel that starts to inspire melodic and rhythmic ideas.

          </p>
          <p>
            One of my biggest hurdles is finding interesting new progressions through this process. I think many of us have a tendency to repeat ourselves here, sticking to what's familiar and what worked before. This can be an important part of developing your own personal style, but it can also quickly suck the life out of your creative process.
          </p>
          <p>
            When I'm in such a rut, I'll look for ways to "surprise" myself with progressions I wouldn't intuitively reach for. Modal ChordBuildr was designed first and foremost to drive this kind of creative process.
          </p>
          <p>
            When a user specifies their mode and key, Modal ChordBuildr quickly generates a broad array of chords within those constraints, allowing the user to sample each chord, add it to their progression, and reorder on the fly. 
          </p>
          <p>
            A major point of creative control comes from manipulating the mode. On my own, I tend to stick to your classic major (Ionian) and minor (Aeolian) scales, but switching briefly to something less familiar can unlock really interesting harmonic ideas. 
          </p>
          <p>
            Adding a sequencer, midi recording, and extended synthesizer effects add further texture here. At least in my case, all of this helps me to break out of stale habits, and into that interesting new stuff that makes composing music so inspiring and fun.
          </p>
          <p>
            Most recently, I've added features that allow users to create song sheets with lyrics and playable chords. These can be saved and loaded either locally or via Google Drive, so you can store your work between sessions and share with others. 
          </p>
          <p> 
            This was motivated by my own experiences, transcribing chord charts for songs I wanted to learn and perform with others. This kind of work is finicky and intuitive, and having the right tools can make a huge difference. I hope to continue enhancing this with features that I find useful in my own composition process, and that others find useful in theirs.
          </p>
        </div>

        <SectionHeading id="architecture" title="Architecture" className="mt-10" />
        <p>
          The music theory lives in Postgres. Flyway builds the schema of notes, chord types, scales, and modes, then a set of views works out which chords fit each key and mode. That database is open source as{" "}
          <a href="https://github.com/jekrch/chord-db" target="_blank" rel="noopener noreferrer">chord-db</a>.
        </p>
        <p>
          The live site doesn't talk to the database at all. A Python script queries the views and writes the results out as static JSON, one file of chords and one of scales per mode, and those files are committed alongside the frontend. A GitHub Action builds the React app with that JSON bundled in and deploys it to GitHub Pages, so there's no server to run or pay for. Chords beyond what the views produce are generated in the browser from the same scale data, so they get correct note names.
        </p>
        <MermaidDiagram chart={architectureChart} />
        <p>
          Everything else runs client-side too. Instrument samples come from the MIDI.js soundfonts and play through Web Audio. The song library autosaves to localStorage, and signing in with Google adds a copy as a JSON file in your own Drive.
        </p>
        <p>
          The same Docker Compose setup also runs a Go API and an MCP server over the database. These expose the voice-leading engine, a SQL function that searches for the smoothest progression from a starting chord, so I can prompt for progressions from an LLM client. They only run locally for now.
        </p>

        <section className="mt-10">
          <SectionHeading id="database" title="Database" />
          <p>
            The theory engine is a Postgres database of chords, scales, and modes, published as{" "}
            <a href="https://github.com/jekrch/chord-db" target="_blank" rel="noopener noreferrer">chord-db</a>.
            A few queries against its views:
          </p>
          <div className="grid gap-3 lg:grid-cols-3">
            {chordDbQueries.map(q => <SqlQueryCard key={q.id} sample={q} />)}
          </div>
        </section>

        <ProjectSources integrations={integrations} stack={stack} />
      </Container>
    </div>
  )
}


export default ChordBuildr;
