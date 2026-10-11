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
        Comic Snaps is a web app I built for myself and friends to collect comic book panels we like. It's also been my excuse to try out different kinds of neural network image processing.
        </p>

        <ImageCarousel items={imagePaths} className="!min-h-[27em] !max-h-[30em]" />

        <p className="mt-4">
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
      </Container>
    </div>
  )
}

export default ComicSnaps