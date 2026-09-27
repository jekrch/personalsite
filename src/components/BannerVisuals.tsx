import { CSSProperties, FC } from "react"

// Objects for the home page Banners. Each lines up with the card's text on
// the left (via the Banner's --pad), runs off the card's right (and sometimes
// bottom) edge, and shifts a little when the card is hovered (the Banner link
// is the `group`).

const OBJECT = "absolute shadow-lg shadow-black/40 transition-transform duration-300 ease-out"

// A ruled index card with modus ponens on it, as it appears in the slides.
// Proof rows share the rule spacing so each line sits on a rule.
const RULE = "1.35rem"
const HEADER = "1.6rem"

export const IndexCardProof: FC = () => (
    <div
        className={`${OBJECT} left-[var(--pad)] right-[-1.5rem] bottom-[-1.75rem] rounded-[2px] pl-4 pr-10 pb-6 font-serif -rotate-[2deg] group-hover:-rotate-[1deg] group-hover:-translate-y-2`}
        style={{
            backgroundColor: "#f4f1e8",
            backgroundImage: `linear-gradient(rgba(196,78,78,0.55), rgba(196,78,78,0.55)), repeating-linear-gradient(to bottom, transparent 0 calc(${RULE} - 1px), rgba(91,133,146,0.3) calc(${RULE} - 1px) ${RULE})`,
            backgroundSize: "100% 1px, 100% 100%",
            backgroundPosition: `0 ${HEADER}, 0 ${HEADER}`,
            backgroundRepeat: "no-repeat",
        }}
    >
        <div
            className="flex items-end pb-[3px] text-[0.75rem] uppercase tracking-wider text-[#564A3E]"
            style={{ height: HEADER }}
        >
            Modus Ponens
        </div>
        <div
            className="grid grid-cols-[auto_1fr_auto] gap-x-2 text-[0.9rem] text-[#3f4e53]"
            style={{ lineHeight: RULE }}
        >
            <span>1.</span><span>(T ∨ W) ⊃ B</span><span className="text-[#7a8a8f]">Pr.</span>
            <span>2.</span><span>T ∨ W</span><span className="text-[#7a8a8f]">Pr.</span>
            <span>3.</span><span>B</span><span className="text-[#7a8a8f]">M.P. 1,2</span>
        </div>
    </div>
)

// Fixed, decorative bar heights (0–1): a fast wobble under a slow swell.
const WAVEFORM = Array.from(
    { length: 72 },
    (_, i) => 0.2 + 0.8 * Math.abs(Math.sin(i * 0.9) * Math.cos(i * 0.23 + 1))
)

// With `grow`, each bar is drawn full height and scaled down from the bottom,
// so when the heights change the bars rise or fall into place left to right.
export const Waveform: FC<{
    className?: string
    style?: CSSProperties
    fill: string
    opacity?: number
    bars?: number[]
    grow?: boolean
}> = ({ className = "", style, fill, opacity = 1, bars = WAVEFORM, grow = false }) => (
    <svg
        aria-hidden
        className={`absolute inset-0 h-full w-full ${className}`}
        style={style}
        viewBox={`0 0 ${bars.length * 3} 40`}
        preserveAspectRatio="none"
    >
        {bars.map((h, i) =>
            grow ? (
                <rect
                    key={i}
                    x={i * 3}
                    y={0}
                    width={2}
                    height={40}
                    fill={fill}
                    fillOpacity={opacity}
                    style={{
                        transform: `scaleY(${h})`,
                        transformBox: "fill-box",
                        transformOrigin: "bottom",
                        transition: `transform 600ms cubic-bezier(0.2, 0.8, 0.2, 1) ${i * 6}ms`,
                    }}
                />
            ) : (
                <rect key={i} x={i * 3} y={40 - h * 40} width={2} height={h * 40} fill={fill} fillOpacity={opacity} />
            )
        )}
    </svg>
)

// A pared-down version of the SoundCloud player on the Music page: the
// artwork beside a waveform (unplayed bars in the embed's #93b2bc) that runs
// off the card's edge. Hovering plays it forward a little.
export const MiniPlayer: FC<{ src: string }> = ({ src }) => (
    <div className="absolute left-[var(--pad)] right-[-1rem] bottom-[var(--pad)] flex items-end gap-[0.75rem]">
        <img
            src={src}
            alt=""
            loading="lazy"
            className="h-20 w-20 flex-none rounded-[2px] object-cover shadow-lg shadow-black/40"
        />
        <div className="relative h-14 min-w-0 flex-1">
            <Waveform fill="#93b2bc" opacity={0.7} />
            <Waveform
                fill="#fff"
                className="transition-[clip-path] duration-700 ease-out [clip-path:inset(0_62%_0_0)] group-hover:[clip-path:inset(0_38%_0_0)]"
            />
        </div>
    </div>
)

// Per-page tilt and hover nudge, in pile order. Literal class strings so
// Tailwind can see them.
const PILE_POSES = [
    "-rotate-[8deg] group-hover:-rotate-[12deg] group-hover:-translate-x-3",
    "rotate-[3deg] group-hover:rotate-[1deg] group-hover:-translate-y-2",
    "-rotate-[4deg] group-hover:-rotate-[7deg] group-hover:-translate-y-3",
    "rotate-[6deg] group-hover:rotate-[9deg] group-hover:translate-x-2",
]

// Comic pages in a loose overlapping pile, each at its own aspect ratio.
// The first page is dropped on phones so the pile fits the narrow card.
export const ComicPile: FC<{ pages: string[] }> = ({ pages }) => (
    <div className="absolute right-[-2.5rem] bottom-[-2.5rem] flex items-end">
        {pages.map((src, i) => (
            <img
                key={src}
                src={src}
                alt=""
                loading="lazy"
                className={`h-[9rem] md:h-[11rem] w-auto flex-none origin-bottom rounded-[2px] shadow-lg shadow-black/40 transition-transform duration-300 ease-out ${i > 0 ? "-ml-12" : "hidden sm:block"} ${PILE_POSES[i % PILE_POSES.length]}`}
            />
        ))}
    </div>
)
