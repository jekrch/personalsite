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
  user([User])
  tg[Telegram Bot]
  cf[Cloudflare Worker]
  repo[(GitHub Repo)]
  metaAction[GitHub Action: metadata]
  embAction[GitHub Action: embeddings]
  meta[Metadata: pHash · CIELAB · dims]
  wiki[MediaWiki API]
  vine[Comic Vine API]
  emb[Embeddings: SigLIP · DINOv2 · VGG-16]
  pages[GitHub Pages]

  user -->|submit panel| tg
  tg --> cf
  cf -->|commit| repo
  repo --> pages
  repo --> metaAction
  repo --> embAction
  metaAction --> meta
  metaAction --> wiki
  metaAction --> vine
  embAction --> emb

  classDef teal fill:#5b8592,stroke:#3f5e69,color:#ffffff
  classDef gray fill:#e5e7eb,stroke:#9ca3af,color:#374151
  classDef ext fill:#f3f4f6,stroke:#9ca3af,color:#4b5563
  class repo,metaAction,embAction teal
  class tg,cf,pages,meta,emb gray
  class wiki,vine,user ext
`

const imagePaths = [
  "/images/comicSnaps1.png",
  "/images/comicSnaps2.png",
  "/images/comicSnaps3.png",
  "/images/comicSnaps4.png",
  "/images/comicSnaps5.png",
  "/images/comicSnaps6.png",
  "/images/comicSnaps7.png",
]

const integrations: Integration[] = [
  { name: "Telegram Bot API", url: "https://core.telegram.org/bots/api", provides: "Panel submissions and captions (webhook)", calledFrom: "Cloudflare Worker" },
  { name: "GitHub API", url: "https://docs.github.com/en/rest", provides: "Commits images and gallery data to the repo", calledFrom: "Cloudflare Worker" },
  { name: "MediaWiki API", url: "https://www.mediawiki.org/wiki/API:Main_page", provides: "Artist and series descriptions from Wikipedia", calledFrom: "Metadata Action" },
  { name: "Comic Vine API", url: "https://comicvine.gamespot.com/api/", provides: "Fallback descriptions, publisher, start year, issue count, artist birth/death years, covers", calledFrom: "Metadata Action" },
  { name: "Metron API", url: "https://metron.cloud", provides: "Artist and series backfill, per-issue creator credits, series covers", calledFrom: "Metadata Action" },
  { name: "Hugging Face Hub", url: "https://huggingface.co", provides: "SigLIP (google/siglip-base-patch16-224) and DINOv2 (facebook/dinov2-small) weights", calledFrom: "Embeddings Action" },
  { name: "PyTorch Hub", url: "https://pytorch.org/vision/stable/models.html", provides: "VGG-16 ImageNet weights for Gram-matrix style embeddings", calledFrom: "Embeddings Action" },
]

const stack: StackLayer[] = [
  { layer: "Frontend", tech: "React 19, TypeScript, Vite" },
  { layer: "UI & visualization", tech: "Tailwind CSS 4, React Flow (similarity graph), Recharts (stats), OGL (WebGL), Lucide icons" },
  { layer: "Ingest", tech: "Telegram bot webhook → Cloudflare Worker (Wrangler)" },
  { layer: "Data pipeline", tech: "GitHub Actions, Python 3.12, Pillow, ImageHash (pHash), scikit-image (CIELAB), NumPy" },
  { layer: "ML models", tech: "PyTorch, torchvision, Hugging Face Transformers, scikit-learn (PCA); SigLIP, DINOv2, VGG-16" },
  { layer: "Storage", tech: "JSON and images committed to the GitHub repo (no database)" },
  { layer: "Hosting", tech: "GitHub Pages" },
  { layer: "Tooling & tests", tech: "Bun, Vitest, pytest" },
]

const ComicSnaps: FC = () => {
  return (
    <div className="App mb-24">

      <PageHeader
        mainLink="https://snaps.jacobkrch.com"
        mainLinkText="snaps.jacobkrch.com"
        githubLink="https://github.com/jekrch/comic-snaps"
        githubText="(github)"
        startYear={2025}
      />

      <Container style={{ fontFamily: "helvetica", fontSize: 14 }}>
        <SectionNav sections={[{ id: "overview", label: "Overview" }, { id: "architecture", label: "Architecture" }, ...projectSourceSections]} />

        <SectionHeading id="overview" title="Overview" />
        <p>
        Comic Snaps is a web app I built for myself and friends to collect and document comic book panels we like. With comics being a short-form serialized medium, it's easy to find yourself swiming in a sea of different artists, colorists, writers, letterers. Despite my love of various titles, I often found it difficult to keep track of the creators behind them. Comic Snaps has made this a breeze; leveraging automation and some generous public integrations to handle all of the leg-work. 
        </p>
        <p>
        I've also used this project as an opportunity to try out different kinds of open-source neural network vision models and offer some interactive and educational primers on how they work.
        </p>

        <ImageCarousel items={imagePaths} className="!min-h-[27em] !max-h-[30em]" />

        <SectionHeading id="architecture" title="Architecture" className="mt-10" />
        <p>
        I wanted automation to handle as much of the posting process as possible, and I wanted it to cost nothing to run. Sort of like code golf for cheapskates! I was also curious about image embedding models. Neural network image processing sounds computationally expensive, but purpose-built, moderately sized models can be surprisingly efficient when deployed correctly.
        </p>

        <p>
        Here's the ingestion pipeline I ended up with: images and captions get posted to a Telegram channel, where a Telegram bot webhook picks them up and passes them to a Cloudflare Worker. The Worker commits the images and metadata directly to the GitHub repo. A GitHub Action then rebuilds the static frontend (React, TypeScript, Vite, and Tailwind), which is hosted on GitHub Pages.
        </p>

        <MermaidDiagram chart={architectureChart} className="my-6 flex justify-center [&_svg]:max-w-full [&_svg]:h-auto" />

        <p>
        On the backend, another GitHub Action runs a Python script after each relevant repo update to compute metadata and neural network embeddings for new panels. The basic metadata covers pixel dimensions, dominant CIELAB colors, perceptual hashes (pHash), and a colorfulness metric that separates black-and-white art from color. The script also pulls artist and series descriptions from the MediaWiki API, then falls back to the Comic Vine API to fill in whatever's still missing and add fields like publisher, start year, issue count, and artist birth/death years.
        </p>

        <p>
        For more interesting visual categorization, the script generates three kinds of embeddings. SigLIP (768 dimensions) handles conceptual and semantic similarity, and DINOv2 (384 dimensions) handles structure and composition. VGG-16 Gram matrices, reduced with PCA, capture mark-making style (hatching, stippling, inking) regardless of what the panel depicts.
        </p>

        <p>
        The frontend uses these embeddings for sorting and browsing. You can arrange the gallery into greedy nearest-neighbor chains using any of the distance metrics, or open a force-directed similarity graph of the whole collection, where node positions and edge thickness show how close panels are in composition, meaning, or rendering style.
        </p>

        <p>
          It's been an interesting project to build out, and the simple pipeline makes posting easy to fit into my weekly comic book habit. I wrote up what I've learned about each image model in an explainer modal, which you can open from any of the similarity graphs. If you have questions or ideas for new features, feel free to reach out.
        </p>

        <ProjectSources integrations={integrations} stack={stack} />
      </Container>
    </div>
  )
}

export default ComicSnaps