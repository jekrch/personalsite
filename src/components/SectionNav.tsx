import { FC, useEffect, useRef } from "react"
import { Link, useSearchParams } from "react-router-dom"

export interface NavSection {
  id: string
  label: string
}

interface SectionNavProps {
  sections: NavSection[]
}

const scrollToSection = (id: string, behavior: ScrollBehavior = "smooth") => {
  document.getElementById(id)?.scrollIntoView({ behavior, block: "start" })
}

// Same stepped diamonds as PageHeader, so the section reads as part of the page chrome.
export const SectionHeading: FC<{ id: string, title: string, className?: string }> = ({ id, title, className = "" }) => (
  <h2 id={id} className={`mb-3 flex scroll-mt-4 items-center gap-2 border-b border-[rgba(91,133,146,0.4)] pb-1.5 text-sm font-semibold uppercase tracking-[0.15em] text-jk-teal ${className}`}>
    <span className="flex items-center gap-1" aria-hidden="true">
      <span className="h-[6px] w-[6px] rotate-45 bg-jk-teal opacity-30" />
      <span className="h-[8px] w-[8px] rotate-45 bg-jk-teal opacity-60" />
    </span>
    {title}
  </h2>
)

// The site uses a HashRouter, so a plain #anchor would be read as a route.
// Sections are addressed with ?section=<id> instead, which keeps them linkable.
const SectionNav: FC<SectionNavProps> = ({ sections }) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const hasSection = searchParams.has("section")
  const firstId = sections[0]?.id

  useEffect(() => {
    const id = searchParams.get("section")
    if (!id) return
    // wait for the carousel and mermaid diagrams to settle before jumping
    const timer = setTimeout(() => scrollToSection(id, "auto"), 400)
    return () => clearTimeout(timer)
    // only on first load; clicks scroll directly
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Once the reader scrolls back up above the first section, drop ?section so the
  // URL points at the page itself again. Only upward movement counts, so the
  // smooth scroll after clicking a section further down can't clear it.
  const lastTop = useRef<number | null>(null)
  useEffect(() => {
    if (!hasSection || !firstId) return
    lastTop.current = null
    const onScroll = () => {
      const heading = document.getElementById(firstId)
      if (!heading) return
      const top = heading.getBoundingClientRect().top
      const movingUp = lastTop.current !== null && top > lastTop.current
      lastTop.current = top
      // a clicked heading settles at 16px (scroll-mt-4); leave some slack past that
      if (movingUp && top > 64) {
        setSearchParams(params => {
          params.delete("section")
          return params
        }, { replace: true })
      }
    }
    // capture, so it fires whichever element is doing the scrolling
    window.addEventListener("scroll", onScroll, { capture: true, passive: true })
    return () => window.removeEventListener("scroll", onScroll, { capture: true })
  }, [hasSection, firstId, setSearchParams])

  return (
    // a flat teal bar; the links fill its height, split by thin white rules
    <nav aria-label="On this page" className="mb-6 bg-jk-teal shadow-sm">
      {/* one row: centered when it fits, otherwise it scrolls from the left */}
      <div className="overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: "none" }}>
        <div className="mx-auto flex w-max">
          {sections.map(s => (
            <Link
              key={s.id}
              to={{ search: `?section=${s.id}` }}
              replace
              onClick={() => scrollToSection(s.id)}
              // ! to beat the global link colour in App.css, which outranks a plain utility.
              // The hover is instant (no fade to flicker between neighbours), stays inside
              // the dividers, and is left off touch screens, where it would stick after a tap.
              className="whitespace-nowrap border-l border-white/50 bg-clip-padding px-3.5 py-2 text-[11px] font-medium leading-tight !text-white no-underline last:border-r [@media(hover:hover)]:hover:bg-white/20"
            >
              {s.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}

export default SectionNav
