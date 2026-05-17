import { useState, useCallback, useEffect, useRef, FC } from "react";
import {
  Carousel,
  CarouselItem,
  CarouselControl,
  CarouselIndicators,
} from "reactstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import classNames from "classnames";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";

interface ImageCarouselProps {
  items: string[];
  className?: string;
}

interface CarouselIndicatorItem {
  src: string;
}

// movement (px) beyond which a pointer interaction is treated as a swipe,
// not a tap — keeps swipe-to-navigate from accidentally opening the lightbox
const TAP_THRESHOLD = 10;

const ImageCarousel: FC<ImageCarouselProps> = ({ items, className }) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [animating, setAnimating] = useState<boolean>(false);
  const [minAspectRatio, setMinAspectRatio] = useState<number | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      items.map(
        (src) =>
          new Promise<number>((resolve) => {
            const img = new Image();
            img.onload = () => resolve(img.naturalWidth / img.naturalHeight);
            img.onerror = () => resolve(Number.POSITIVE_INFINITY);
            img.src = src;
          })
      )
    ).then((ratios) => {
      if (cancelled) return;
      const finite = ratios.filter((r) => Number.isFinite(r) && r > 0);
      if (finite.length) setMinAspectRatio(Math.min(...finite));
    });
    return () => {
      cancelled = true;
    };
  }, [items]);

  const next = useCallback(() => {
    if (animating) return;
    const nextIndex = activeIndex === items.length - 1 ? 0 : activeIndex + 1;
    setActiveIndex(nextIndex);
  }, [activeIndex, animating, items.length]);

  const previous = useCallback(() => {
    if (animating) return;
    const nextIndex = activeIndex === 0 ? items.length - 1 : activeIndex - 1;
    setActiveIndex(nextIndex);
  }, [activeIndex, animating, items.length]);

  const goToIndex = useCallback((newIndex: number) => {
    if (animating) return;
    setActiveIndex(newIndex);
  }, [animating]);

  const onExiting = useCallback(() => setAnimating(true), []);
  const onExited = useCallback(() => setAnimating(false), []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerStart.current = { x: e.clientX, y: e.clientY };
  }, []);

  // open the lightbox only when the gesture is a genuine tap/click,
  // so dragging to swipe the carousel doesn't trigger it
  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      const start = pointerStart.current;
      pointerStart.current = null;
      if (!start) return;
      const moved =
        Math.abs(e.clientX - start.x) + Math.abs(e.clientY - start.y);
      if (moved <= TAP_THRESHOLD) setLightboxOpen(true);
    },
    []
  );

  const slides = items.map((src) => (
    <CarouselItem
      onExiting={onExiting}
      onExited={onExited}
      key={src}
    >
      <div
        className={classNames(
          "flex items-center justify-center w-full bg-jk-teal",
          className
        )}
        style={minAspectRatio ? { aspectRatio: String(minAspectRatio) } : undefined}
      >
        <div className="group relative h-full w-full flex items-center justify-center">
          <img
            src={src}
            alt=""
            draggable={false}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            className="max-w-full max-h-full object-contain cursor-zoom-in select-none"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </span>
        </div>
      </div>
    </CarouselItem>
  ));

  const indicatorItems = items.map((src): CarouselIndicatorItem => ({ src }));

  return (
    <div className="relative w-full h-auto">
      <Carousel
        activeIndex={activeIndex}
        next={next}
        previous={previous}
        className="shadow-[5px_6px_11px_0px_rgba(0,_0,_0,_0.3)] overflow-hidden rounded-sm hover:duration-200 hover:shadow-[rgba(0,_0,_0,_0.4)]"
        interval={lightboxOpen ? false : 5000}
      >
        <CarouselIndicators
          items={indicatorItems}
          activeIndex={activeIndex}
          onClickHandler={goToIndex}
          className="z-10"
        />
        {slides}
        <CarouselControl
          direction="prev"
          directionText="Previous"
          onClickHandler={previous}
          className="z-10"
        />
        <CarouselControl
          direction="next"
          directionText="Next"
          onClickHandler={next}
          className="z-10"
        />
      </Carousel>

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={activeIndex}
        on={{ view: ({ index }) => setActiveIndex(index) }}
        slides={items.map((src) => ({ src }))}
        plugins={[Zoom]}
        zoom={{
          maxZoomPixelRatio: 3,
          zoomInMultiplier: 2,
          doubleTapDelay: 250,
          doubleClickDelay: 300,
          scrollToZoom: true,
        }}
        animation={{ fade: 250, swipe: 300 }}
        carousel={{ finite: items.length <= 1, padding: 0 }}
        controller={{ closeOnBackdropClick: true }}
        styles={{
          container: { backgroundColor: "rgba(12, 12, 14, 0.94)" },
          button: { filter: "none" },
        }}
      />
    </div>
  );
};

export default ImageCarousel;
