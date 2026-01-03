import { FC, useState, useEffect, useMemo } from "react"

interface ImageSlot {
    src: string
    originX: number
    originY: number
}

interface FrameOffset {
    top: number | string
    left: number | string
    right: number | string
    bottom: number | string
    opacity?: number
}

interface BannerProps {
    /** URL the banner links to */
    href: string
    /** Main heading text */
    title: string
    /** Smaller text above the title */
    subtitle?: string
    /** Array of image URLs to rotate through */
    images: string[]
    /** Rotation interval in milliseconds (default: 3000) */
    rotationInterval?: number
    /** Disable image rotation/animation (default: false) */
    disableRotation?: boolean
    /** Accent color for the banner background and gradients */
    accentColor?: string
    /** Additional className for the outer container */
    className?: string
    /** Additional className for the main banner content area */
    bannerClassName?: string
    /** Additional className for the title */
    titleClassName?: string
    /** Additional className for the subtitle */
    subtitleClassName?: string
    /** Image scale */
    imageScale?: number
    /** Disable backing frame borders entirely */
    disableFrames?: boolean
    /** Randomize frame positions on mount */
    randomizeFrames?: boolean
    /** Custom frame configurations (overrides defaults) */
    frames?: FrameOffset[]
    /** Frame border color (defaults to accentColor) */
    frameColor?: string
    /** Frame border width */
    frameBorderWidth?: number
}

const getRandomOrigin = () => ({
    originX: Math.floor(Math.random() * 100),
    originY: Math.floor(Math.random() * 100),
})

const getRandomFrameOffset = (): FrameOffset => ({
    top: `${Math.floor(Math.random() * 16) - 12}px`,
    left: `${Math.floor(Math.random() * 40) + 5}px`,
    right: `${Math.floor(Math.random() * 30) + 5}px`,
    bottom: `${Math.floor(Math.random() * 16) - 12}px`,
    opacity: 0.15 + Math.random() * 0.25,
})

const DEFAULT_FRAMES: FrameOffset[] = [
    { top: -8, left: 10, right: 24, bottom: -6, opacity: 0.2 },
    { top: -4, left: 32, right: 8, bottom: -12, opacity: 0.3 },
]

const Banner: FC<BannerProps> = ({
    href,
    title,
    subtitle,
    images,
    rotationInterval = 3000,
    disableRotation = false,
    accentColor = "var(--jk-teal)",
    className = "",
    bannerClassName = "",
    titleClassName = "",
    subtitleClassName = "",
    imageScale = 3,
    disableFrames = false,
    randomizeFrames = false,
    frames,
    frameColor,
    frameBorderWidth = 2,
}) => {
    const [slots, setSlots] = useState<ImageSlot[]>([])
    const [, setCurrentIndex] = useState(0)

    // Compute frame offsets - memoized to prevent re-randomizing on every render
    const frameOffsets = useMemo(() => {
        if (disableFrames) return []
        if (frames) return frames
        if (randomizeFrames) {
            return [getRandomFrameOffset(), getRandomFrameOffset()]
        }
        return DEFAULT_FRAMES
    }, [disableFrames, frames, randomizeFrames])

    const resolvedFrameColor = frameColor ?? accentColor

    // Initialize two slots with random images and positions
    useEffect(() => {
        if (images.length === 0) return

        const initialSlots: ImageSlot[] = [
            {
                src: images[0],
                ...getRandomOrigin(),
            },
            {
                src: images[1 % images.length],
                ...getRandomOrigin(),
            },
        ]
        setSlots(initialSlots)
        setCurrentIndex(2 % images.length)
    }, [images])

    // Rotate images at the specified interval
    useEffect(() => {
        if (images.length <= 2 || disableRotation) return

        const interval = setInterval(() => {
            setSlots((prevSlots) => {
                const slotToUpdate = Math.floor(Math.random() * 2)
                const newSlots = [...prevSlots]

                setCurrentIndex((prevIndex) => {
                    const nextIndex = (prevIndex + 1) % images.length
                    newSlots[slotToUpdate] = {
                        src: images[nextIndex],
                        ...getRandomOrigin(),
                    }
                    return nextIndex
                })

                return newSlots
            })
        }, rotationInterval)

        return () => clearInterval(interval)
    }, [images, rotationInterval, disableRotation])

    const formatOffset = (value: number | string) =>
        typeof value === "number" ? `${value}px` : value

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
        <div className={`relative my-8 ${className}`}>
            {/* Backing frame elements - offset behind the banner */}
            {frameOffsets.map((frame, index) => (
                <div
                    key={index}
                    className="absolute pointer-events-none"
                    style={{
                        borderWidth: frameBorderWidth,
                        borderStyle: "solid",
                        borderColor: resolvedFrameColor,
                        opacity: frame.opacity ?? 0.2 + index * 0.1,
                        top: formatOffset(frame.top),
                        left: formatOffset(frame.left),
                        right: formatOffset(frame.right),
                        bottom: formatOffset(frame.bottom),
                    }}
                />
            ))}

            {/* Main banner */}
            <a
                href={href}
                onClick={handleClick}
                className="block group no-underline relative z-10"
            >
                <div
                    className={`relative overflow-hidden px-5 py-4 border-2 border-white/80 hover:border-white/50 transition-colors hover:shadow-md ${bannerClassName}`}
                    style={{ backgroundColor: accentColor }}
                >
                    {/* Comic background images */}
                    {images.length > 0 && (
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            {/* Left image */}
                            {slots[0] && (
                                <div className="absolute left-0 top-0 w-1/2 h-full overflow-hidden">
                                    <img
                                        src={slots[0].src}
                                        alt=""
                                        className={`w-full h-full object-cover scale-[${imageScale}] transition-all duration-1000`}
                                        style={{
                                            objectPosition: `${slots[0].originX}% ${slots[0].originY}%`,
                                        }}
                                    />
                                    <div
                                        className="absolute inset-0 bg-gradient-to-r from-transparent"
                                        style={{ ["--tw-gradient-to" as string]: accentColor }}
                                    />
                                    <div
                                        className="absolute inset-0 bg-gradient-to-b from-transparent"
                                        style={{ ["--tw-gradient-to" as string]: accentColor }}
                                    />
                                </div>
                            )}

                            {/* Right image */}
                            {slots[1] && (
                                <div className="absolute right-0 top-0 w-1/2 h-full overflow-hidden">
                                    <img
                                        src={slots[1].src}
                                        alt=""
                                        className={`w-full h-full object-cover scale-[${imageScale}] transition-all duration-1000`}
                                        style={{
                                            objectPosition: `${slots[1].originX}% ${slots[1].originY}%`,
                                        }}
                                    />
                                    <div
                                        className="absolute inset-0 bg-gradient-to-l from-transparent"
                                        style={{ ["--tw-gradient-to" as string]: accentColor }}
                                    />
                                    <div
                                        className="absolute inset-0 bg-gradient-to-b from-transparent"
                                        style={{ ["--tw-gradient-to" as string]: accentColor }}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Content */}
                    <div className="relative z-10 text-center">
                        {subtitle && (
                            <p className={`text-white text-sm m-0 mb-1 ${subtitleClassName}`}>
                                {subtitle}
                            </p>
                        )}
                        <h3 className={`text-white text-lg font-semibold m-0 group-hover:underline ${titleClassName}`}>
                            {title}
                        </h3>
                    </div>
                </div>
            </a>
        </div>
    )
}

export default Banner