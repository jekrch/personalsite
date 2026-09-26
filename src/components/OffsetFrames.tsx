import { FC } from "react"

// The logo's layered squares: two white outlines offset diagonally from the
// element they sit on. Place inside a `relative` parent. Offset with insets
// rather than transforms so nothing over a screenshot gets promoted to a
// compositing layer (Chromium rasterizes those at 1x, softening on HiDPI).
const OffsetFrames: FC<{ className?: string }> = ({ className = "" }) => (
    <>
        <div
            aria-hidden
            className={`pointer-events-none absolute border border-white rounded-sm ${className}`}
            style={{ top: "-0.4em", right: "-0.4em", bottom: "0.4em", left: "0.4em" }}
        />
        <div
            aria-hidden
            className={`pointer-events-none absolute border border-white rounded-sm ${className}`}
            style={{ top: "0.4em", right: "0.4em", bottom: "-0.4em", left: "-0.4em" }}
        />
    </>
)

export default OffsetFrames
