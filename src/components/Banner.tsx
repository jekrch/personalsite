import { CSSProperties, FC, ReactNode, useEffect, useRef, useState } from "react"
import OffsetFrames from "./OffsetFrames"

interface BannerProps {
    /** URL the banner links to */
    href: string
    /** Main heading text */
    title: string
    /** One line beneath the title */
    description?: string
    /** The banner's visual — an object below the text that may bleed off
     *  the card's right and bottom edges */
    children?: ReactNode
    /** Additional className for the outer link (e.g. grid placement) */
    className?: string
    /** Stagger (ms) for the scroll-in reveal when several cards enter together */
    revealDelay?: number
    /** Which background arrangement to use (see MOTIFS) */
    motif?: number
}

// Flips to true the first time the element scrolls into view, then stops
// observing so the reveal only plays once.
const useRevealOnScroll = <T extends Element>() => {
    const ref = useRef<T>(null)
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const el = ref.current
        if (!el) return
        if (typeof IntersectionObserver === "undefined") {
            setVisible(true)
            return
        }
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true)
                    observer.disconnect()
                }
            },
            { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
        )
        observer.observe(el)
        return () => observer.disconnect()
    }, [])

    return [ref, visible] as const
}

// Echoes the site's GeometricBackground: faint diagonal bands with pairs of
// thin parallel lines along their edges. Each card gets its own arrangement
// and light direction so they read as a set rather than copies. The SVG
// stretches to the card, so wide and narrow cards also get different slants.
const LINE = { stroke: "#fff", vectorEffect: "non-scaling-stroke" } as const

const MOTIFS: { light: string; shapes: ReactNode }[] = [
    {
        // Band leaning right, lines along its right edge; light from top left.
        light: "radial-gradient(ellipse at top left, rgba(255,255,255,0.12), transparent 60%)",
        shapes: (
            <>
                <polygon points="58,0 90,0 50,100 18,100" fill="#fff" fillOpacity="0.06" />
                <line x1="94" y1="0" x2="54" y2="100" strokeOpacity="0.16" {...LINE} />
                <line x1="97" y1="0" x2="57" y2="100" strokeOpacity="0.08" {...LINE} />
            </>
        ),
    },
    {
        // Mirrored: band leaning left, lines along its left edge, a deeper
        // shade in the lower right; light from top right.
        light: "radial-gradient(ellipse at top right, rgba(255,255,255,0.11), transparent 55%), linear-gradient(to top left, rgba(63,78,83,0.28), transparent 50%)",
        shapes: (
            <>
                <polygon points="12,0 40,0 84,100 56,100" fill="#fff" fillOpacity="0.05" />
                <line x1="8" y1="0" x2="52" y2="100" strokeOpacity="0.14" {...LINE} />
                <line x1="5" y1="0" x2="49" y2="100" strokeOpacity="0.07" {...LINE} />
            </>
        ),
    },
    {
        // Wide: a sliver of band on the left and a broad one on the right with
        // lines along its edge; light from bottom left, deeper shade at right.
        light: "radial-gradient(ellipse at bottom left, rgba(255,255,255,0.12), transparent 55%), linear-gradient(to left, rgba(63,78,83,0.3), transparent 45%)",
        shapes: (
            <>
                <polygon points="9,0 15,0 11,100 5,100" fill="#fff" fillOpacity="0.06" />
                <polygon points="72,0 100,0 100,100 56,100" fill="#fff" fillOpacity="0.05" />
                <line x1="68" y1="0" x2="52" y2="100" strokeOpacity="0.16" {...LINE} />
                <line x1="70" y1="0" x2="54" y2="100" strokeOpacity="0.08" {...LINE} />
            </>
        ),
    },
]

const CardMotif: FC<{ shapes: ReactNode }> = ({ shapes }) => (
    <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
    >
        {shapes}
    </svg>
)

const Banner: FC<BannerProps> = ({
    href,
    title,
    description,
    children,
    className = "",
    revealDelay = 0,
    motif = 0,
}) => {
    const { light, shapes } = MOTIFS[motif % MOTIFS.length]
    const [ref, visible] = useRevealOnScroll<HTMLAnchorElement>()

    const handleClick = () => {
        if (href.startsWith("#") || href.startsWith("/#")) {
            // Let the default navigation happen (URL updates)
            // Then immediately scroll to top
            requestAnimationFrame(() => {
                window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                })
            })
        }
    }

    return (
        <a
            ref={ref}
            href={href}
            onClick={handleClick}
            className={`group reveal relative block no-underline hover:no-underline ${visible ? "is-visible" : ""} ${className}`}
            style={{ ["--reveal-delay" as string]: `${revealDelay}ms` } as CSSProperties}
        >
            {/* --pad drives the card padding, the visual area's pull back out to
                the edges, and objects' alignment with the text. Arbitrary values
                on purpose: Bootstrap's spacing utilities (p-5 etc.) are
                !important and would override Tailwind's. */}
            <div
                className="relative flex h-full flex-col overflow-hidden rounded-sm border border-white bg-jk-teal [--pad:1.5rem] sm:[--pad:2.5rem] p-[var(--pad)] shadow-[5px_6px_11px_0px_rgba(0,_0,_0,_0.3)]"
                style={{
                    backgroundImage: `${light}, linear-gradient(to bottom, transparent 55%, rgba(0,0,0,0.08))`,
                }}
            >
                <CardMotif shapes={shapes} />

                <div className="relative z-10">
                    <h3 className="m-0 text-lg font-semibold text-white">{title}</h3>
                    {description && (
                        <p className="m-0 mt-1 text-sm text-white/80">{description}</p>
                    )}
                </div>

                {/* Visual area below the text, flush with the card's right and
                    bottom edges so objects can bleed off them without ever
                    reaching up into the text. */}
                {children && (
                    <div className="reveal-object pointer-events-none relative mx-[calc(var(--pad)*-1)] mb-[calc(var(--pad)*-1)] mt-[0.75rem] min-h-[8.5rem] flex-1">
                        {children}
                    </div>
                )}
            </div>

            {/* Same hover as the project carousel's featured screenshot */}
            <OffsetFrames className="opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100" />
        </a>
    )
}

export default Banner
