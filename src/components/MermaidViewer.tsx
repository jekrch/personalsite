import { CSSProperties, FC, PointerEvent as ReactPointerEvent, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { useScrollLock } from "../utils/useScrollLock"

// Faint teal dot grid behind diagrams, inline and in the viewer
export const DOT_GRID: CSSProperties = {
  backgroundColor: "#fafbfb",
  backgroundImage: "radial-gradient(rgba(91, 133, 146, 0.2) 1px, transparent 1.2px)",
  backgroundSize: "16px 16px",
  backgroundPosition: "8px 8px",
}

type IconProps = { className?: string }

const Icon: FC<IconProps & { children: React.ReactNode }> = ({ className, children }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden>
    {children}
  </svg>
)

export const DiagramIcon: FC<IconProps> = p => <Icon {...p}><rect x="3" y="3" width="7" height="5" rx="1" /><rect x="14" y="16" width="7" height="5" rx="1" /><path d="M6.5 8v4.5h11V16" /></Icon>
export const CopyIcon: FC<IconProps> = p => <Icon {...p}><rect x="9" y="9" width="11" height="11" rx="1.5" /><path d="M5 15V5a1 1 0 0 1 1-1h10" /></Icon>
export const CheckIcon: FC<IconProps> = p => <Icon {...p}><path d="M5 12.5l4.5 4.5L19 7.5" /></Icon>
export const ExternalIcon: FC<IconProps> = p => <Icon {...p}><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></Icon>
export const ExpandIcon: FC<IconProps> = p => <Icon {...p}><path d="M15 4h5v5M9 20H4v-5M20 4l-6 6M4 20l6-6" /></Icon>
const PlusIcon: FC<IconProps> = p => <Icon {...p}><path d="M12 5v14M5 12h14" /></Icon>
const MinusIcon: FC<IconProps> = p => <Icon {...p}><path d="M5 12h14" /></Icon>
const FitIcon: FC<IconProps> = p => <Icon {...p}><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></Icon>
const CloseIcon: FC<IconProps> = p => <Icon {...p}><path d="M6 18L18 6M6 6l12 12" /></Icon>

const ICON_BTN =
  "flex size-[2.5rem] flex-none items-center justify-center rounded-[2px] border-0 !text-white/80 no-underline transition-colors duration-150 hover:bg-white/15 hover:!text-white hover:no-underline focus-visible:bg-white/15 focus-visible:outline-none"

const CTRL_BTN =
  "flex size-[2.25rem] flex-none items-center justify-center rounded-[2px] border-0 text-gray-600 transition-colors duration-150 hover:bg-[rgba(91,133,146,0.12)] hover:text-jk-teal focus-visible:bg-[rgba(91,133,146,0.12)] focus-visible:text-jk-teal focus-visible:outline-none disabled:opacity-35 disabled:hover:bg-[transparent] disabled:hover:text-gray-600"

const MIN_SCALE = 0.25
const MAX_SCALE = 6
// Small diagrams shouldn't balloon to fill a big screen
const MAX_FIT_SCALE = 2
// Room kept clear around the fitted diagram; the bottom leaves space for the zoom controls
const FIT_PAD = 24
const FIT_PAD_BOTTOM = 72
const BUTTON_ZOOM = 1.4
const KEY_PAN = 60
// A press that moves less than this is a tap, not a drag
const TAP_SLOP = 8
const DOUBLE_TAP_MS = 350

interface View {
  x: number
  y: number
  scale: number
}

interface Point {
  x: number
  y: number
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))
const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y)

// Gives the SVG explicit pixel dimensions (mermaid sizes it to its container)
// and its own ids, since the inline copy stays in the page underneath
const sizeSvg = (svg: string, renderId: string) => {
  const viewBox = svg.match(/viewBox="([^"]+)"/)?.[1].trim().split(/[\s,]+/).map(Number)
  const width = viewBox?.[2] || 800
  const height = viewBox?.[3] || 600
  const markup = svg
    .split(renderId)
    .join(`${renderId}-viewer`)
    .replace(/<svg[^>]*>/, tag =>
      tag.replace(/width="100%"/, `width="${width}" height="${height}"`).replace(/max-width:\s*[\d.]+px;?/, ""),
    )
  return { markup, width, height }
}

interface MermaidViewerProps {
  isOpen: boolean
  onClose: () => void
  title: string
  svg: string
  renderId: string
  liveUrl: string
  copied: boolean
  onCopy: () => void
}

const MermaidViewer: FC<MermaidViewerProps> = ({ isOpen, onClose, title, svg, renderId, liveUrl, copied, onCopy }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [view, setView] = useState<View>({ x: 0, y: 0, scale: 1 })
  const [isDragging, setIsDragging] = useState(false)
  const [interacted, setInteracted] = useState(false)
  const viewRef = useRef(view)
  const fitScale = useRef(1)
  const interactedRef = useRef(false)
  const stageRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const pointers = useRef(new Map<number, Point>())
  const pinch = useRef<{ dist: number; mid: Point; view: View } | null>(null)
  const press = useRef<(Point & { t: number; moved: boolean }) | null>(null)
  const lastTap = useRef<(Point & { t: number }) | null>(null)
  const titleId = `${renderId}-viewer-title`

  const { markup, width, height } = useMemo(() => sizeSvg(svg, renderId), [svg, renderId])

  // Open/close animations, as in LectureModal
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      let frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => {
          setIsAnimating(true)
          closeRef.current?.focus({ preventScroll: true })
        })
      })
      return () => cancelAnimationFrame(frame)
    } else {
      setIsAnimating(false)
      const timer = setTimeout(() => setIsVisible(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Hand focus back to whatever opened the viewer once it closes
  useEffect(() => {
    if (!isOpen) return
    const previousFocus = document.activeElement as HTMLElement | null
    return () => previousFocus?.focus({ preventScroll: true })
  }, [isOpen])

  useScrollLock(isVisible)

  const apply = useCallback((next: View) => {
    viewRef.current = next
    setView(next)
  }, [])

  const markInteracted = useCallback(() => {
    if (interactedRef.current) return
    interactedRef.current = true
    setInteracted(true)
  }, [])

  const minScale = () => Math.min(MIN_SCALE, fitScale.current)

  const fit = useCallback(() => {
    const stage = stageRef.current
    if (!stage) return
    const w = stage.clientWidth
    const h = stage.clientHeight
    const scale = Math.max(
      0.05,
      Math.min((w - 2 * FIT_PAD) / width, (h - FIT_PAD - FIT_PAD_BOTTOM) / height, MAX_FIT_SCALE),
    )
    fitScale.current = scale
    apply({ scale, x: (w - width * scale) / 2, y: FIT_PAD + (h - FIT_PAD - FIT_PAD_BOTTOM - height * scale) / 2 })
  }, [apply, width, height])

  // Zooms by `factor`, keeping the stage point (cx, cy) fixed
  const zoomAt = useCallback((factor: number, cx: number, cy: number) => {
    const v = viewRef.current
    const scale = clamp(v.scale * factor, minScale(), MAX_SCALE)
    const k = scale / v.scale
    apply({ scale, x: cx - (cx - v.x) * k, y: cy - (cy - v.y) * k })
  }, [apply])

  const zoomCenter = useCallback((factor: number) => {
    const stage = stageRef.current
    if (!stage) return
    zoomAt(factor, stage.clientWidth / 2, stage.clientHeight / 2)
    markInteracted()
  }, [zoomAt, markInteracted])

  const reset = useCallback(() => {
    interactedRef.current = false
    fit()
  }, [fit])

  // Fit on open, and refit on resize until the user takes over
  useLayoutEffect(() => {
    if (!isVisible) return
    interactedRef.current = false
    setInteracted(false)
    fit()

    const stage = stageRef.current
    if (!stage) return
    const observer = new ResizeObserver(() => {
      if (!interactedRef.current) fit()
    })
    observer.observe(stage)
    return () => observer.disconnect()
  }, [isVisible, fit])

  // Wheel zoom, plus Safari's trackpad pinch (gesture events). Attached
  // natively because React's wheel listener is passive.
  useEffect(() => {
    const stage = stageRef.current
    if (!isVisible || !stage) return

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const rect = stage.getBoundingClientRect()
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? rect.height : 1
      const dy = clamp(e.deltaY * unit, -120, 120)
      // Chromium/Firefox report trackpad pinches as ctrl+wheel with small deltas
      zoomAt(Math.exp(-dy * (e.ctrlKey ? 0.01 : 0.002)), e.clientX - rect.left, e.clientY - rect.top)
      markInteracted()
    }

    let gestureScale = 1
    const onGestureStart = (e: Event) => {
      e.preventDefault()
      gestureScale = 1
    }
    const onGestureChange = (e: Event) => {
      e.preventDefault()
      // iOS fires these alongside touch pointers, which already handle the pinch
      if (pointers.current.size > 0) return
      const g = e as Event & { scale: number; clientX: number; clientY: number }
      const rect = stage.getBoundingClientRect()
      zoomAt(g.scale / gestureScale, g.clientX - rect.left, g.clientY - rect.top)
      gestureScale = g.scale
      markInteracted()
    }

    stage.addEventListener("wheel", onWheel, { passive: false })
    stage.addEventListener("gesturestart", onGestureStart)
    stage.addEventListener("gesturechange", onGestureChange)
    return () => {
      stage.removeEventListener("wheel", onWheel)
      stage.removeEventListener("gesturestart", onGestureStart)
      stage.removeEventListener("gesturechange", onGestureChange)
    }
  }, [isVisible, zoomAt, markInteracted])

  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const v = viewRef.current
      const pan = (dx: number, dy: number) => {
        apply({ ...v, x: v.x + dx, y: v.y + dy })
        markInteracted()
      }
      switch (e.key) {
        case "Escape": onClose(); break
        case "+": case "=": zoomCenter(BUTTON_ZOOM); break
        case "-": case "_": zoomCenter(1 / BUTTON_ZOOM); break
        case "0": reset(); break
        case "ArrowLeft": pan(KEY_PAN, 0); break
        case "ArrowRight": pan(-KEY_PAN, 0); break
        case "ArrowUp": pan(0, KEY_PAN); break
        case "ArrowDown": pan(0, -KEY_PAN); break
        default: return
      }
      e.preventDefault()
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [isOpen, onClose, apply, zoomCenter, reset, markInteracted])

  const stagePoint = (e: ReactPointerEvent): Point => {
    const rect = stageRef.current!.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const startPinch = () => {
    const [a, b] = [...pointers.current.values()]
    pinch.current = {
      dist: Math.max(1, distance(a, b)),
      mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
      view: viewRef.current,
    }
  }

  const onPointerDown = (e: ReactPointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return
    e.currentTarget.setPointerCapture(e.pointerId)
    const p = stagePoint(e)
    pointers.current.set(e.pointerId, p)
    if (pointers.current.size === 1) {
      press.current = { ...p, t: e.timeStamp, moved: false }
    } else {
      press.current = null
      startPinch()
    }
    setIsDragging(true)
  }

  const onPointerMove = (e: ReactPointerEvent) => {
    const prev = pointers.current.get(e.pointerId)
    if (!prev) return
    const p = stagePoint(e)
    pointers.current.set(e.pointerId, p)

    const pressed = press.current
    if (pressed && !pressed.moved) {
      if (distance(p, pressed) < TAP_SLOP) return
      pressed.moved = true
    }

    const start = pinch.current
    if (start && pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.values()]
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
      const scale = clamp(start.view.scale * (distance(a, b) / start.dist), minScale(), MAX_SCALE)
      // Keep the diagram point that was under the fingers under their midpoint
      const ox = (start.mid.x - start.view.x) / start.view.scale
      const oy = (start.mid.y - start.view.y) / start.view.scale
      apply({ scale, x: mid.x - ox * scale, y: mid.y - oy * scale })
    } else {
      const v = viewRef.current
      apply({ ...v, x: v.x + p.x - prev.x, y: v.y + p.y - prev.y })
    }
    markInteracted()
  }

  const endPointer = (e: ReactPointerEvent, cancelled: boolean) => {
    if (!pointers.current.delete(e.pointerId)) return
    const remaining = pointers.current.size
    if (remaining >= 2) startPinch()
    else pinch.current = null
    if (remaining === 0) setIsDragging(false)

    const pressed = press.current
    press.current = null
    if (cancelled || !pressed || pressed.moved || remaining > 0) return

    // Double tap / double click zooms in; once zoomed all the way, back to fit
    const last = lastTap.current
    if (last && e.timeStamp - last.t < DOUBLE_TAP_MS && distance(last, pressed) < 32) {
      lastTap.current = null
      if (viewRef.current.scale * 2 > MAX_SCALE) reset()
      else {
        zoomAt(2, pressed.x, pressed.y)
        markInteracted()
      }
    } else {
      lastTap.current = { x: pressed.x, y: pressed.y, t: e.timeStamp }
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  if (!isVisible) return null

  // Portaled to <body> so no ancestor transform can break `position: fixed`.
  return createPortal(
    <div
      className="fixed inset-0 z-[1050] flex items-center justify-center overscroll-contain backdrop-blur-[3px] sm:p-[1.5rem]"
      style={{
        backgroundColor: "rgba(38, 50, 54, 0.72)",
        opacity: isAnimating ? 1 : 0,
        transition: "opacity 300ms ease-out",
      }}
      onClick={handleBackdropClick}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex h-full w-full max-w-[1400px] flex-col overflow-hidden bg-jk-teal shadow-[5px_6px_18px_0px_rgba(0,0,0,0.35)] sm:rounded-[2px] sm:border-[1px] sm:border-solid sm:border-white"
        style={{
          transform: isAnimating ? "none" : "scale(0.96) translateY(12px)",
          transition: "transform 300ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {/* Header */}
        <div className="flex-none pt-[env(safe-area-inset-top)] text-white sm:pt-0">
          <div className="flex h-[3.5rem] items-center gap-[0.75rem] pl-[0.875rem] pr-[0.375rem]">
            <span className="grid size-[1.75rem] flex-none place-items-center rounded-[2px] border-[1px] border-solid border-white/70">
              <DiagramIcon className="size-[0.9rem]" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 id={titleId} className="m-0 truncate text-[0.95rem] font-semibold leading-[1.15]">
                {title}
              </h2>
              <p className="mb-0 mt-[0.1875rem] text-[0.68rem] font-light uppercase leading-[1rem] tracking-wider text-white/75">
                Mermaid diagram
              </p>
            </div>
            <div className="flex flex-none items-center">
              <button
                type="button"
                onClick={onCopy}
                className={ICON_BTN}
                aria-label={copied ? "Mermaid source copied" : "Copy Mermaid source"}
                title={copied ? "Copied" : "Copy Mermaid source"}
              >
                {copied ? <CheckIcon className="size-[1.1rem]" /> : <CopyIcon className="size-[1.1rem]" />}
              </button>
              <a
                href={liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={ICON_BTN}
                aria-label="Open in Mermaid Live editor"
                title="Open in Mermaid Live editor"
              >
                <ExternalIcon className="size-[1.1rem]" />
              </a>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                className={ICON_BTN}
                aria-label="Close diagram viewer"
              >
                <CloseIcon className="size-[1.25rem]" />
              </button>
            </div>
          </div>
        </div>

        {/* Stage */}
        <div
          ref={stageRef}
          className={`relative min-h-0 flex-1 touch-none select-none overflow-hidden ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
          style={DOT_GRID}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={e => endPointer(e, false)}
          onPointerCancel={e => endPointer(e, true)}
        >
          <div
            className="absolute left-0 top-0 origin-top-left"
            style={{
              width,
              height,
              transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
            }}
            dangerouslySetInnerHTML={{ __html: markup }}
          />

          <p
            className="pointer-events-none absolute inset-x-0 top-[0.75rem] m-0 px-[1rem] text-center text-[0.68rem] font-light uppercase leading-[1rem] tracking-wider text-gray-500 transition-opacity duration-500"
            style={{ opacity: interacted ? 0 : 1 }}
          >
            <span className="[@media(pointer:coarse)]:hidden">Scroll to zoom · Drag to pan · Double-click to zoom in</span>
            <span className="hidden [@media(pointer:coarse)]:inline">Pinch to zoom · Drag to pan · Double-tap to zoom in</span>
          </p>

          {/* Zoom controls */}
          <div
            className="absolute bottom-[calc(1rem+env(safe-area-inset-bottom))] left-1/2 flex -translate-x-1/2 cursor-default items-center gap-[0.125rem] rounded-[2px] border-[1px] border-solid border-[rgba(91,133,146,0.25)] bg-white/95 p-[0.1875rem] shadow-[0_4px_14px_rgba(38,50,54,0.14)]"
            onPointerDown={e => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => zoomCenter(1 / BUTTON_ZOOM)}
              disabled={view.scale <= minScale() + 1e-3}
              className={CTRL_BTN}
              aria-label="Zoom out"
              title="Zoom out (−)"
            >
              <MinusIcon className="size-[1rem]" />
            </button>
            <span className="w-[3.25rem] text-center text-[0.7rem] font-semibold tabular-nums tracking-wider text-gray-600" aria-hidden>
              {Math.round(view.scale * 100)}%
            </span>
            <button
              type="button"
              onClick={() => zoomCenter(BUTTON_ZOOM)}
              disabled={view.scale >= MAX_SCALE - 1e-3}
              className={CTRL_BTN}
              aria-label="Zoom in"
              title="Zoom in (+)"
            >
              <PlusIcon className="size-[1rem]" />
            </button>
            <span className="mx-[0.125rem] h-[1.25rem] w-px bg-[rgba(91,133,146,0.25)]" aria-hidden />
            <button
              type="button"
              onClick={reset}
              className={CTRL_BTN}
              aria-label="Fit diagram to screen"
              title="Fit to screen (0)"
            >
              <FitIcon className="size-[1rem]" />
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default MermaidViewer
