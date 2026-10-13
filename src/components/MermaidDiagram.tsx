import { FC, useCallback, useEffect, useRef, useState } from "react"
import mermaid from "mermaid"
import MermaidViewer, { DOT_GRID, CheckIcon, CopyIcon, ExpandIcon, ExternalIcon } from "./MermaidViewer"

// Shared with Mermaid Live so a diagram opens there looking like it does here
const THEME_CONFIG = {
  theme: "base",
  fontFamily: "helvetica, arial, sans-serif",
  flowchart: { htmlLabels: false },
  themeVariables: {
    background: "transparent",
    primaryColor: "#5b8592",
    primaryTextColor: "#ffffff",
    primaryBorderColor: "#3f5e69",
    lineColor: "#6b7280",
    secondaryColor: "#e5e7eb",
    tertiaryColor: "#f3f4f6",
    textColor: "#1f2937",
    edgeLabelBackground: "transparent",
  },
} as const

mermaid.initialize({
  startOnLoad: false,
  securityLevel: "loose",
  ...THEME_CONFIG,
})

const LIVE_CONFIG = JSON.stringify(THEME_CONFIG, null, 2)

// UTF-8 safe, URL-safe base64 (labels use characters like "·")
const toBase64Url = (text: string) => {
  let binary = ""
  new TextEncoder().encode(text).forEach(b => (binary += String.fromCharCode(b)))
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

// Mermaid Live reads its editor state from the hash; "base64:" is the
// uncompressed form, so the link can be built synchronously
const liveEditorUrl = (code: string) =>
  "https://mermaid.live/edit#base64:" +
  toBase64Url(JSON.stringify({ code, mermaid: LIVE_CONFIG, autoSync: true, updateDiagram: true }))

// Falls back to execCommand where the Clipboard API is unavailable
// (e.g. the dev server opened over plain http on a phone)
const writeClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const area = document.createElement("textarea")
    area.value = text
    area.setAttribute("readonly", "")
    area.style.position = "fixed"
    area.style.opacity = "0"
    document.body.appendChild(area)
    area.select()
    const ok = document.execCommand("copy")
    area.remove()
    return ok
  }
}

const useCopy = (text: string) => {
  const [copied, setCopied] = useState(false)
  const timer = useRef<number>()

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const copy = useCallback(async () => {
    if (!(await writeClipboard(text))) return
    setCopied(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setCopied(false), 1600)
  }, [text])

  return [copied, copy] as const
}

const FOOT_BTN =
  "flex h-[2.25rem] flex-none items-center gap-[0.375rem] rounded-[2px] border-0 px-[0.5rem] text-[0.65rem] font-semibold uppercase tracking-wider !text-gray-500 no-underline transition-colors duration-150 hover:bg-[rgba(91,133,146,0.1)] hover:!text-jk-teal hover:no-underline focus-visible:bg-[rgba(91,133,146,0.1)] focus-visible:!text-jk-teal focus-visible:outline-none disabled:opacity-50"

const FOOT_LABEL = "hidden xs:inline"

interface MermaidDiagramProps {
  chart: string
  // Names the diagram in its caption and in the zoom viewer
  title?: string
  className?: string
}

const MermaidDiagram: FC<MermaidDiagramProps> = ({ chart, title = "Architecture", className = "" }) => {
  const [svg, setSvg] = useState<string>("")
  const [isOpen, setIsOpen] = useState(false)
  const idRef = useRef(`mermaid-${Math.random().toString(36).slice(2, 11)}`)
  const source = chart.trim()
  const [copied, copy] = useCopy(source)
  const liveUrl = liveEditorUrl(source)

  useEffect(() => {
    let cancelled = false
    mermaid
      .render(idRef.current, chart)
      .then(({ svg }) => {
        if (cancelled) return
        const styled = svg.replace(
          "</svg>",
          `<style>
            .edgeLabel text, .edgeLabels text, g.edgeLabel text { fill: #1f2937 !important; font-weight: 500 !important; }
            .edgeLabel rect, .edgeLabel .labelBkg, .edgeLabels rect { fill: rgba(255,255,255,0.85) !important; stroke: none !important; }
          </style></svg>`,
        )
        setSvg(styled)
      })
      .catch((err) => {
        console.error("Mermaid render error:", err)
      })
    return () => {
      cancelled = true
    }
  }, [chart])

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])

  return (
    <figure className={`mx-0 mb-[2.25rem] mt-[1.75rem] overflow-hidden rounded-[2px] border-[1px] border-solid border-[rgba(91,133,146,0.22)] bg-white shadow-[0_1px_3px_rgba(38,50,54,0.06)] ${className}`}>
      <button
        type="button"
        onClick={open}
        disabled={!svg}
        aria-label={`Open ${title} diagram in zoom viewer`}
        className={`group relative block w-full cursor-zoom-in border-0 p-[1.25rem] sm:p-[1.75rem] ${svg ? "" : "min-h-[12rem]"}`}
        style={DOT_GRID}
      >
        <div
          className="flex justify-center [&_svg]:h-auto [&_svg]:max-w-full"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
        <span className="pointer-events-none absolute right-[0.625rem] top-[0.625rem] flex items-center gap-[0.375rem] rounded-[2px] bg-[rgba(91,133,146,0.92)] px-[0.5rem] py-[0.3125rem] text-[0.65rem] font-semibold uppercase tracking-wider text-white opacity-[0] shadow-[0_2px_6px_rgba(38,50,54,0.18)] transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
          <ExpandIcon className="size-[0.75rem]" />
          Zoom
        </span>
      </button>

      <figcaption className="flex items-center justify-end gap-[0.125rem] border-t-[1px] border-solid border-[rgba(91,133,146,0.18)] bg-[rgba(91,133,146,0.04)] px-[0.25rem]">

        <button
          type="button"
          onClick={copy}
          className={FOOT_BTN}
          aria-label="Copy Mermaid source"
          title="Copy Mermaid source"
        >
          {copied ? <CheckIcon className="size-[0.85rem]" /> : <CopyIcon className="size-[0.85rem]" />}
          <span className={FOOT_LABEL}>{copied ? "Copied" : "Copy"}</span>
        </button>
        <a
          href={liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={FOOT_BTN}
          aria-label="Open in Mermaid Live editor"
          title="Open in Mermaid Live editor"
        >
          <ExternalIcon className="size-[0.85rem]" />
          <span className={FOOT_LABEL}>Mermaid Live</span>
        </a>
        <button
          type="button"
          onClick={open}
          disabled={!svg}
          className={FOOT_BTN}
          aria-label="Open zoom viewer"
          title="Open zoom viewer"
        >
          <ExpandIcon className="size-[0.85rem]" />
          <span className={FOOT_LABEL}>Expand</span>
        </button>
        <span className="sr-only" aria-live="polite">{copied ? "Mermaid source copied" : ""}</span>
      </figcaption>

      <MermaidViewer
        isOpen={isOpen}
        onClose={close}
        title={title}
        svg={svg}
        renderId={idRef.current}
        liveUrl={liveUrl}
        copied={copied}
        onCopy={copy}
      />
    </figure>
  )
}

export default MermaidDiagram
