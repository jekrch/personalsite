import { useState, useCallback, FC, useRef, useEffect, RefObject } from "react";
import {
  Carousel,
  CarouselItem,
  CarouselControl,
} from "reactstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import OffsetFrames from "./OffsetFrames";

interface ProjectItem {
  name: string;
  imageUrl: string;
  pageLink?: string;
  url?: string; // Optional external URL
  description?: string; // Optional one-line summary shown beneath the URL
  gallery?: string[]; // Additional project views, sampled as a background mosaic
}

// Each project view shown at most once so the strip reads as a varied
// sampling rather than a repeating pattern.
const buildMosaicTiles = (gallery: string[]): string[] => {
  const seen = new Set<string>();
  const tiles: string[] = [];
  for (const src of gallery) {
    if (src && !seen.has(src)) {
      seen.add(src);
      tiles.push(src);
    }
  }
  return tiles;
};

// Width of the fade on a side of the tab strip that has more buttons scrolled
// out of view. Also the margin auto-scroll keeps the active button clear of.
const EDGE_FADE_PX = 56;

// Marquee speed in px/sec. Duration is derived from the measured loop width so
// every strip drifts at the same pace regardless of tile count or tile size.
const MARQUEE_PX_PER_SEC = 20;

// A box within a track, traced by a ghost outline.
interface GhostRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

// A marquee-ing strip's tiles (one copy, relative to the track) and the
// distance after which they repeat, for tracing them past the card's edges.
interface StripLayout {
  track: HTMLDivElement;
  tiles: GhostRect[];
  loopWidth: number;
}

// Strip ghosts fade in over this fraction of the slide's width, matching the
// strip's own edge fade (its mask's 9% / 91% stops).
const STRIP_FADE_FRACTION = 0.09;

// A row of sampled project views pinned to the bottom of the slide. If the
// row is wider than the slide it slowly marquees through all of them;
// otherwise it sits static and centered. While marquee-ing it reports its
// layout through `onLayout` (null otherwise).
const BottomCardStrip: FC<{ tiles: string[]; onLayout?: (layout: StripLayout | null) => void }> = ({
  tiles,
  onLayout,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState<boolean>(false);
  const [loopWidth, setLoopWidth] = useState<number>(0);
  const onLayoutRef = useRef(onLayout);
  onLayoutRef.current = onLayout;

  useEffect(() => {
    const measure = () => {
      const container = containerRef.current;
      const track = trackRef.current;
      if (!container || !track) return;
      // When marquee-ing the track holds two copies, so compare against half.
      const setWidth = overflow ? track.scrollWidth / 2 : track.scrollWidth;
      if (overflow && setWidth > 0) setLoopWidth(setWidth);
      const overflows = setWidth > container.clientWidth + 4;
      setOverflow(overflows);

      if (overflow && overflows) {
        const trackRect = track.getBoundingClientRect();
        const rects = Array.from(track.children)
          .slice(0, tiles.length)
          .map((tile) => {
            const r = tile.getBoundingClientRect();
            return { left: r.left - trackRect.left, top: r.top - trackRect.top, width: r.width, height: r.height };
          });
        onLayoutRef.current?.({ track, tiles: rects, loopWidth: setWidth });
      } else {
        onLayoutRef.current?.(null);
      }
    };

    measure();
    const ro =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : undefined;
    if (ro && containerRef.current) ro.observe(containerRef.current);
    if (ro && trackRef.current) ro.observe(trackRef.current);
    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('resize', measure);
      ro?.disconnect();
    };
  }, [tiles, overflow]);

  // Two copies so the -50% loop is seamless. In marquee mode each tile carries
  // its own trailing margin (no flex gap, no track padding) so the track is
  // exactly two identical halves and -50% lands on the start of the second copy.
  const rendered = overflow ? [...tiles, ...tiles] : tiles;
  const duration = loopWidth > 0 ? loopWidth / MARQUEE_PX_PER_SEC : tiles.length * 12;

  return (
    <div
      ref={containerRef}
      className="absolute inset-x-0 bottom-0 overflow-hidden pb-[3%] [mask-image:linear-gradient(to_right,transparent_0%,black_9%,black_91%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_9%,black_91%,transparent_100%)]"
    >
      <div
        ref={trackRef}
        className={`flex w-max ${overflow ? 'carousel-marquee' : 'gap-2 px-4 mx-auto'}`}
        style={
          overflow
            ? ({ ['--marquee-duration' as string]: `${duration}s` } as React.CSSProperties)
            : undefined
        }
      >
        {rendered.map((src, i) => (
          <div
            key={`${src}-${i}`}
            className={`h-[8rem] sm:h-[11rem] flex-none overflow-hidden rounded-sm ring-1 ring-white/10 ${overflow ? 'mr-2' : ''}`}
          >
            {/* Whole screenshot at its natural aspect ratio — the tile height
                is fixed and the width follows the image. */}
            <img
              src={src}
              alt=""
              loading="lazy"
              className="h-full w-auto max-w-none"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// Desktop scroll physics for the tab strip, modeled on touch scrolling.
// Trackpads and touch screens already scroll it natively; this covers a
// mouse. A drag follows the pointer and, on release, glides on with the
// throw's speed under friction. Past either end it stretches with growing
// resistance (drawn by translating the track) and springs back. Wheel
// notches glide to their target rather than jumping. Clicking mid-glide
// catches the strip without selecting a tab. Returns a ref holding a
// function that halts any motion, for programmatic scrolls to call first.
// `onRender` runs after each frame it draws, including overscroll frames
// that move the track without firing a scroll event.
const WHEEL_EASE_MS = 90; // time constant of the wheel glide
const FRICTION_PER_MS = 0.997; // throw decay; iOS uses 0.998
const SPRING_K = 0.0003; // pull back from overscroll, per ms²
const SPRING_C = 2 * Math.sqrt(SPRING_K); // critically damped: no wobble
const DRAG_THRESHOLD_PX = 5;
const VELOCITY_WINDOW_MS = 100; // pointer history used to measure a throw

const useMomentumScroll = (
  scrollRef: RefObject<HTMLDivElement>,
  trackRef: RefObject<HTMLDivElement>,
  onRender?: () => void,
) => {
  const stopRef = useRef<() => void>(() => {});
  const onRenderRef = useRef(onRender);
  onRenderRef.current = onRender;

  useEffect(() => {
    const container = scrollRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Virtual scroll position. Runs past [0, max] while overscrolled; the
    // excess is drawn as a rubber-banded translate of the track.
    let pos = container.scrollLeft;
    let velocity = 0; // px/ms
    let wheelTarget: number | null = null;
    let frame: number | null = null;
    let lastTime = 0;
    let shownOverscroll = 0;

    // Mouse drag state
    let pointerActive = false;
    let pointerId = -1;
    let dragging = false;
    let eatClick = false;
    let startX = 0;
    let startPos = 0;
    let samples: { t: number; x: number }[] = [];

    const maxScroll = () => Math.max(0, container.scrollWidth - container.clientWidth);
    const clamp = (x: number) => Math.min(Math.max(x, 0), maxScroll());

    // iOS-style resistance: the further past the end, the less it follows.
    const rubber = (over: number) => {
      const dim = container.clientWidth;
      return Math.sign(over) * (1 - 1 / ((Math.abs(over) * 0.55) / dim + 1)) * dim;
    };

    const render = () => {
      const inBounds = clamp(pos);
      container.scrollTo({ left: inBounds, behavior: 'instant' });
      const shown = pos === inBounds ? 0 : rubber(pos - inBounds);
      if (shown !== shownOverscroll) {
        track.style.transform = shown ? `translateX(${-shown}px)` : '';
        shownOverscroll = shown;
      }
      onRenderRef.current?.();
    };

    const step = (time: number) => {
      const dt = Math.min(Math.max(time - lastTime, 0), 50);
      lastTime = time;

      if (wheelTarget !== null) {
        const target = clamp(wheelTarget);
        pos += (target - pos) * (1 - Math.exp(-dt / WHEEL_EASE_MS));
        if (Math.abs(target - pos) < 0.5) {
          pos = target;
          wheelTarget = null;
        }
      } else {
        // Small fixed substeps keep the spring stable on slow frames.
        for (let left = dt; left > 0; left -= 4) {
          const h = Math.min(left, 4);
          const over = pos - clamp(pos);
          velocity = over
            ? velocity + (-SPRING_K * over - SPRING_C * velocity) * h
            : velocity * Math.pow(FRICTION_PER_MS, h);
          pos += velocity * h;
        }
        if (Math.abs(velocity) < 0.02 && Math.abs(pos - clamp(pos)) < 0.5) {
          pos = clamp(pos);
          velocity = 0;
        }
      }

      render();
      const settled = wheelTarget === null && velocity === 0 && pos === clamp(pos);
      frame = settled ? null : requestAnimationFrame(step);
    };

    const animate = () => {
      if (frame !== null) return;
      lastTime = performance.now();
      frame = requestAnimationFrame(step);
    };

    const stop = () => {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      velocity = 0;
      wheelTarget = null;
      if (shownOverscroll) {
        pos = clamp(pos);
        track.style.transform = '';
        shownOverscroll = 0;
        onRenderRef.current?.();
      }
    };
    stopRef.current = stop;

    // Where the strip is headed, resyncing to the real scroll position when
    // idle (native trackpad and programmatic scrolls move it behind our back).
    const currentBase = () => {
      if (frame === null && !pointerActive) pos = container.scrollLeft;
      return wheelTarget ?? pos;
    };

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) >= Math.abs(e.deltaY)) {
        stop(); // horizontal trackpad swipe: let it scroll natively
        return;
      }
      const max = maxScroll();
      if (max <= 0) return;
      const base = clamp(currentBase());
      const delta = e.deltaMode === WheelEvent.DOM_DELTA_LINE ? e.deltaY * 16 : e.deltaY;
      // At an end, hand the wheel back to the page.
      if ((delta < 0 && base <= 0) || (delta > 0 && base >= max - 1)) return;
      e.preventDefault();
      velocity = 0;
      if (reduceMotion.matches) {
        stop();
        pos = clamp(base + delta);
        render();
        return;
      }
      wheelTarget = clamp(base + delta);
      animate();
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      if (maxScroll() <= 0) return;
      const wasMoving = frame !== null;
      currentBase();
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      velocity = 0;
      wheelTarget = null;
      pointerActive = true;
      pointerId = e.pointerId;
      dragging = false;
      // Like touch: a press that catches a glide doesn't count as a tap.
      eatClick = wasMoving;
      startX = e.clientX;
      startPos = pos;
      samples = [{ t: e.timeStamp, x: e.clientX }];
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!pointerActive || e.pointerId !== pointerId) return;
      // The release landed somewhere we didn't hear it (off the strip before
      // capture, a context menu, a window switch): let go now.
      if (!(e.buttons & 1)) {
        endPointer(e);
        return;
      }
      const dx = e.clientX - startX;
      if (!dragging) {
        if (Math.abs(dx) < DRAG_THRESHOLD_PX) return;
        dragging = true;
        // Capture only once dragging, so plain clicks keep their target.
        container.setPointerCapture(e.pointerId);
        container.classList.add('is-dragging');
      }
      pos = startPos - dx;
      render();
      samples.push({ t: e.timeStamp, x: e.clientX });
      while (samples.length > 2 && e.timeStamp - samples[0].t > VELOCITY_WINDOW_MS) {
        samples.shift();
      }
    };

    const endPointer = (e: PointerEvent) => {
      if (!pointerActive || e.pointerId !== pointerId) return;
      pointerActive = false;
      container.classList.remove('is-dragging');
      if (dragging) {
        eatClick = true;
        const first = samples[0];
        const last = samples[samples.length - 1];
        // Held still before letting go: no throw.
        const stale = e.timeStamp - last.t > 50;
        velocity =
          !stale && !reduceMotion.matches && last.t > first.t
            ? -(last.x - first.x) / (last.t - first.t)
            : 0;
      }
      if (velocity !== 0 || pos !== clamp(pos)) animate();
    };

    const handleClickCapture = (e: MouseEvent) => {
      if (!eatClick) return;
      eatClick = false;
      e.preventDefault();
      e.stopPropagation();
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('pointerdown', handlePointerDown);
    container.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('pointerup', endPointer);
    container.addEventListener('pointercancel', endPointer);
    container.addEventListener('click', handleClickCapture, true);
    return () => {
      stop();
      stopRef.current = () => {};
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('pointerdown', handlePointerDown);
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerup', endPointer);
      container.removeEventListener('pointercancel', endPointer);
      container.removeEventListener('click', handleClickCapture, true);
    };
  }, [scrollRef, trackRef]);

  return stopRef;
};

interface ProjectCarouselProps {
  projects: ProjectItem[];
  backgroundImages?: string[]; // Optional background images for rotation
}

const ProjectCarousel: FC<ProjectCarouselProps> = ({ projects, backgroundImages = [] }) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [animating, setAnimating] = useState<boolean>(false);
  const [buttonsOverflow, setButtonsOverflow] = useState<boolean>(false);
  const [fadeLeft, setFadeLeft] = useState<boolean>(false);
  const [fadeRight, setFadeRight] = useState<boolean>(false);
  const [hasAnimated, setHasAnimated] = useState<boolean>(false);
  const [showDot, setShowDot] = useState<boolean>(false);
  const [dotPosition, setDotPosition] = useState<number>(0);
  const [activeButtonWidth, setActiveButtonWidth] = useState<number>(0);
  const [activeButtonTop, setActiveButtonTop] = useState<number>(0);
  const [activeButtonHeight, setActiveButtonHeight] = useState<number>(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const buttonsContainerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const ghostLayerRef = useRef<HTMLDivElement>(null);
  const ghostTrackRef = useRef<HTMLDivElement>(null);
  const [ghostRects, setGhostRects] = useState<GhostRect[]>([]);

  // Pin the ghost outlines to the real buttons. The track's on-screen box
  // already reflects scroll position and any rubber-band translate.
  const syncGhosts = useCallback(() => {
    const layer = ghostLayerRef.current;
    const ghostTrack = ghostTrackRef.current;
    const track = buttonsContainerRef.current;
    if (!layer || !ghostTrack || !track) return;
    const layerRect = layer.getBoundingClientRect();
    const trackRect = track.getBoundingClientRect();
    ghostTrack.style.transform =
      `translate(${trackRect.left - layerRect.left}px, ${trackRect.top - layerRect.top}px)`;
  }, []);

  const stopStripMomentum = useMomentumScroll(scrollContainerRef, buttonsContainerRef, syncGhosts);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const touchHandledRef = useRef<boolean>(false);

  // Ghost outlines of the bottom image strip, carried past the card's edges.
  // They trace the strip of `stripGhostIndex`, which catches up with the
  // active slide once a slide change has finished; they're faded out between.
  const cardRef = useRef<HTMLDivElement>(null);
  const stripGhostLayerRef = useRef<HTMLDivElement>(null);
  const stripGhostTrackRef = useRef<HTMLDivElement>(null);
  const [stripLayouts, setStripLayouts] = useState<Record<number, StripLayout | null>>({});
  const [stripGhostIndex, setStripGhostIndex] = useState<number>(activeIndex);
  const activeIndexRef = useRef(activeIndex);
  activeIndexRef.current = activeIndex;
  const stripGhostLayout = stripLayouts[stripGhostIndex] ?? null;
  const stripGhostsShown = stripGhostIndex === activeIndex && !animating;

  const handleStripLayout = useCallback((index: number, layout: StripLayout | null) => {
    setStripLayouts((prev) => {
      const old = prev[index] ?? null;
      const same =
        old === layout ||
        (old && layout && old.track === layout.track && old.loopWidth === layout.loopWidth &&
          JSON.stringify(old.tiles) === JSON.stringify(layout.tiles));
      return same ? prev : { ...prev, [index]: layout };
    });
  }, []);

  const onExiting = useCallback(() => setAnimating(true), []);
  const onExited = useCallback(() => {
    setAnimating(false);
    setStripGhostIndex(activeIndexRef.current);
  }, []);

  const next = useCallback(() => {
    if (animating) return;
    const nextIndex = activeIndex === projects.length - 1 ? 0 : activeIndex + 1;
    setActiveIndex(nextIndex);
  }, [activeIndex, animating, projects.length]);

  const previous = useCallback(() => {
    if (animating) return;
    const nextIndex = activeIndex === 0 ? projects.length - 1 : activeIndex - 1;
    setActiveIndex(nextIndex);
  }, [activeIndex, animating, projects.length]);

  const goToIndex = useCallback((newIndex: number) => {
    if (animating) return;
    setActiveIndex(newIndex);
  }, [animating]);

  // Function to update dot position based on active button
  const updateDotPosition = useCallback(() => {
    if (!buttonsContainerRef.current || !buttonRefs.current[activeIndex]) return;

    const activeButton = buttonRefs.current[activeIndex];
    const container = buttonsContainerRef.current;

    if (activeButton && container) {

      // Calculate position relative to the container
      const buttonCenter = activeButton.offsetLeft + (activeButton.offsetWidth / 2);
      setDotPosition(buttonCenter);
      setActiveButtonWidth(activeButton.offsetWidth);
      setActiveButtonTop(activeButton.offsetTop);
      setActiveButtonHeight(activeButton.offsetHeight);
    }
  }, [activeIndex]);

  // Fade an edge of the tab strip only while there are buttons hidden past it.
  const updateEdgeFades = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const maxScroll = container.scrollWidth - container.clientWidth;
    setFadeLeft(container.scrollLeft > 1);
    setFadeRight(container.scrollLeft < maxScroll - 1);
  }, []);

  // Function to scroll to active button
  const scrollToActiveButton = useCallback(() => {
    if (!scrollContainerRef.current || !buttonsContainerRef.current || !buttonsOverflow) return;

    const container = scrollContainerRef.current;
    const innerDiv = buttonsContainerRef.current;
    const activeButton = buttonRefs.current[activeIndex];

    if (!activeButton) return;

    // Take over from any glide the user set going
    stopStripMomentum.current();

    // Get button and container dimensions
    const buttonRect = activeButton.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // Keep the active button clear of the edge fades
    const maskSize = EDGE_FADE_PX;
    const safeAreaLeft = containerRect.left + maskSize;
    const safeAreaRight = containerRect.right - maskSize;

    // Check if button is fully visible in safe area
    const buttonIsVisible = buttonRect.left >= safeAreaLeft && buttonRect.right <= safeAreaRight;

    if (!buttonIsVisible) {
      // Calculate scroll needed to make button visible
      const buttonLeft = activeButton.offsetLeft;
      const buttonWidth = activeButton.offsetWidth;
      const containerWidth = container.offsetWidth;
      const currentScroll = container.scrollLeft;

      let targetScroll = currentScroll;

      // First button: always scroll all the way to the start
      if (activeIndex === 0) {
        targetScroll = 0;
      }
      // Last button: scroll all the way to the end
      else if (activeIndex === projects.length - 1) {
        targetScroll = innerDiv.scrollWidth - containerWidth;
      }
      // If button is too far left
      else if (buttonRect.left < safeAreaLeft) {
        // Scroll so button appears just after the left fade
        targetScroll = buttonLeft - maskSize - 16; // 16px padding
      }
      // If button is too far right
      else if (buttonRect.right > safeAreaRight) {
        // Scroll so button appears just before the right fade
        targetScroll = buttonLeft + buttonWidth - containerWidth + maskSize + 16; // 16px padding
      }

      // Ensure we don't scroll past boundaries
      const maxScroll = innerDiv.scrollWidth - containerWidth;
      targetScroll = Math.max(0, Math.min(targetScroll, maxScroll));

      container.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  }, [activeIndex, buttonsOverflow, projects.length, stopStripMomentum]);

  // Check if buttons overflow the container
  useEffect(() => {
    const checkOverflow = () => {
      if (scrollContainerRef.current && buttonsContainerRef.current) {
        const containerWidth = scrollContainerRef.current.clientWidth;
        const buttonsWidth = buttonsContainerRef.current.scrollWidth;
        setButtonsOverflow(buttonsWidth > containerWidth);
      }
    };

    // Initial check
    checkOverflow();

    // Check again after layouts stabilize
    const timeout = setTimeout(checkOverflow, 100);

    // Listen for resize events
    window.addEventListener('resize', checkOverflow);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', checkOverflow);
    };
  }, [projects]);

  // Keep the sliding indicator aligned with the active button on resize
  useEffect(() => {
    const handleResize = () => updateDotPosition();

    window.addEventListener('resize', handleResize);

    // Observe the buttons container itself, since layout can shift even
    // without a window resize (e.g. fonts loading, parent reflow).
    let resizeObserver: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined' && buttonsContainerRef.current) {
      resizeObserver = new ResizeObserver(() => updateDotPosition());
      resizeObserver.observe(buttonsContainerRef.current);
      buttonRefs.current.forEach((btn) => btn && resizeObserver!.observe(btn));
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver?.disconnect();
    };
  }, [updateDotPosition, projects]);

  // Scroll when active index changes
  useEffect(() => {
    scrollToActiveButton();
  }, [activeIndex, scrollToActiveButton]);

  // Update dot position when active index changes or after scrolling
  useEffect(() => {
    // Small delay to ensure any scrolling animation is complete
    const timeout = setTimeout(() => {
      updateDotPosition();
    }, 100);
    return () => clearTimeout(timeout);
  }, [activeIndex, updateDotPosition, buttonsOverflow]);

  // Ensure buttons are properly positioned on mount and when overflow changes
  useEffect(() => {
    if (buttonsOverflow) {
      // Wait for mask to be applied, then scroll
      requestAnimationFrame(() => {
        setTimeout(() => {
          scrollToActiveButton();
          updateDotPosition();
        }, 50);
      });
    }
  }, [buttonsOverflow, scrollToActiveButton, updateDotPosition]);

  // Trigger animation on mount and show dot after 1s delay
  useEffect(() => {
    requestAnimationFrame(() => {
      setHasAnimated(true);
    });

    // Show dot after 1 second delay
    const dotTimeout = setTimeout(() => {
      setShowDot(true);
      // Update dot position after showing it
      setTimeout(() => {
        updateDotPosition();
      }, 50);
    }, 1000);

    return () => clearTimeout(dotTimeout);
  }, [updateDotPosition]);

  // Update dot position on scroll
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      updateDotPosition();
      updateEdgeFades();
      syncGhosts();
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [updateDotPosition, updateEdgeFades, syncGhosts]);

  // Measure the buttons for their ghost outlines, and how far the ghost layer
  // reaches past the scroller on each side (the mask fades ghosts over that).
  useEffect(() => {
    if (!buttonsOverflow) return;

    const measure = () => {
      const layer = ghostLayerRef.current;
      const scroller = scrollContainerRef.current;
      if (!layer || !scroller) return;
      const layerRect = layer.getBoundingClientRect();
      const scrollerRect = scroller.getBoundingClientRect();
      layer.style.setProperty('--reach-l', `${scrollerRect.left - layerRect.left}px`);
      layer.style.setProperty('--reach-r', `${layerRect.right - scrollerRect.right}px`);

      const rects = buttonRefs.current
        .slice(0, projects.length)
        .filter((b): b is HTMLButtonElement => !!b)
        .map((b) => ({ left: b.offsetLeft, top: b.offsetTop, width: b.offsetWidth, height: b.offsetHeight }));
      setGhostRects((prev) => (JSON.stringify(prev) === JSON.stringify(rects) ? prev : rects));
      syncGhosts();
    };

    measure();
    let resizeObserver: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(measure);
      [ghostLayerRef, scrollContainerRef, buttonsContainerRef].forEach(
        (ref) => ref.current && resizeObserver!.observe(ref.current),
      );
    }
    return () => resizeObserver?.disconnect();
  }, [buttonsOverflow, projects, syncGhosts]);

  useEffect(() => {
    syncGhosts();
  }, [ghostRects, syncGhosts]);

  // Pin the strip ghosts to the real strip every frame (it marquees, and
  // slides out with its slide), while the ghost layer is on screen. Also
  // tell the layer's mask where the card's edges are and how wide the
  // strip's own edge fade is.
  useEffect(() => {
    const layer = stripGhostLayerRef.current;
    const ghostTrack = stripGhostTrackRef.current;
    const card = cardRef.current;
    if (!stripGhostLayout || !layer || !ghostTrack || !card) return;
    const track = stripGhostLayout.track;

    const measure = () => {
      const layerRect = layer.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      layer.style.setProperty('--reach-l', `${cardRect.left - layerRect.left}px`);
      layer.style.setProperty('--reach-r', `${layerRect.right - cardRect.right}px`);
      layer.style.setProperty('--ghost-fade', `${cardRect.width * STRIP_FADE_FRACTION}px`);
    };

    let frame: number | null = null;
    const sync = () => {
      const layerRect = layer.getBoundingClientRect();
      const trackRect = track.getBoundingClientRect();
      // Hidden slide (no layout): leave the ghosts where they last were.
      if (trackRect.width > 0) {
        ghostTrack.style.transform =
          `translate(${trackRect.left - layerRect.left}px, ${trackRect.top - layerRect.top}px)`;
      }
      frame = requestAnimationFrame(sync);
    };
    const start = () => {
      if (frame === null) frame = requestAnimationFrame(sync);
    };
    const stop = () => {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
    };

    measure();
    let resizeObserver: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(measure);
      resizeObserver.observe(layer);
      resizeObserver.observe(card);
    }

    // Off screen, or hidden on phones (display: none never intersects).
    let intersectionObserver: IntersectionObserver | undefined;
    if (typeof IntersectionObserver !== 'undefined') {
      intersectionObserver = new IntersectionObserver(([entry]) =>
        entry.isIntersecting ? start() : stop(),
      );
      intersectionObserver.observe(layer);
    } else {
      start();
    }

    return () => {
      stop();
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
    };
  }, [stripGhostLayout]);

  // Re-evaluate the edge fades whenever the strip's size or contents change
  useEffect(() => {
    updateEdgeFades();

    let resizeObserver: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined' && scrollContainerRef.current) {
      resizeObserver = new ResizeObserver(() => updateEdgeFades());
      resizeObserver.observe(scrollContainerRef.current);
      if (buttonsContainerRef.current) resizeObserver.observe(buttonsContainerRef.current);
    }
    return () => resizeObserver?.disconnect();
  }, [updateEdgeFades, buttonsOverflow, projects]);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    touchStartXRef.current = touch.clientX;
    touchStartYRef.current = touch.clientY;
    touchHandledRef.current = false;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    if (touchHandledRef.current) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartXRef.current;
    const deltaY = touch.clientY - touchStartYRef.current;

    // Only trigger if horizontal movement clearly dominates and exceeds threshold
    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX < 0) {
        next();
      } else {
        previous();
      }
      touchHandledRef.current = true;
      touchStartXRef.current = null;
      touchStartYRef.current = null;
    }
  }, [next, previous]);

  const handleTouchEnd = useCallback(() => {
    touchStartXRef.current = null;
    touchStartYRef.current = null;
    touchHandledRef.current = false;
  }, []);

  // Rotate through background images if provided
  const getBackgroundImage = (index: number) => {
    if (backgroundImages.length === 0) return '';
    return backgroundImages[index % backgroundImages.length];
  };

  const slides = projects.map((project, index) => {
   const mosaicTiles = project.gallery ? buildMosaicTiles(project.gallery) : [];
   return (
    <CarouselItem
      onExiting={onExiting}
      onExited={onExited}
      key={project.name}
      className="relative"
    >
      {/* Background layer — the rotating photo, tinted by multiplying brand
          teal over it (one layer, so it reads as part of the palette rather
          than dimmed), with this project's other views in a strip along the
          bottom that slowly marquees through them when there are more than fit. */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none bg-[#3f4e53]">
        {backgroundImages.length > 0 && (
          <>
            <img
              src={getBackgroundImage(index)}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-jk-teal mix-blend-multiply"></div>
          </>
        )}
        {project.gallery && project.gallery.length > 0 && (
          <BottomCardStrip
            tiles={mosaicTiles}
            onLayout={(layout) => handleStripLayout(index, layout)}
          />
        )}
      </div>

      {/* Project content - contained within bounds to not overlap controls */}
      <div className="relative z-[5] flex flex-col items-center justify-start h-[460px] sm:h-[520px] min-h-[340px] px-8 pb-8 pointer-events-none">
        <a
          href={project.pageLink || '#'}
          className="group cursor-pointer no-underline hover:no-underline flex flex-col items-center pointer-events-auto h-full sm:h-auto"
          onClick={(e) => {
            // If it's an external URL without pageLink, open in new tab
            if (!project.pageLink && project.url) {
              e.preventDefault();
              window.open(project.url.startsWith('http') ? project.url : `https://${project.url}`, '_blank');
            }
            // If it's a local hash link, scroll to top after navigation
            else if (project.pageLink?.startsWith('#') || project.pageLink?.startsWith('/#')) {
              requestAnimationFrame(() => {
                window.scrollTo({
                  top: 0,
                  behavior: 'smooth',
                });
              });
            }
          }}
        >
          {/* Project image container with hover effects */}
          {/* No `transform`/`backdrop-blur` here: either one promotes this
              subtree to a compositing layer that Chromium rasterizes at CSS
              (1x) resolution, softening the screenshot on HiDPI displays.
              Nothing here actually transforms, and the backdrop blur sat
              behind an opaque image so it was invisible anyway. */}
          <div className="relative mb-6">
            <img
              src={project.imageUrl}
              alt={project.name}
              className="block w-full max-w-[min(28rem,80vw)] h-auto object-contain rounded-sm shadow-lg shadow-black/40"
              style={{ maxHeight: '500px' }}
            />
            {/* On hover, the same offset double frame as the active tab
                indicator (the logo's layered squares). */}
            <OffsetFrames className="opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100" />
          </div>

          {/* Show URL if provided — anchored above the image on every screen
              size with an equal top/bottom margin (3em on mobile/very narrow
              screens, 1em from the sm breakpoint up). Because the content
              column is top-aligned (not centered), the URL stays a fixed
              distance from the top and the image a fixed distance below it,
              regardless of hero image height. */}
          {(project.url || project.description) && (
            <div className="order-first w-full my-[1em] flex flex-col items-center sm:my-[1em] sm:w-auto">
              <div className="flex flex-col items-center gap-0.5 px-6 py-1.5">
                {project.url && (
                  <span className="text-white text-md leading-tight opacity-90 group-hover:opacity-100 transition-opacity">
                    {project.url}
                  </span>
                )}
                {project.description && (
                  <span className="whitespace-nowrap text-center text-[11px] sm:text-sm leading-tight italic text-white/80 opacity-90 group-hover:opacity-100 transition-opacity">
                    {project.description}
                  </span>
                )}
              </div>
            </div>
          )}
        </a>
      </div>
    </CarouselItem>
   );
  });


  return (
    <div className="group/card relative w-full select-none">
      {/* No shadow here: it sits on the carousel and, separately, on the
          strip's slanted shape (.tab-band__shape). One box-shadow around both
          would trace a rectangle past the strip's slanted ends. */}

      {/* Tab strip — a teal parallelogram that overhangs the carousel, its
          slanted ends echoed by pairs of thin lines like the background's
          bands (see .tab-band). The buttons scroll across the band's full
          width, fading out as they reach the slanted ends. */}
      <div className="tab-band z-10">
        <div aria-hidden className="tab-band__shape" />

        {/* Ghost outlines: the buttons traced past the scroller's edges,
            taking over as the real ones fade and trailing off into the page
            (see .tab-band__ghosts). Only on the side with buttons out of view. */}
        {buttonsOverflow && (
          <div
            ref={ghostLayerRef}
            aria-hidden
            className="tab-band__ghosts"
            style={{
              ['--ghost-l' as string]: fadeLeft ? 1 : 0,
              ['--ghost-r' as string]: fadeRight ? 1 : 0,
              ['--ghost-fade' as string]: `${EDGE_FADE_PX}px`,
            } as React.CSSProperties}
          >
            <div ref={ghostTrackRef} className="absolute left-0 top-0">
              {ghostRects.map((r, i) => (
                <div
                  key={i}
                  className="tab-band__ghost"
                  style={{ left: r.left, top: r.top, width: r.width, height: r.height }}
                />
              ))}
            </div>
          </div>
        )}

        <div
          ref={scrollContainerRef}
          className="tab-band__scroller relative overflow-x-auto scrollbar-hide scroll-smooth edge-fade"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
            ['--fade-l' as string]: fadeLeft ? `${EDGE_FADE_PX}px` : '0px',
            ['--fade-r' as string]: fadeRight ? `${EDGE_FADE_PX}px` : '0px',
          } as React.CSSProperties}
        >
          <div
            ref={buttonsContainerRef}
            className={`
              flex gap-3 py-3 pb-3 relative
              ${buttonsOverflow ? 'px-7' : 'justify-center px-12'}
            `}
            style={{
              minWidth: buttonsOverflow ? 'max-content' : 'auto'
            }}
          >
            {/* Sliding indicator — stacked outlined frames echoing the logo's layered squares */}
            {showDot && activeButtonWidth > 0 && (
              <div
                className="absolute pointer-events-none ios-optimize dot-fade-in"
                style={{
                  left: `${dotPosition}px`,
                  top: `${activeButtonTop}px`,
                  width: `${activeButtonWidth}px`,
                  height: `${activeButtonHeight}px`,
                  transform: 'translateX(-50%)',
                  transition:
                    'left 0.45s cubic-bezier(0.34, 1.3, 0.64, 1), width 0.35s cubic-bezier(0.34, 1.3, 0.64, 1)',
                  WebkitTransition:
                    'left 0.45s cubic-bezier(0.34, 1.3, 0.64, 1), width 0.35s cubic-bezier(0.34, 1.3, 0.64, 1)',
                  zIndex: 0,
                  willChange: 'left, width',
                }}
              >
                <div
                  className="absolute inset-0 border border-white rounded-sm"
                  style={{ transform: 'translate(0.4em, -0.4em)' }}
                />
                <div
                  className="absolute inset-0 border border-white rounded-sm"
                  style={{ transform: 'translate(-0.4em, 0.4em)' }}
                />
              </div>
            )}

            {projects.map((project, index) => (
              <button
                key={project.name}
                ref={(el) => buttonRefs.current[index] = el}
                onClick={() => goToIndex(index)}
                className={`
                  relative whitespace-nowrap
                  border-white border-1 mt-[0.1em]
                  px-4 py-2 rounded-sm text-sm font-medium flex-shrink-0
                  ios-optimize carousel-btn
                  ${activeIndex === index
                    ? 'bg-transparent text-white'
                    : 'bg-white/20 text-white/90 hover:bg-white/30 hover:text-white'
                  }
                  ${hasAnimated ? 'smooth-reveal' : 'button-initial'}
                  ${activeIndex !== index ? 'button-backdrop' : ''}
                `}
                style={{
                  animationDelay: hasAnimated ? `${index * 0.08}s` : '0s',
                  zIndex: 1,
                }}
              >
                {project.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        ref={cardRef}
        className="relative rounded-sm shadow-[5px_6px_11px_0px_rgba(0,_0,_0,_0.3)] transition-shadow duration-200 group-hover/card:shadow-[rgba(0,_0,_0,_0.4)]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <Carousel
          activeIndex={activeIndex}
          next={next}
          previous={previous}
          className="overflow-hidden bg-[#3f4e53]"
          interval={6000}
        >
          {slides}

          <CarouselControl
            direction="prev"
            directionText="Previous"
            onClickHandler={previous}
            className="opacity-50 hover:opacity-100 transition-opacity"
            style={{ zIndex: 20 }}
          />
          <CarouselControl
            direction="next"
            directionText="Next"
            onClickHandler={next}
            className="opacity-50 hover:opacity-100 transition-opacity"
            style={{ zIndex: 20 }}
          />
        </Carousel>

        {/* Ghost outlines of the image strip's tiles, carried on past the
            card's sides as they marquee, like the tab strip's (see
            .strip-ghosts). Copies one loop either side of the real track's
            two keep both gutters filled through the whole loop: the loop is
            wider than the card, which is wider than either gutter. */}
        {stripGhostLayout && (
          <div
            ref={stripGhostLayerRef}
            aria-hidden
            className="strip-ghosts"
            style={{ opacity: stripGhostsShown ? 1 : 0 }}
          >
            <div ref={stripGhostTrackRef} className="absolute left-0 top-0">
              {[-1, 0, 1, 2].flatMap((copy) =>
                stripGhostLayout.tiles.map((r, i) => (
                  <div
                    key={`${copy}-${i}`}
                    className="tab-band__ghost"
                    style={{
                      left: r.left + copy * stripGhostLayout.loopWidth,
                      top: r.top,
                      width: r.width,
                      height: r.height,
                    }}
                  />
                )),
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default ProjectCarousel;