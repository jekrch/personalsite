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
  "/images/modal1.png",
  "/images/modal2.png",
  "/images/modal3.png",
  "/images/modal4.png",
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
  { layer: "Theory engine", tech: "PostgreSQL views for chord, scale, and mode relations; voice-leading graph and progression pathfinding in SQL; Flyway migrations" },
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
        githubLink="https://github.com/jekrch/chord-analyzr"
        githubText="(github)"
      />
      <Container style={{ fontFamily: "Helvetica", fontSize: 14 }}>
        <SectionNav sections={[{ id: "overview", label: "Overview" }, ...projectSourceSections]} />

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

        <ProjectSources integrations={integrations} stack={stack} />
      </Container>
    </div>
  )
}


export default ChordBuildr;
