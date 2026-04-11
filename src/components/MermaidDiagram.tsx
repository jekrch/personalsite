import { FC, useEffect, useRef, useState } from "react"
import mermaid from "mermaid"

mermaid.initialize({
  startOnLoad: false,
  theme: "base",
  securityLevel: "loose",
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
})

interface MermaidDiagramProps {
  chart: string
  className?: string
}

const MermaidDiagram: FC<MermaidDiagramProps> = ({ chart, className }) => {
  const ref = useRef<HTMLDivElement>(null)
  const [svg, setSvg] = useState<string>("")
  const idRef = useRef(`mermaid-${Math.random().toString(36).slice(2, 11)}`)

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

  return (
    <div
      ref={ref}
      className={className}
      style={{
        background: "rgba(91, 133, 146, 0.06)",
        border: "1px solid rgba(91, 133, 146, 0.15)",
        borderRadius: "0.5rem",
        padding: "1.25rem",
      }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}

export default MermaidDiagram
