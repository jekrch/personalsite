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
        One of the key goals for the app was to leverage automation to simplify the user experience, while at the same time keeping costs at zero. Sort of like code golf for cheapskates! I also wanted to use the project as an opportunity to explore different types of image embedding models. While you might expect image processing via neural networks to be computationally intensive, the truth is that the more purpose-built, moderately sized models can be surprisingly efficient when deployed correctly. 
        </p>

        <p>
        The final streamlined ingestion pipeline that I landed on looked like this: images and captions are submitted in a Telegram channel which are picked up by a Telegram bot webhook, and then routed through a Cloudflare Worker which commits the images and metadata directly to the GitHub repo. A GithHub action then triggers a rebuild of the static frontend, which is implemented with React, TypeScript, Vite, and Tailwind, and hosted on GitHub Pages.
        </p>

        <MermaidDiagram chart={architectureChart} className="my-6 flex justify-center [&_svg]:max-w-full [&_svg]:h-auto" />

        <p>
        On the backend, another GitHub Action runs a python script following each relevant repo update to compute metadata and neural network embeddings for new panels. Basic metadata extraction includes calculating pixel dimensions, dominant CIELAB colors, perceptual hashes (pHash), and a colorfulness metric to distinguish between black-and-white and color art. Additionally, the script integrates with the MediaWiki API to auto-populate artist and series descriptions, falling back to the Comic Vine API to fill in any remaining gaps along with supplemental fields like publisher, start year, issue count, and artist birth/death years.
        </p>

        <p>
        To enable some more interesting visual categorization, the system generates three distinct types of embeddings. It uses SigLIP (768-dimensional) for conceptual and semantic similarity, DINOv2 (384-dimensional) for structural and compositional alignment, and VGG-16 Gram matrices (reduced via PCA) to capture mark-making styles (e.g. hatching, stippling, and inking) independent of the panel's subject matter.
        </p>

        <p>
        These embeddings power the frontend's sorting and discovery features. The gallery can be organized into greedy nearest-neighbor chains based on any of the computed distance metrics. Furthermore, users can open a force-directed similarity graph to explore the collection, where node positioning and edge thickness visually represent the mathematical distance between different compositions, semantic meanings, or rendering styles.
        </p>

        <p>
          It's been an interesting project to build out, and the simple pipeline has made it easy to incorporate the posting process with my weekly comic book habit. I spent some time compiling what I've learned about each image model in an explainer modal that you can access from each similarity graph. If you have any questions or ideas for new features, feel free to reach out.
        </p>
      </Container>
    </div>
  )
}

export default ComicSnaps