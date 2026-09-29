import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react"

// A single YouTube video in a card that matches the SoundCloud player. It
// shows the video's thumbnail with a play button, and only swaps in the real
// (privacy-enhanced) player once someone clicks, so the page doesn't load
// YouTube up front. The player is built through YouTube's IFrame Player API
// (https://developers.google.com/youtube/iframe_api_reference) so we hear when
// it plays and pauses: while it plays, the rest of the page dims and it snows.

const API_SRC = "https://www.youtube.com/iframe_api"

// How long the dim takes to fade, and so how long the snow outlives a pause.
const FADE_MS = 700

interface YTPlayer {
    pauseVideo(): void
    destroy(): void
}

interface YTNamespace {
    Player: new (
        el: HTMLElement,
        options: {
            host?: string
            videoId: string
            width?: string
            height?: string
            playerVars?: Record<string, number | string>
            events?: { onStateChange?: (e: { data: number }) => void }
        }
    ) => YTPlayer
    PlayerState: { ENDED: number; PLAYING: number; PAUSED: number }
}

declare global {
    interface Window {
        YT?: YTNamespace
        onYouTubeIframeAPIReady?: () => void
    }
}

let apiPromise: Promise<YTNamespace> | null = null
const loadPlayerApi = () => {
    if (window.YT?.Player) return Promise.resolve(window.YT)
    apiPromise ??= new Promise<YTNamespace>((resolve, reject) => {
        const previous = window.onYouTubeIframeAPIReady
        window.onYouTubeIframeAPIReady = () => {
            previous?.()
            resolve(window.YT!)
        }
        const script = document.createElement("script")
        script.src = API_SRC
        script.async = true
        script.onerror = () => {
            apiPromise = null
            reject()
        }
        document.head.appendChild(script)
    })
    return apiPromise
}

// Snow drifting down a canvas that fills its parent. Flakes are spread over
// three depths: nearer ones are bigger, brighter and faster.
const Snow: FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext("2d")
        if (!canvas || !ctx) return

        let width = 0
        let height = 0
        let flakes: { x: number; y: number; r: number; speed: number; sway: number; phase: number; alpha: number }[] = []

        const makeFlake = (y: number) => {
            const depth = Math.random()
            return {
                x: Math.random() * width,
                y,
                r: 0.8 + depth * 2.4,
                speed: 18 + depth * 42, // px per second
                sway: 6 + Math.random() * 18,
                phase: Math.random() * Math.PI * 2,
                alpha: 0.35 + depth * 0.55,
            }
        }

        const resize = () => {
            const dpr = window.devicePixelRatio || 1
            width = canvas.clientWidth
            height = canvas.clientHeight
            canvas.width = width * dpr
            canvas.height = height * dpr
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
            const count = Math.min(220, Math.round((width * height) / 7000))
            flakes = Array.from({ length: count }, () => makeFlake(Math.random() * height))
        }
        resize()
        window.addEventListener("resize", resize)

        let frame: number
        let last = performance.now()
        const tick = (now: number) => {
            // Cap the step so a backgrounded tab doesn't dump every flake at once.
            const dt = Math.min(0.05, (now - last) / 1000)
            last = now
            ctx.clearRect(0, 0, width, height)
            ctx.fillStyle = "#fff"
            for (const f of flakes) {
                f.y += f.speed * dt
                f.phase += dt * 0.8
                if (f.y - f.r > height) Object.assign(f, makeFlake(-f.r))
                ctx.globalAlpha = f.alpha
                ctx.beginPath()
                ctx.arc(f.x + Math.sin(f.phase) * f.sway, f.y, f.r, 0, Math.PI * 2)
                ctx.fill()
            }
            frame = requestAnimationFrame(tick)
        }
        frame = requestAnimationFrame(tick)

        return () => {
            cancelAnimationFrame(frame)
            window.removeEventListener("resize", resize)
        }
    }, [])

    return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
}

interface YouTubeVideoProps {
    id: string
    title: string
}

const YouTubeVideo: FC<YouTubeVideoProps> = ({ id, title }) => {
    const mountRef = useRef<HTMLDivElement>(null)
    const playerRef = useRef<YTPlayer | null>(null)
    const [started, setStarted] = useState(false)
    const [thumbLoaded, setThumbLoaded] = useState(false)
    const [playing, setPlaying] = useState(false)
    // Keeps the snow falling while the dim fades back out.
    const [snowing, setSnowing] = useState(false)

    const reduceMotion = useMemo(
        () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
        []
    )

    // The API replaces the element it's given with its iframe, so hand it a
    // throwaway div rather than one React owns.
    useEffect(() => {
        if (!started || !mountRef.current) return
        const mount = mountRef.current
        let cancelled = false
        loadPlayerApi().then(
            (YT) => {
                if (cancelled) return
                const target = document.createElement("div")
                mount.appendChild(target)
                playerRef.current = new YT.Player(target, {
                    host: "https://www.youtube-nocookie.com",
                    videoId: id,
                    width: "100%",
                    height: "100%",
                    playerVars: { autoplay: 1, rel: 0, playsinline: 1 },
                    events: {
                        onStateChange: ({ data }) => {
                            if (data === YT.PlayerState.PLAYING) setPlaying(true)
                            else if (data === YT.PlayerState.PAUSED || data === YT.PlayerState.ENDED) setPlaying(false)
                        },
                    },
                })
            },
            // No API: fall back to a plain embed, just without the dimming.
            () => {
                if (cancelled) return
                const iframe = document.createElement("iframe")
                iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`
                iframe.title = title
                iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                iframe.referrerPolicy = "strict-origin-when-cross-origin"
                iframe.allowFullscreen = true
                mount.appendChild(iframe)
            }
        )
        return () => {
            cancelled = true
            playerRef.current?.destroy()
            playerRef.current = null
            mount.replaceChildren()
            setPlaying(false)
        }
    }, [started, id, title])

    useEffect(() => {
        if (playing) return setSnowing(true)
        const timer = window.setTimeout(() => setSnowing(false), FADE_MS)
        return () => window.clearTimeout(timer)
    }, [playing])

    const pause = useCallback(() => playerRef.current?.pauseVideo(), [])

    useEffect(() => {
        if (!playing) return
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && pause()
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [playing, pause])

    // While it plays, the card glides to the middle of the screen. The slot
    // stays put in the page, so the card is measured from there and moved
    // with a transform, and nothing else on the page shifts. Scrolling or
    // resizing while it plays keeps it centered without the glide, which would
    // otherwise trail behind.
    const slotRef = useRef<HTMLDivElement>(null)
    const [shift, setShift] = useState({ x: 0, y: 0, glide: true })

    useEffect(() => {
        if (!playing) return setShift({ x: 0, y: 0, glide: true })
        const centre = (glide: boolean) => {
            const slot = slotRef.current
            if (!slot) return
            const r = slot.getBoundingClientRect()
            const vh = window.innerHeight
            setShift({
                x: window.innerWidth / 2 - (r.left + r.width / 2),
                // Too tall to fit (a phone on its side)? Pin the top instead.
                y: r.height > vh - 32 ? 16 - r.top : vh / 2 - (r.top + r.height / 2),
                glide,
            })
        }
        centre(true)
        let frame = 0
        const follow = () => {
            cancelAnimationFrame(frame)
            frame = requestAnimationFrame(() => centre(false))
        }
        window.addEventListener("scroll", follow, { passive: true })
        window.addEventListener("resize", follow)
        return () => {
            cancelAnimationFrame(frame)
            window.removeEventListener("scroll", follow)
            window.removeEventListener("resize", follow)
        }
    }, [playing])

    // Start fetching the API as soon as someone looks likely to press play.
    const preload = () => void loadPlayerApi().catch(() => {})

    // Padding sticks to sizes Bootstrap doesn't define, as in SoundCloudPlayer.
    // The slot sits above the dim (the navbar's logo is z-50), and the dim is
    // hidden rather than just transparent when off, since iOS Safari tints its
    // bars from full-screen fixed layers but skips hidden ones (see
    // GeometricBackground).
    return (
        <>
            <div
                aria-hidden
                onClick={pause}
                className={`fixed inset-0 z-[60] overflow-hidden bg-[rgba(10,20,26,0.8)] transition-[opacity,visibility] ${playing ? "visible opacity-100" : "invisible opacity-0"}`}
                style={{ transitionDuration: `${FADE_MS}ms` }}
            >
                {snowing && !reduceMotion && <Snow />}
            </div>

            <div ref={slotRef} className="relative z-[70]">
                <div
                    className={`rounded-sm border border-white bg-jk-teal p-[1.25rem] sm:p-8 ${playing ? "shadow-[0_24px_60px_0px_rgba(0,_0,_0,_0.55)]" : "shadow-[5px_6px_11px_0px_rgba(0,_0,_0,_0.3)]"}`}
                    style={{
                        transform: `translate3d(${shift.x}px, ${shift.y}px, 0)`,
                        transition:
                            shift.glide && !reduceMotion
                                ? `transform ${FADE_MS}ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow ${FADE_MS}ms ease-out`
                                : "none",
                        willChange: started ? "transform" : undefined,
                    }}
                >
                    <div className="group relative aspect-video w-full overflow-hidden rounded-sm bg-white/15 shadow-lg">
                        {started ? (
                            <div ref={mountRef} className="absolute inset-0 [&>iframe]:h-full [&>iframe]:w-full [&>iframe]:border-0" />
                        ) : (
                            <button
                                type="button"
                                onClick={() => setStarted(true)}
                                onPointerEnter={preload}
                                onFocus={preload}
                                aria-label={`Play ${title}`}
                                className="absolute inset-0 block w-full"
                            >
                                <img
                                    src={`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`}
                                    alt=""
                                    loading="lazy"
                                    onLoad={() => setThumbLoaded(true)}
                                    className="h-full w-full object-cover transition-[opacity,transform] duration-500 ease-out group-hover:scale-[1.02]"
                                    style={{ opacity: thumbLoaded ? 1 : 0 }}
                                />
                                <span
                                    className={`absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition-[opacity,background-color] group-hover:bg-black/50 ${thumbLoaded ? "opacity-100" : "opacity-0"}`}
                                >
                                    <svg aria-hidden viewBox="0 0 24 24" className="h-8 w-8" fill="currentColor">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default YouTubeVideo
