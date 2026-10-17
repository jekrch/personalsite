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
  "/images/chordbuildr1.png",
  "/images/chordbuildr2.png",
  "/images/chordbuildr3.png",
  "/images/chordbuildr6.png",
  "/images/chordbuildr7.png",
  "/images/chordbuildr4.png",
  "/images/chordbuildr5.png",
]

const integrations: Integration[] = [
  { name: "chords-db", url: "https://github.com/tombatossals/chords-db", provides: "Guitar and ukulele chord fingerings, with multiple positions per chord", calledFrom: "Bundled (npm)" },
  { name: "tonejs-instruments", url: "https://github.com/nbrosowsky/tonejs-instruments", provides: "Electric guitar, nylon guitar, and harp samples", calledFrom: "Bundled (npm), loaded on demand" },
  { name: "Umami", url: "https://umami.is", provides: "Privacy-friendly page analytics", calledFrom: "Browser" },
]

const stack: StackLayer[] = [
  { layer: "Frontend", tech: "React 19, TypeScript, Vite 8 (Rolldown), React Router 8" },
  { layer: "UI", tech: "Tailwind CSS 3, shadcn/ui (Radix primitives, cmdk), dnd-kit (drag-to-reorder chords and sections), Lucide icons, Web Animations API transitions" },
  { layer: "Export", tech: "html-to-image (renders the chord chart to a downloadable PNG)" },
  { layer: "Music & audio", tech: "Tone.js (synth voices and samplers), Tonal (notes and Roman numeral progressions), react-chords (guitar/ukulele diagrams)" },
  { layer: "State", tech: "Progressions encoded in the URL for saving and sharing (no backend)" },
  { layer: "Hosting", tech: "GitHub Pages (custom domain)" },
  { layer: "Tooling & tests", tech: "Bun, Vitest (jsdom), ESLint, GitHub Actions CI" },
]

const ChordBuildr: FC = () => {

  return (
    <div className="App mb-24">
      <PageHeader
        mainLink="https://chordbuildr.com/"
        mainLinkText="chordbuildr.com"
        githubLink="https://github.com/jekrch/chord-buildr"
        githubText="(github)"
        startYear={2020}
      />
      <Container style={{ fontFamily: "Helvetica", fontSize: 14 }}>
        <SectionNav sections={[{ id: "overview", label: "Overview" }, ...projectSourceSections]} />

        <SectionHeading id="overview" title="Overview" />
        <div className="mb-10">
          ChordBuildr is a project I started with{" "}
          <a href="https://www.linkedin.com/in/teran-keith-210941107/" target="_blank" rel="noopener noreferrer">
            Teran Keith
          </a>{" "}
          to make it easy for musicians and music enthusiasts to create,
          share, and experiment with chord progressions.
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


export default ChordBuildr;
