import { FC, useState } from "react"

// A single YouTube video in a card that matches the SoundCloud player. It
// shows the video's thumbnail with a play button, and only swaps in the real
// (privacy-enhanced) embed once someone clicks, so the page doesn't load
// YouTube's player up front.

interface YouTubeVideoProps {
    id: string
    title: string
}

const YouTubeVideo: FC<YouTubeVideoProps> = ({ id, title }) => {
    const [started, setStarted] = useState(false)
    const [thumbLoaded, setThumbLoaded] = useState(false)

    // Padding sticks to sizes Bootstrap doesn't define, as in SoundCloudPlayer.
    return (
        <div className="rounded-sm border border-white bg-jk-teal p-[1.25rem] shadow-[5px_6px_11px_0px_rgba(0,_0,_0,_0.3)] sm:p-8">
            <div className="group relative aspect-video w-full overflow-hidden rounded-sm bg-white/15 shadow-lg">
                {started ? (
                    <iframe
                        src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
                        title={title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                        className="absolute inset-0 h-full w-full border-0"
                    />
                ) : (
                    <button type="button" onClick={() => setStarted(true)} aria-label={`Play ${title}`} className="absolute inset-0 block w-full">
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
    )
}

export default YouTubeVideo
