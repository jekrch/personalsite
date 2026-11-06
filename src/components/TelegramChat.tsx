import { FC, useEffect, useRef, useState } from "react"

import type { ChatMessage, ChatTranscript } from "./telegramChats"

const Bubble: FC<{
  message: ChatMessage
  showName: boolean
  botName: string
}> = ({ message, showName, botName }) => {
  const outgoing = message.from === "user"

  // user messages are slash commands — highlight the command token the way
  // Telegram renders it as a tappable link (not as code/monospace)
  const renderText = (text: string) => {
    if (!outgoing) return text
    const m = text.match(/^(\/\S+)(\s[\s\S]*)?$/)
    if (!m) return text
    return (
      <>
        <span className="font-semibold text-[#8fd0de]">{m[1]}</span>
        {m[2]}
      </>
    )
  }

  return (
    <div className={`flex w-full ${outgoing ? "justify-end" : "justify-start"}`}>
      <div
        className={`relative max-w-[88%] overflow-hidden rounded-2xl text-[12.5px] leading-snug ${
          outgoing
            ? "rounded-br-md bg-[#2f5a64] text-[#eef6f5]"
            : "rounded-bl-md bg-[#1f2b38] text-[#e7eaed]"
        }`}
      >
        {message.image && (
          <img
            src={message.image}
            alt=""
            loading="lazy"
            className="block max-h-60 w-full object-cover"
          />
        )}

        <div className="px-3 py-1.5">
          {showName && !outgoing && (
            <div className="mb-0.5 text-[11.5px] font-semibold text-[#79b0bb]">
              {botName}
            </div>
          )}

          <div className="whitespace-pre-wrap break-words">
            {renderText(message.text)}
          </div>

          {message.meta && (
            <div className="mt-1 text-[10px] text-[#5f7079]">{message.meta}</div>
          )}

          <div
            className={`mt-0.5 text-right text-[10px] ${
              outgoing ? "text-[#a9c7cd]" : "text-[#6f818c]"
            }`}
          >
            {message.time}
          </div>
        </div>
      </div>
    </div>
  )
}

interface TelegramChatProps {
  chat: ChatTranscript
  className?: string
}

const TelegramChat: FC<TelegramChatProps> = ({ chat, className }) => {
  const [expanded, setExpanded] = useState(false)

  // grab-to-scroll with mobile-style physics: drag to fling the transcript,
  // momentum carries it with friction, and the edges rubber-band + spring back.
  // touch input keeps the browser's own native momentum, so we skip it.
  const scrollRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)

  const drag = useRef({
    active: false,
    startY: 0,
    startScroll: 0,
    lastY: 0,
    lastT: 0,
    v: 0, // pointer velocity, px/ms (positive = moving down)
  })
  // rubber-band offset state, driven imperatively to keep the rAF loop smooth
  const phys = useRef({ raf: 0, offset: 0, vScroll: 0 })

  const maxScroll = () => {
    const el = scrollRef.current
    return el ? el.scrollHeight - el.clientHeight : 0
  }

  // iOS-style resistance: the further you pull past the edge, the harder it gets
  const rubber = (x: number) => {
    const d = scrollRef.current?.clientHeight || 1
    const c = 0.55
    return (Math.sign(x) * (Math.abs(x) * d * c)) / (d + c * Math.abs(x))
  }

  const applyOffset = () => {
    const node = contentRef.current
    if (node)
      node.style.transform = phys.current.offset
        ? `translateY(${phys.current.offset}px)`
        : ""
  }

  const stopAnim = () => {
    if (phys.current.raf) cancelAnimationFrame(phys.current.raf)
    phys.current.raf = 0
  }

  const tick = () => {
    const el = scrollRef.current
    const p = phys.current
    if (!el) return
    const max = maxScroll()

    // inertial scroll: a long, low-friction glide like a real touchscreen
    if (Math.abs(p.offset) < 0.5 && Math.abs(p.vScroll) > 0.01) {
      const next = el.scrollTop - p.vScroll * 16
      if (next < 0) {
        el.scrollTop = 0
        // a small, capped nudge past the edge — eased away, not sprung
        p.offset = Math.min(64, -p.vScroll * 5)
        p.vScroll = 0
      } else if (next > max) {
        el.scrollTop = max
        p.offset = Math.max(-64, -p.vScroll * 5)
        p.vScroll = 0
      } else {
        el.scrollTop = next
        p.vScroll *= 0.97 // ~iOS deceleration; long smooth coast
      }
    } else {
      p.vScroll = 0
    }

    // monotonic ease back to rest: glides home without overshoot/bounce
    p.offset *= 0.86
    if (Math.abs(p.offset) < 0.3) p.offset = 0
    applyOffset()

    if (p.vScroll !== 0 || p.offset !== 0) {
      p.raf = requestAnimationFrame(tick)
    } else {
      p.raf = 0
    }
  }

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return
    const el = scrollRef.current
    if (!el) return
    stopAnim()
    phys.current.vScroll = 0
    drag.current = {
      active: true,
      startY: e.clientY,
      startScroll: el.scrollTop,
      lastY: e.clientY,
      lastT: performance.now(),
      v: 0,
    }
    setDragging(true)
    el.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    const el = scrollRef.current
    if (!d.active || !el) return

    const raw = d.startScroll - (e.clientY - d.startY)
    const max = maxScroll()
    let over = 0
    if (raw < 0) over = raw
    else if (raw > max) over = raw - max
    el.scrollTop = Math.max(0, Math.min(max, raw))
    phys.current.offset = over ? -rubber(over) : 0
    applyOffset()

    const now = performance.now()
    const dt = now - d.lastT
    if (dt > 0) {
      const sample = (e.clientY - d.lastY) / dt
      d.v = d.v * 0.3 + sample * 0.7 // low-pass so the fling feels stable
    }
    d.lastY = e.clientY
    d.lastT = now
  }

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d.active) return
    d.active = false
    setDragging(false)
    scrollRef.current?.releasePointerCapture(e.pointerId)

    // a stale sample (paused before releasing) shouldn't fling
    const fresh = performance.now() - d.lastT < 60
    phys.current.vScroll = fresh && Math.abs(d.v) > 0.04 ? d.v : 0
    if (phys.current.vScroll || phys.current.offset) {
      stopAnim()
      phys.current.raf = requestAnimationFrame(tick)
    }
  }

  useEffect(() => stopAnim, [])

  return (
    <div
      className={`overflow-hidden rounded-xl bg-[#0e1621] shadow-[5px_6px_11px_0px_rgba(0,_0,_0,_0.35)] ${
        className ?? "mx-auto w-full max-w-md"
      }`}
      style={{ fontFamily: "helvetica, arial, sans-serif" }}
    >
      {/* header */}
      <div className="flex items-center gap-3 bg-[#17212b] px-4 py-2.5 text-white">
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5 shrink-0 text-[#79b0bb]"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-jk-teal/30 text-base">
          {"image" in chat.avatar ? (
            <img src={chat.avatar.image} alt="" className="h-5 w-5" />
          ) : (
            chat.avatar.emoji
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">{chat.title}</div>
          <div className="truncate text-[11px] text-white/50">
            {chat.userName}, {chat.botName}
          </div>
        </div>
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5 shrink-0 text-white/50"
          fill="currentColor"
        >
          <circle cx="12" cy="5" r="1.6" />
          <circle cx="12" cy="12" r="1.6" />
          <circle cx="12" cy="19" r="1.6" />
        </svg>
      </div>

      {/* scrollable message area */}
      <div
        ref={scrollRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className={`overflow-y-auto overscroll-contain px-3 py-3 transition-[height] duration-300 [scrollbar-color:#3a4754_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar-thumb:hover]:bg-[#4a5a6a] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#3a4754] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1.5 ${
          dragging ? "cursor-grabbing select-none" : "cursor-grab"
        } ${expanded ? "h-[40rem]" : "h-[22rem]"}`}
        style={{
          background:
            "radial-gradient(circle at 18% 12%, rgba(91,133,146,0.16), transparent 42%), radial-gradient(circle at 85% 85%, rgba(91,133,146,0.12), transparent 40%), #0e1621",
        }}
      >
        <div ref={contentRef} className="will-change-transform">
          <div className="mb-3 flex justify-center">
            <span className="rounded-full bg-white/[0.07] px-3 py-0.5 text-[10.5px] font-medium text-white/60">
              {chat.date}
            </span>
          </div>

          <div className="space-y-2">
            {chat.messages.map((message, i) => {
              const prev = chat.messages[i - 1]
              const showName = !prev || prev.from !== message.from
              return (
                <div key={i} className={showName && i > 0 ? "pt-1.5" : ""}>
                  <Bubble message={message} showName={showName} botName={chat.botName} />
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* expand / collapse */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-center gap-1.5 border-t border-white/5 bg-[#17212b] py-1.5 text-[11px] text-white/55 transition-colors hover:text-white/85"
      >
        {expanded ? "Collapse" : "Expand"}
        <svg
          viewBox="0 0 24 24"
          className={`h-3.5 w-3.5 transition-transform duration-300 ${
            expanded ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* decorative composer — not interactive */}
      <div className="flex items-center gap-2 border-t border-white/5 bg-[#17212b] px-3 py-2">
        <div className="flex flex-1 items-center rounded-full bg-[#242f3d] px-4 py-1.5 text-[12.5px] text-white/35">
          Message
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-jk-teal text-white">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
            <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
          </svg>
        </div>
      </div>
    </div>
  )
}

export default TelegramChat
