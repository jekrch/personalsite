import { FC } from "react"
import "../App.css"
import {
  Container,
} from "reactstrap"
import "bootstrap/dist/css/bootstrap.min.css"
import ImageCarousel from "./ImageCarousel"
import PageHeader from "./PageHeader"
import MermaidDiagram from "./MermaidDiagram"

const architectureChart = `flowchart TD
  user([User])
  tg[Telegram Bot]
  cf[Cloudflare Worker]
  repo[(GitHub Repo)]
  action[GitHub Action<br/>Python pipeline]
  meta[Metadata<br/>pHash · CIELAB · dims]
  wiki[MediaWiki API]
  emb[Embeddings<br/>SigLIP · DINOv2 · VGG-16]
  pages[GitHub Pages<br/>React frontend]

  user -->|submit panel| tg
  tg --> cf
  cf -->|commit| repo
  repo --> pages
  repo --> action
  action --> meta
  action --> emb
  action --> wiki

  classDef teal fill:#5b8592,stroke:#3f5e69,color:#ffffff
  classDef gray fill:#e5e7eb,stroke:#9ca3af,color:#374151
  classDef ext fill:#f3f4f6,stroke:#9ca3af,color:#4b5563
  class repo,action teal
  class tg,cf,pages,meta,emb gray
  class wiki,user ext
`

const imagePaths = [
  "/images/comicSnaps1.png",
  "/images/comicSnaps2.png",
  "/images/comicSnaps3.png",
  "/images/comicSnaps4.png",
]

const ComicSnaps: FC = () => {
  return (
    <div className="App mb-24">

      <PageHeader
        mainLink="https://snaps.jacobkrch.com"
        mainLinkText="snaps.jacobkrch.com"
        githubLink="https://github.com/jekrch/comic-snaps"
        githubText="(github)"
      />

      <Container style={{ fontFamily: "helvetica", fontSize: 14 }}>
        <p>
        Comic Snaps is a web app that I built for myself and friends to collect panels that we like from comic books and explore the capabilities of different types of neural network based image processing.
        </p>

        <ImageCarousel items={imagePaths} className="!min-h-[27em] !max-h-[30em]" />

        <p className="mt-4">
        The app uses a streamlined ingestion pipeline: images and captions are submitted in a Telegram channel which are picked up by a Telegram bot, and then routed through a Cloudflare Worker and committed directly to the GitHub repo. A GH action then automatically triggers a rebuild of the static frontend, which is built with React, TypeScript, Vite, and Tailwind, and hosted on GitHub Pages.
        </p>

        <MermaidDiagram chart={architectureChart} className="my-6 flex justify-center [&_svg]:max-w-full [&_svg]:h-auto" />

        <p>
        On the backend, a GH Action runs a Python script upon each relevant repo update to compute metadata and neural network embeddings for new panels. Basic metadata extraction includes calculating pixel dimensions, dominant CIELAB colors, perceptual hashes (pHash), and a colorfulness metric to distinguish between black-and-white and color art. Additionally, the script integrates with the MediaWiki API to auto-populate artist and series descriptions.
        </p>

        <p>
        To enable some more interesting visual categorization, the system generates three distinct types of embeddings. It uses SigLIP (768-dimensional) for conceptual and semantic similarity, DINOv2 (384-dimensional) for structural and compositional alignment, and VGG-16 Gram matrices (reduced via PCA) to capture mark-making styles (e.g. hatching, stippling, and inking) independent of the panel's subject matter.
        </p>

        <p>
        These embeddings power the frontend's sorting and discovery features. The gallery can be organized into greedy nearest-neighbor chains based on any of the computed distance metrics. Furthermore, users can open a force-directed similarity graph to explore the collection, where node positioning and edge thickness visually represent the mathematical distance between different compositions, semantic meanings, or rendering styles.
        </p>
      </Container>
    </div>
  )
}

export default ComicSnaps