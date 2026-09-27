import { FC, MouseEvent, memo, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSoundcloud } from "@fortawesome/free-brands-svg-icons"
import { Waveform } from "./BannerVisuals"

// A custom player for the SoundCloud playlist. The real SoundCloud widget
// still does the playing, invisibly, and we drive it through its Widget API
// (https://developers.soundcloud.com/docs/api/html5-widget). If the API never
// comes up we fall back to showing the stock embed, and if the browser won't
// let a scripted play() through (iOS wants a tap inside the iframe itself) we
// reveal the compact widget until playback starts.

const PLAYLIST = "https://api.soundcloud.com/playlists/1754728098"
const WIDGET_SRC = `https://w.soundcloud.com/player/?url=${encodeURIComponent(PLAYLIST)}&color=%2393b2bc&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true`
const API_SRC = "https://w.soundcloud.com/player/api.js"

// How long to wait for the widget before falling back to the stock embed, and
// for a requested play to actually start before revealing the widget.
const READY_TIMEOUT_MS = 12000
const PLAY_TIMEOUT_MS = 3000

const BARS = 72
const UNPLAYED = "#93b2bc"

interface SCSound {
    id: number
    title?: string
    duration?: number
    artwork_url?: string | null
    waveform_url?: string
    permalink_url?: string
    user?: { avatar_url?: string }
}

interface SCProgress {
    currentPosition?: number
}

interface SCWidget {
    bind(event: string, cb: (e?: SCProgress) => void): void
    unbind(event: string): void
    toggle(): void
    seekTo(ms: number): void
    skip(index: number): void
    getSounds(cb: (sounds: SCSound[]) => void): void
    getCurrentSoundIndex(cb: (index: number) => void): void
}

declare global {
    interface Window {
        SC?: { Widget: (iframe: HTMLIFrameElement) => SCWidget }
    }
}

const EVENTS = { READY: "ready", PLAY: "play", PAUSE: "pause", FINISH: "finish", PROGRESS: "playProgress" }

let apiPromise: Promise<void> | null = null
const loadWidgetApi = () => {
    if (window.SC?.Widget) return Promise.resolve()
    apiPromise ??= new Promise<void>((resolve, reject) => {
        const script = document.createElement("script")
        script.src = API_SRC
        script.async = true
        script.onload = () => resolve()
        script.onerror = () => {
            apiPromise = null
            reject()
        }
        document.head.appendChild(script)
    })
    return apiPromise
}

// Squash SoundCloud's waveform samples (~1800 of them) into BARS heights,
// 0–1. Loudly mastered songs sit near the top the whole way through, so each
// bar is its bucket's average, stretched between the track's fairly quiet
// (20th percentile) and loudest bars to bring out the shape.
const toBars = (samples: number[]) => {
    const size = samples.length / BARS
    const means = Array.from({ length: BARS }, (_, i) => {
        const bucket = samples.slice(Math.floor(i * size), Math.max(Math.floor(i * size) + 1, Math.floor((i + 1) * size)))
        return bucket.reduce((sum, v) => sum + v, 0) / bucket.length
    })
    const low = [...means].sort((a, b) => a - b)[Math.floor(BARS * 0.2)]
    const range = Math.max(...means) - low || 1
    return means.map((m) => 0.15 + 0.85 * Math.max(0, (m - low) / range))
}

// Stand-in bars if a track's waveform can't be fetched: the home page
// banner's wobble-under-a-swell, shifted per track so they differ.
const fakeBars = (seed: number) =>
    Array.from({ length: BARS }, (_, i) => {
        const x = i + (seed % 97)
        return 0.2 + 0.8 * Math.abs(Math.sin(x * 0.9) * Math.cos(x * 0.23 + 1))
    })

// Flat bars shown until a waveform arrives; the real shape grows out of them.
const RESTING = Array<number>(BARS).fill(0.12)

// Placeholder rows while the playlist loads, so the card doesn't jump when
// the real ones arrive. Keep in step with the playlist's length.
const SKELETON_ROWS = 9

const bigArtwork = (sound?: SCSound) => {
    const url = sound?.artwork_url || sound?.user?.avatar_url
    return url?.replace("-large.", "-t500x500.")
}

const formatTime = (ms = 0) => {
    const s = Math.floor(ms / 1000)
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`
}

const ICONS = {
    play: "M8 5v14l11-7z",
    pause: "M6 5h4v14H6zM14 5h4v14h-4z",
    prev: "M6 6h2v12H6zM9.5 12l8.5 6V6z",
    next: "M6 18l8.5-6L6 6zM16 6h2v12h-2z",
}

const Icon: FC<{ d: string; className?: string }> = ({ d, className = "h-5 w-5" }) => (
    <svg aria-hidden viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d={d} />
    </svg>
)

// Unplayed bars with the played part (and, on hover, the part you'd seek
// past) painted over in white, clipped like the home page's MiniPlayer.
const ProgressWaveform = memo<{ bars: number[]; progress: number; hover?: number | null; grow?: boolean }>(
    ({ bars, progress, hover, grow }) => (
        <>
            <Waveform bars={bars} grow={grow} fill={UNPLAYED} opacity={0.7} />
            {hover != null && (
                <Waveform bars={bars} grow={grow} fill="#fff" opacity={0.35} style={{ clipPath: `inset(0 ${100 - hover * 100}% 0 0)` }} />
            )}
            <Waveform bars={bars} grow={grow} fill="#fff" style={{ clipPath: `inset(0 ${100 - progress * 100}% 0 0)` }} />
        </>
    )
)

// The card's backdrop: the current track's artwork, faint, filling the card.
// The cover is cropped to the card's shape and pans across over the course of
// the song (top to bottom on a wide card, left to right on a tall one), so it
// doubles as a progress bar. Each new cover fades in once it's loaded.
const Backdrop: FC<{ src?: string; progress: number }> = ({ src, progress }) => {
    const [loaded, setLoaded] = useState(false)
    return (
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-sm">
            {src && (
                <img
                    src={src}
                    alt=""
                    onLoad={() => setLoaded(true)}
                    className="h-full w-full object-cover"
                    style={{
                        opacity: loaded ? 0.12 : 0,
                        objectPosition: `${progress * 100}% ${progress * 100}%`,
                        // Short glide on the pan so seeks don't jump.
                        transition: "opacity 700ms ease-out, object-position 300ms linear",
                    }}
                />
            )}
        </div>
    )
}

// Three little bars that bounce while the current track plays.
const Equalizer: FC<{ playing: boolean }> = ({ playing }) => (
    <span aria-hidden className="flex h-3 items-end gap-[2px]">
        {[0, 0.25, 0.5].map((delay) => (
            <span
                key={delay}
                className="jk-eq-bar w-[3px] bg-white"
                style={{ animationDelay: `-${delay}s`, animationPlayState: playing ? "running" : "paused" }}
            />
        ))}
    </span>
)

interface TrackRowProps {
    sound: SCSound
    index: number
    bars: number[]
    grow: boolean
    current: boolean
    playing: boolean
    progress: number
    onSelect: (index: number) => void
}

const TrackRow = memo<TrackRowProps>(({ sound, index, bars, grow, current, playing, progress, onSelect }) => (
    <li className="jk-fade-in" style={{ animationDelay: `${index * 70}ms` }}>
        <button
            type="button"
            onClick={() => onSelect(index)}
            className={`flex w-full items-center gap-3.5 rounded-sm px-2 py-2 text-left text-white transition-colors hover:bg-white/10 ${current ? "bg-white/10" : ""}`}
        >
            <span className="flex w-4 flex-none justify-center text-xs tabular-nums text-white/70">
                {current ? <Equalizer playing={playing} /> : index + 1}
            </span>
            {sound.artwork_url || sound.user?.avatar_url ? (
                <img
                    src={(sound.artwork_url || sound.user?.avatar_url)!}
                    alt=""
                    loading="lazy"
                    className="h-10 w-10 flex-none rounded-[2px] object-cover shadow-sm"
                />
            ) : (
                <span className="h-10 w-10 flex-none rounded-[2px] bg-white/10" />
            )}
            <span className="min-w-0 flex-1 truncate text-sm">
                {sound.title ? (
                    <span className="jk-fade-in">{sound.title}</span>
                ) : (
                    <span className="inline-block h-3 w-28 animate-pulse rounded-sm bg-white/15 align-middle" />
                )}
            </span>
            <span className="relative hidden h-6 w-32 flex-none sm:block md:w-44">
                <ProgressWaveform bars={bars} grow={grow} progress={current ? progress : 0} />
            </span>
            <span className="w-10 flex-none text-right text-xs tabular-nums text-white/70">
                {sound.duration ? formatTime(sound.duration) : ""}
            </span>
        </button>
    </li>
))

// A TrackRow's shape with nothing in it yet.
const SkeletonRow: FC = () => (
    <li aria-hidden className="flex items-center gap-3.5 px-2 py-2">
        <span className="w-4 flex-none" />
        <span className="h-10 w-10 flex-none rounded-[2px] bg-white/10" />
        <span className="min-w-0 flex-1">
            <span className="block h-3 w-28 rounded-sm bg-white/15" />
        </span>
        <span className="relative hidden h-6 w-32 flex-none sm:block md:w-44">
            <Waveform bars={RESTING} fill={UNPLAYED} opacity={0.5} />
        </span>
        <span className="flex w-10 flex-none justify-end">
            <span className="block h-2.5 w-7 rounded-sm bg-white/15" />
        </span>
    </li>
)

type Mode = "loading" | "api" | "embed"

const SoundCloudPlayer = () => {
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const widgetRef = useRef<SCWidget | null>(null)
    const playTimer = useRef<number>()
    // Whether anyone has asked for playback yet. Until then, play events are
    // just the widget loading the first track (see the ready handler).
    const playRequested = useRef(false)
    // Last reported position and when we heard it, so we can animate between
    // the widget's (fairly coarse) progress events.
    const clock = useRef({ pos: 0, at: 0 })

    const [scriptLoaded, setScriptLoaded] = useState(false)
    const [mode, setMode] = useState<Mode>("loading")
    const [blocked, setBlocked] = useState(false)
    const [sounds, setSounds] = useState<SCSound[]>([])
    const [waves, setWaves] = useState<Record<number, number[]>>({})
    const [index, setIndex] = useState(0)
    const [playing, setPlaying] = useState(false)
    const [position, setPosition] = useState(0)
    const [hover, setHover] = useState<number | null>(null)
    const [artLoaded, setArtLoaded] = useState(false)

    const reduceMotion = useMemo(
        () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
        []
    )

    useEffect(() => {
        loadWidgetApi().then(
            () => setScriptLoaded(true),
            () => setMode("embed")
        )
        const timer = window.setTimeout(() => setMode((m) => (m === "loading" ? "embed" : m)), READY_TIMEOUT_MS)
        return () => window.clearTimeout(timer)
    }, [])

    // The iframe only mounts once the API script is in, so binding here always
    // happens before the widget can announce it's ready.
    useEffect(() => {
        if (!scriptLoaded || !iframeRef.current || !window.SC) return
        const iframe = iframeRef.current
        const widget = window.SC.Widget(iframe)
        widgetRef.current = widget

        // Playlists can hand back bare track stubs until they load, so keep
        // asking until every track has a title.
        let refetch: number | undefined
        const fetchSounds = (tries = 0) =>
            widget.getSounds((list) => {
                setSounds(list)
                if (list.some((s) => !s.title) && tries < 8) {
                    refetch = window.setTimeout(() => fetchSounds(tries + 1), 1500)
                }
            })

        const markPosition = (pos = 0) => {
            clock.current = { pos, at: performance.now() }
            setPosition(pos)
        }

        widget.bind(EVENTS.READY, () => {
            setMode("api")
            fetchSounds()
            // The widget only fetches a track's stream when it's first asked
            // to play, and by the time that comes back mobile browsers no
            // longer count the play as coming from the tap, so it starts and
            // immediately stops. Seeking is the one API call that loads the
            // stream without playing, so the first tap can play straight away.
            // It does announce a play, though, which the play handler ignores.
            widget.seekTo(0)
        })
        widget.bind(EVENTS.PLAY, (e) => {
            if (!playRequested.current) return
            window.clearTimeout(playTimer.current)
            setBlocked(false)
            setPlaying(true)
            markPosition(e?.currentPosition)
            widget.getCurrentSoundIndex(setIndex)
        })
        widget.bind(EVENTS.PAUSE, (e) => {
            setPlaying(false)
            markPosition(e?.currentPosition ?? clock.current.pos)
        })
        widget.bind(EVENTS.FINISH, () => {
            setPlaying(false)
            markPosition(0)
        })
        widget.bind(EVENTS.PROGRESS, (e) => {
            clock.current = { pos: e?.currentPosition ?? 0, at: performance.now() }
        })

        return () => {
            window.clearTimeout(refetch)
            window.clearTimeout(playTimer.current)
            // Unbinding messages the iframe, which is already gone when the
            // whole page unmounts (the widget then throws on a null
            // contentWindow); there's nothing left to unbind from anyway.
            if (iframe.contentWindow) Object.values(EVENTS).forEach((event) => widget.unbind(event))
            widgetRef.current = null
        }
    }, [scriptLoaded])

    // Fetch each track's real waveform (the JSON twin of its waveform PNG).
    // Bars rest flat until it arrives, or fall back to stand-ins if it can't.
    // Stub tracks (no title yet) wait until the playlist fills them in.
    const requested = useRef(new Set<number>())
    useEffect(() => {
        sounds.forEach((sound) => {
            if (!sound.title || requested.current.has(sound.id)) return
            requested.current.add(sound.id)
            const setBars = (bars: number[]) => setWaves((w) => ({ ...w, [sound.id]: bars }))
            if (!sound.waveform_url) return setBars(fakeBars(sound.id))
            fetch(sound.waveform_url.replace(/\.png$/, ".json"))
                .then((res) => (res.ok ? res.json() : Promise.reject()))
                .then((data: { samples?: number[] }) => setBars(data.samples?.length ? toBars(data.samples) : fakeBars(sound.id)))
                .catch(() => setBars(fakeBars(sound.id)))
        })
    }, [sounds])

    const current = sounds[index]
    const duration = current?.duration ?? 0

    // Glide the playhead between progress events.
    useEffect(() => {
        if (!playing) return
        let frame: number
        const tick = () => {
            const { pos, at } = clock.current
            setPosition(Math.min(pos + performance.now() - at, duration || Infinity))
            frame = requestAnimationFrame(tick)
        }
        frame = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(frame)
    }, [playing, duration])

    // Anything that should start playback: if nothing's playing shortly after,
    // the browser probably wants a tap in the widget itself, so show it.
    const requestPlay = useCallback((action: (widget: SCWidget) => void) => {
        const widget = widgetRef.current
        if (!widget) return
        playRequested.current = true
        window.clearTimeout(playTimer.current)
        playTimer.current = window.setTimeout(() => setBlocked(true), PLAY_TIMEOUT_MS)
        action(widget)
    }, [])

    const toggle = useCallback(() => {
        if (playing) widgetRef.current?.toggle()
        else requestPlay((w) => w.toggle())
    }, [playing, requestPlay])

    const select = useCallback(
        (i: number) => {
            if (i === index) return toggle()
            setIndex(i)
            clock.current = { pos: 0, at: performance.now() }
            setPosition(0)
            requestPlay((w) => w.skip(i))
        },
        [index, toggle, requestPlay]
    )

    const seek = (rel: number) => {
        if (!duration) return
        const pos = rel * duration
        clock.current = { pos, at: performance.now() }
        setPosition(pos)
        widgetRef.current?.seekTo(pos)
        if (!playing) requestPlay((w) => w.toggle())
    }

    const prev = () => (position > 3000 || index === 0 ? seek(0) : select(index - 1))
    const next = () => {
        if (index < sounds.length - 1) select(index + 1)
    }

    const relAt = (e: MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect()
        return Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
    }

    const progress = duration ? Math.min(1, position / duration) : 0
    const bars = (current && waves[current.id]) || RESTING

    // How loud the song is right now, read off its waveform, nudges the artwork.
    const level = playing && !reduceMotion ? bars[Math.min(bars.length - 1, Math.floor(progress * bars.length))] : 0
    const art = bigArtwork(current)

    const iframeClass =
        mode === "embed"
            ? "h-[450px] w-full overflow-hidden rounded-md shadow-[5px_6px_11px_0px_rgba(0,_0,_0,_0.3)]"
            : blocked
              ? "mt-6 block h-[166px] w-full rounded-sm"
              : "pointer-events-none absolute bottom-0 left-0 -z-10 h-[166px] w-full opacity-0"

    // Spacing classes below stick to sizes Bootstrap doesn't define (its
    // 0–5 utilities are !important and would win), and links need !text-*
    // to beat the site-wide link color.
    return (
        <div
            className={
                mode === "embed"
                    ? ""
                    : "relative isolate rounded-sm border border-white bg-jk-teal p-[1.25rem] shadow-[5px_6px_11px_0px_rgba(0,_0,_0,_0.3)] sm:p-8"
            }
        >
            {mode !== "embed" && (
                <>
                    <Backdrop key={art} src={art} progress={progress} />

                    {current?.permalink_url && (
                        <a
                            href={current.permalink_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Open on SoundCloud"
                            className="absolute right-3 top-3 leading-none !text-white/60 transition-colors hover:!text-white sm:right-4 sm:top-4"
                        >
                            <FontAwesomeIcon icon={faSoundcloud} className="h-5 w-5" />
                        </a>
                    )}

                    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-stretch sm:gap-8">
                        <div className="group relative h-48 w-48 flex-none">
                            {/* Placeholder square the cover fades in over */}
                            <div
                                className={`absolute inset-0 rounded-sm bg-white/15 transition-opacity duration-500 ${artLoaded ? "opacity-0" : "animate-pulse"}`}
                            />
                            {art && (
                                <img
                                    src={art}
                                    alt=""
                                    onLoad={() => setArtLoaded(true)}
                                    className="relative h-full w-full rounded-sm object-cover shadow-lg"
                                    style={{
                                        opacity: artLoaded ? 1 : 0,
                                        transform: `scale(${1 + level * 0.025})`,
                                        transition: "opacity 500ms ease-out, transform 150ms ease-out",
                                    }}
                                />
                            )}
                            <button
                                type="button"
                                onClick={toggle}
                                disabled={mode !== "api"}
                                aria-label={playing ? "Pause" : "Play"}
                                className={`absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition-[opacity,background-color] hover:bg-black/50 focus-visible:opacity-100 disabled:opacity-0 ${!artLoaded ? "opacity-0" : playing ? "opacity-0 group-hover:opacity-100" : "opacity-100"}`}
                            >
                                <Icon d={playing ? ICONS.pause : ICONS.play} className="h-8 w-8" />
                            </button>
                        </div>

                        {/* Title up top, controls along the bottom, lined up
                            with the artwork's edges on wider screens */}
                        <div className="flex w-full min-w-0 flex-1 flex-col justify-between text-white">
                            <h3 className="m-0 truncate text-lg font-semibold leading-snug text-white max-sm:text-center sm:pr-8">
                                {current?.title ? (
                                    <span key={current.id} className="jk-fade-in">
                                        {current.title}
                                    </span>
                                ) : (
                                    <span className="inline-block h-4 w-48 animate-pulse rounded-sm bg-white/15 align-middle" />
                                )}
                            </h3>

                            <div
                                role="slider"
                                tabIndex={duration ? 0 : -1}
                                aria-label="Seek"
                                aria-valuemin={0}
                                aria-valuemax={Math.round(duration / 1000)}
                                aria-valuenow={Math.round(position / 1000)}
                                aria-valuetext={formatTime(position)}
                                className="relative mt-3.5 h-16 cursor-pointer touch-none sm:h-[4.5rem]"
                                onPointerMove={(e) => e.pointerType === "mouse" && setHover(relAt(e))}
                                onPointerLeave={() => setHover(null)}
                                onClick={(e) => seek(relAt(e))}
                                onKeyDown={(e) => {
                                    if (!duration) return
                                    if (e.key === "ArrowRight") seek(Math.min(1, (position + 5000) / duration))
                                    else if (e.key === "ArrowLeft") seek(Math.max(0, (position - 5000) / duration))
                                    else return
                                    e.preventDefault()
                                }}
                            >
                                <ProgressWaveform bars={bars} grow={!reduceMotion} progress={progress} hover={hover} />
                            </div>

                            {/* Elapsed under the waveform's start, total under its
                                end, transport between them */}
                            <div className="mt-2.5 grid grid-cols-[1fr_auto_1fr] items-center text-xs tabular-nums text-white/70">
                                {/* Times fade in once there's a track to time */}
                                <span className={`transition-opacity duration-500 ${duration ? "" : "opacity-0"}`}>{formatTime(position)}</span>
                                <div className="flex items-center gap-2.5">
                                    <button type="button" onClick={prev} disabled={mode !== "api"} aria-label="Previous track" className="rounded-full p-2 text-white/80 transition-[color,background-color,opacity] duration-300 hover:bg-white/10 hover:text-white disabled:opacity-40">
                                        <Icon d={ICONS.prev} />
                                    </button>
                                    <button type="button" onClick={toggle} disabled={mode !== "api"} aria-label={playing ? "Pause" : "Play"} className="rounded-full bg-white p-2.5 text-jk-teal shadow-md shadow-black/25 transition-[transform,opacity] duration-300 hover:scale-105 disabled:opacity-40">
                                        <Icon d={playing ? ICONS.pause : ICONS.play} />
                                    </button>
                                    <button type="button" onClick={next} disabled={mode !== "api" || index >= sounds.length - 1} aria-label="Next track" className="rounded-full p-2 text-white/80 transition-[color,background-color,opacity] duration-300 hover:bg-white/10 hover:text-white disabled:opacity-40">
                                        <Icon d={ICONS.next} />
                                    </button>
                                </div>
                                <span className={`text-right transition-opacity duration-500 ${duration ? "" : "opacity-0"}`}>{formatTime(duration)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 border-t border-white/30 pt-2.5 sm:mt-8">
                        {/* Rows bleed out by their own padding so their
                            contents line up with the artwork above */}
                        <ol className={`-mx-2 mb-0 list-none pl-0 ${sounds.length ? "" : "animate-pulse"}`}>
                            {sounds.length
                                ? sounds.map((sound, i) => (
                                    <TrackRow
                                        key={sound.id}
                                        sound={sound}
                                        index={i}
                                        bars={waves[sound.id] ?? RESTING}
                                        grow={!reduceMotion}
                                        current={i === index}
                                        playing={i === index && playing}
                                        progress={i === index ? progress : 0}
                                        onSelect={select}
                                    />
                                ))
                                : Array.from({ length: SKELETON_ROWS }, (_, i) => <SkeletonRow key={i} />)}
                        </ol>
                    </div>
                </>
            )}

            {(scriptLoaded || mode === "embed") && (
                <iframe
                    ref={iframeRef}
                    title="SoundCloud player"
                    aria-hidden={mode !== "embed" && !blocked}
                    tabIndex={mode !== "embed" && !blocked ? -1 : undefined}
                    allow="autoplay"
                    src={WIDGET_SRC}
                    className={iframeClass}
                />
            )}
        </div>
    )
}

export default SoundCloudPlayer
