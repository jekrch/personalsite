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
  cf[Cloudflare Worker: fetch + cron]
  kv[(KV: job queue + cache)]
  gem[Gemini API]
  repo[(GitHub Repo)]
  metaAction[GitHub Action: metadata + BioCLIP]
  meta[Metadata: pHash · CIELAB · dims]
  emb[BioCLIP: 512-d embeddings · ToL species ID]
  enrich[GBIF · POWO · Wikipedia]
  pages[GitHub Pages]

  user -->|photo / command| tg
  tg --> cf
  cf -->|queue LLM jobs| kv
  cf -->|"/ask · /analyze"| gem
  cf -->|commit| repo
  repo --> pages
  repo --> metaAction
  metaAction --> meta
  metaAction --> emb
  metaAction --> enrich

  classDef teal fill:#5b8592,stroke:#3f5e69,color:#ffffff
  classDef gray fill:#e5e7eb,stroke:#9ca3af,color:#374151
  classDef ext fill:#f3f4f6,stroke:#9ca3af,color:#4b5563
  class repo,metaAction teal
  class tg,cf,kv,pages,meta,emb gray
  class gem,enrich,user ext
`

const imagePaths = [
    "/images/plantyj1.png",
    "/images/plantyj2.png",
    "/images/plantyj8.png",
    "/images/plantyj3.png",
    "/images/plantyj4.png",
    "/images/plantyj5.png",
    "/images/plantyj6.png",
    "/images/plantyj7.png",
    ]

const PlantyJ: FC = () => {
  return (
    <div className="App mb-24">

      <PageHeader
        mainLink="https://plantyj.com"
        mainLinkText="plantyj.com"
        githubLink="https://github.com/jekrch/plantyJ"
        githubText="(github)"
      />

      <Container style={{ fontFamily: "helvetica", fontSize: 14 }}>
        <p>
        PlantyJ is the project I built right after Comic Snaps for my partner Jenny. Jenny has a long standing interest in native ecology, permaculture, and urban environmental conservation, and over the last five years she's made remarkable progress on our property, building out mutually sustaining food webs and teaching me a lot about how Minnesota's biodiversity is all woven together. The app is an agentic garden journal: a way to record what's growing where, watch it change across the seasons, and ask questions about the whole collection in plain English.
        </p>

        <ImageCarousel items={imagePaths} className="!min-h-[27em] !max-h-[30em]" />

        <p className="mt-4">
        This is driven from a Telegram group. Jenny snaps a plant with a short caption and it lands on the site as a static gallery entry, with the plant, its zone, and its tags parsed out of the caption. She can ask the bot a question about the collection (which natives are still missing a tag, which zones don't have a photo yet, what caption to use for a new posting) and it answers from a live rollup of every plant, zone, and photo. And if she describes a change in plain English, or just asks a question whose answer implies one, the bot drafts a numbered list of its own commands to make that change and waits for a /confirm before anything is written. That last part is the agentic piece: it proposes, you approve, it runs in the background.
        </p>

        <p>
        Like Comic Snaps, one of the goals was to lean on automation so the day to day experience is just taking photos and typing questions, while keeping the running cost at zero. There's no database and no server I pay for. The repo is the database, the static site reads JSON straight out of it, and every heavier feature is bolted on as a GitHub Action or a cron driven Cloudflare Worker.
        </p>

        <p>
        The ingestion pipeline is similar in spirit to Comic Snaps. Photos and commands sent to the Telegram bot are picked up by a webhook and routed through a Cloudflare Worker, which commits images and metadata directly to the GitHub repo. A GitHub Action then rebuilds the static frontend, which is React, TypeScript, Vite, and Tailwind, hosted on GitHub Pages. The wrinkle here is the agent. Anything that needs an LLM (the question answering, the change proposals, the ecological analysis) is never run inside the webhook. The worker writes a job to a KV backed queue and returns immediately, and a one minute cron drains that queue, calls Gemini, and posts the result back to Telegram. Gemini calls routinely take ten to sixty seconds, well past a webhook timeout, so decoupling them through the queue is what makes the agent usable at all.
        </p>

        <MermaidDiagram chart={architectureChart} className="my-6 flex justify-center [&_svg]:max-w-full [&_svg]:h-auto" />

        <p>
        On the backend, another GitHub Action runs a Python script whenever the plant data changes. It backfills per image metadata (pixel dimensions, perceptual hashes for a duplicates view, and dominant CIELAB colors for a hue based color sort), and it runs every new photo through BioCLIP, a vision model fine tuned on the Tree of Life dataset. BioCLIP gives two things: a 512 dimensional embedding used for similarity sorting that clusters by species and visual form, and a Tree of Life species prediction written back into the record with a confidence score. The same job enriches each species from GBIF for canonical taxonomy and vernacular names, POWO for native range, and Wikipedia for a description, with each source gated so re-runs only hit each API once and a third party hiccup never fails the build.
        </p>

        <p>
        Expanding on the agentic component, I added an ecological fit analysis. For every plant or animal paired with the zone it was photographed in, the bot can produce a short write up of how well that specimen fits that niche, grounded against Google Search so the cited sources can't be hallucinated, and tagged with a GOOD, BAD, or MIXED verdict. Those run through Gemini's Batch API to keep the cost down, so it's a submit then poll workflow, and the verdicts surface on the site in the organism info drawer, on the phylogenetic tree, and as a filter on the gallery.
        </p>

        <p>
        The frontend has a few ways to move through the collection beyond the gallery: a pan and zoom phylogenetic tree built from the GBIF taxonomy, per plant and per zone spotlight views, and an info drawer that pulls together the full taxonomic lineage, native range, a Wikipedia summary, the BioCLIP prediction with a sanity check against the manually recorded species, and outbound links to GBIF, POWO, iNaturalist, and NatureServe. There's also a stats view with a biodiversity donut and an activity timeline so you can see the collection grow over time.
        </p>

        <p>
        After capturing a number of ecological relationships, I added a view that depicts them through a force directed graph, with every plant and animal as a node and typed edges running between them: host plant, pollinator, predator and prey, seed forager, fruit and nut consumer, and so on. The relationships and the relationship types themselves are managed from Telegram, so as Jenny records who eats what and which insect lays its eggs on which plant, the food web she's been building in the yard turns into something you can actually see and pull apart. You can filter the graph down to a single relationship type, search for an organism, pan and zoom around it, and click any node to open the same detail panel the phylogenetic tree uses. The selected node is encoded in the URL as well, so a particular slice of the web is just a link you can send to someone.
        </p>

        <p>
        It's been a genuinely useful thing to build. The Telegram first flow means Jenny can log a plant from the garden on her phone without thinking about any of the machinery behind it, and watching the food web she's built turn into a queryable, photographed record has been its own reward. If you have questions or ideas for new features, feel free to reach out.
        </p>
      </Container>
    </div>
  )
}

export default PlantyJ
