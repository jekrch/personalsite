import { FC, useEffect, useLayoutEffect, useRef, useState } from "react"
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

// The section being read: the last one whose top has scrolled up to where a jump to it
// lands (its scroll margin, just under the stuck nav). At the very bottom of the page it's
// the last section, since the short closing sections can't scroll that far up.
const currentSection = (ids: string[]) => {
  const doc = document.documentElement
  if (window.scrollY > 0 && window.innerHeight + window.scrollY >= doc.scrollHeight - 2) {
    return ids[ids.length - 1]
  }
  let current = ids[0]
  for (const id of ids) {
    const el = document.getElementById(id)
    if (!el) continue
    const settled = parseFloat(getComputedStyle(el).scrollMarginTop) || 0
    if (el.getBoundingClientRect().top <= settled + 8) current = id
  }
  return current
}

// A section picked from the nav (or from ?section on load) stays highlighted through the
// jump and until the reader scrolls again, so the smooth scroll doesn't flicker through the
// sections in between, and a short section near the bottom isn't swapped for the last one.
interface Pin {
  id: string
  settled: boolean
  timer?: ReturnType<typeof setTimeout>
}

// the jump is done once the page has stopped scrolling for a moment
const settleSoon = (p: Pin) => {
  clearTimeout(p.timer)
  p.timer = setTimeout(() => { p.settled = true }, 150)
}

// where the active tab's underline sits, measured off its label
interface Bar {
  left: number
  width: number
  // slide to the new spot, or jump there (first placement, resizes)
  animate: boolean
}

// Same stepped diamonds as PageHeader, so the section reads as part of the page chrome.
export const SectionHeading: FC<{ id: string, title: string, className?: string }> = ({ id, title, className = "" }) => (
  <h2 id={id} className={`section-anchor mb-3 flex items-center gap-2 border-b border-[rgba(91,133,146,0.4)] pb-1.5 text-sm font-semibold uppercase tracking-[0.15em] text-jk-teal ${className}`}>
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
  const idsKey = sections.map(s => s.id).join(",")
  const [activeId, setActiveId] = useState(firstId)
  const pin = useRef<Pin | null>(null)
  const strip = useRef<HTMLDivElement>(null)
  const row = useRef<HTMLDivElement>(null)
  const nav = useRef<HTMLElement>(null)
  const [bar, setBar] = useState<Bar | null>(null)
  const barPlaced = useRef(false)
  const [stuck, setStuck] = useState(false)
  const [edges, setEdges] = useState({ start: false, end: false })

  const pinSection = (id: string) => {
    clearTimeout(pin.current?.timer)
    const p: Pin = { id, settled: false }
    pin.current = p
    settleSoon(p)
    setActiveId(id)
  }

  useEffect(() => {
    const id = searchParams.get("section")
    if (!id) return
    // wait for the carousel and mermaid diagrams to settle before jumping
    const timer = setTimeout(() => {
      pinSection(id)
      scrollToSection(id, "auto")
    }, 400)
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
      // a clicked heading settles at its scroll margin, just below the stuck nav;
      // leave some slack past that
      const settled = parseFloat(getComputedStyle(heading).scrollMarginTop) || 0
      if (movingUp && top > settled + 48) {
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

  // Track the section being read. Not a capture listener: only the page's own scrolling
  // counts, not the carousel's or this strip's sideways scroll.
  useEffect(() => {
    const ids = idsKey.split(",")
    let frame = 0
    const update = () => {
      frame = 0
      const p = pin.current
      if (p && !p.settled) return
      pin.current = null
      setActiveId(currentSection(ids))
    }
    const onScroll = () => {
      const p = pin.current
      if (p && !p.settled) settleSoon(p)
      if (!frame) frame = requestAnimationFrame(update)
    }
    if (!pin.current) update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [idsKey])

  useEffect(() => () => clearTimeout(pin.current?.timer), [])

  // When the tabs don't all fit, slide the strip along with the reader so the sections
  // coming up are in view. Moving down the page, the active tab goes near the left edge;
  // moving back up, near the right edge. Either way a sliver of the tab behind it stays
  // showing, so it's clear there's more that way. The browser clamps the ends.
  const lastIndex = useRef(0)
  useEffect(() => {
    const index = idsKey.split(",").indexOf(activeId ?? "")
    const goingUp = index < lastIndex.current
    lastIndex.current = index
    const container = strip.current
    const tab = container?.querySelector<HTMLElement>(`[data-section="${activeId}"]`)
    if (!container || !tab || container.scrollWidth <= container.clientWidth) return
    const box = container.getBoundingClientRect()
    const { left, right } = tab.getBoundingClientRect()
    const by = goingUp ? right - box.right + 24 : left - box.left - 24
    container.scrollTo({ left: container.scrollLeft + by, behavior: "smooth" })
  }, [activeId, idsKey])

  // The active underline is a single bar that slides from tab to tab, as wide as the
  // label rather than the padded tab. It's placed before paint so it never starts at 0.
  // Label or strip size changes (font load, resize) move it without sliding.
  useLayoutEffect(() => {
    const container = row.current
    const label = container?.querySelector<HTMLElement>(`[data-section="${activeId}"] > span`)
    if (!container || !label) return
    const place = (animate: boolean) => {
      const box = container.getBoundingClientRect()
      const { left, width } = label.getBoundingClientRect()
      setBar({ left: left - box.left, width, animate })
    }
    place(barPlaced.current)
    barPlaced.current = true
    // skip the observer's initial call, which would cancel the slide just started
    let first = true
    const observer = new ResizeObserver(() => {
      if (first) first = false
      else place(false)
    })
    observer.observe(container)
    container.querySelectorAll("[data-section] > span").forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [activeId, idsKey])

  // Lift the bar off the page (shadow, frosted backdrop) only while it's stuck.
  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const el = nav.current
      if (!el) return
      const top = parseFloat(getComputedStyle(el).top) || 0
      setStuck(el.getBoundingClientRect().top <= top + 0.5)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [])

  // When the strip overflows, fade out whichever ends have more tabs past them.
  useEffect(() => {
    const el = strip.current
    if (!el) return
    const update = () => {
      const start = el.scrollLeft > 1
      const end = el.scrollLeft + el.clientWidth < el.scrollWidth - 1
      setEdges(e => (e.start === start && e.end === end ? e : { start, end }))
    }
    update()
    el.addEventListener("scroll", update, { passive: true })
    const observer = new ResizeObserver(update)
    observer.observe(el)
    if (row.current) observer.observe(row.current)
    return () => {
      el.removeEventListener("scroll", update)
      observer.disconnect()
    }
  }, [])

  const mask = edges.start || edges.end
    ? `linear-gradient(to right, transparent, #000 ${edges.start ? 24 : 0}px, #000 calc(100% - ${edges.end ? 24 : 0}px), transparent)`
    : undefined

  return (
    // docs-style "on this page" strip: text tabs sitting on a hairline rule.
    // It sticks under the safe area once scrolled to, so the sections stay a tap away.
    // -mx-3/px-3 cancel the Container's padding so its background covers content at the edges;
    // z-30 clears the project carousel's controls (z-20) but stays under the navbar menu and modals.
    <nav
      ref={nav}
      aria-label="On this page"
      // The hairline rule is an inset shadow on the nav, so it runs the full width of the
      // background (gutters included) and stays unfaded under the strip while the bar slides
      // over it. Stuck, a soft drop shadow joins it.
      className={`sticky top-[env(safe-area-inset-top)] z-30 -mx-3 mb-6 px-3 transition-[background-color,box-shadow] duration-200 ${stuck
        ? "bg-white/80 shadow-[inset_0_-1px_0_rgb(229,231,235),0_6px_14px_-8px_rgba(0,0,0,0.15)] backdrop-blur-md backdrop-saturate-150"
        : "bg-white/95 shadow-[inset_0_-1px_0_rgb(229,231,235)] backdrop-blur-sm"}`}
    >
      {/* one row: centered when it fits, otherwise it scrolls sideways (w-max leaves no
          spare room to center in, so the start never gets cut off) */}
      <div
        ref={strip}
        className="overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: "none", maskImage: mask, WebkitMaskImage: mask }}
      >
        <div ref={row} className="relative flex w-max min-w-full items-stretch justify-center">
          {sections.map(s => {
            const active = s.id === activeId
            return (
              <Link
                key={s.id}
                to={{ search: `?section=${s.id}` }}
                replace
                data-section={s.id}
                aria-current={active ? "location" : undefined}
                onClick={() => {
                  pinSection(s.id)
                  scrollToSection(s.id)
                }}
                // ! to beat the global link colour in App.css, which outranks a plain utility.
                // The active tab is teal; hovering another darkens it with a grey underline.
                // The hover is left off touch screens, where it would stick after a tap.
                className={`group flex whitespace-nowrap px-3 text-[13px] font-medium leading-none no-underline transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[rgba(91,133,146,0.5)] ${active
                  ? "!text-jk-teal"
                  : "!text-gray-600 [@media(hover:hover)]:hover:!text-gray-900"}`}
              >
                {/* the underline runs under the label only, matching the sliding bar */}
                <span className={`border-b-2 border-transparent py-2.5 transition-colors duration-150 ${active ? "" : "[@media(hover:hover)]:group-hover:border-gray-300"}`}>
                  {s.label}
                </span>
              </Link>
            )
          })}
          {bar && (
            <span
              aria-hidden="true"
              className={`pointer-events-none absolute bottom-0 left-0 h-[2px] rounded-full bg-jk-teal ${bar.animate
                ? "transition-[transform,width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
                : ""}`}
              style={{ width: bar.width, transform: `translateX(${bar.left}px)` }}
            />
          )}
        </div>
      </div>
    </nav>
  )
}

export default SectionNav
