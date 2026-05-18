import { useState, useCallback, FC, useRef, useEffect } from "react";
import {
  Carousel,
  CarouselItem,
  CarouselControl,
} from "reactstrap";
import "bootstrap/dist/css/bootstrap.min.css";

interface ProjectItem {
  name: string;
  imageUrl: string;
  pageLink?: string;
  url?: string; // Optional external URL
  description?: string; // Optional one-line summary shown beneath the URL
  gallery?: string[]; // Additional project views, sampled as a background mosaic
}

// Cycled per tile so each crop frames a different region of the screenshot,
// giving the strip a varied, "close-up sampling" feel rather than flat thumbnails.
const TILE_POSITIONS = [
  'center',
  'top left',
  'top right',
  'center top',
  'bottom right',
  'left center',
];
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

// A row of sampled project views pinned to the bottom of the slide. If the
// row is wider than the slide it slowly marquees through all of them;
// otherwise it sits static and centered.
const BottomCardStrip: FC<{ tiles: string[] }> = ({ tiles }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState<boolean>(false);

  useEffect(() => {
    const measure = () => {
      const container = containerRef.current;
      const track = trackRef.current;
      if (!container || !track) return;
      // When marquee-ing the track holds two copies, so compare against half.
      const setWidth = overflow ? track.scrollWidth / 2 : track.scrollWidth;
      setOverflow(setWidth > container.clientWidth + 4);
    };

    measure();
    const ro =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : undefined;
    if (ro && containerRef.current) ro.observe(containerRef.current);
    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('resize', measure);
      ro?.disconnect();
    };
  }, [tiles, overflow]);

  // Two copies so the -50% loop is seamless; slow, count-scaled duration.
  const rendered = overflow ? [...tiles, ...tiles] : tiles;
  const duration = Math.max(30, tiles.length * 6);

  return (
    <div
      ref={containerRef}
      className="absolute inset-x-0 bottom-0 overflow-hidden pb-[3%] opacity-80 [mask-image:linear-gradient(to_right,transparent_0%,black_9%,black_91%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_9%,black_91%,transparent_100%)]"
    >
      <div
        ref={trackRef}
        className={`flex gap-2 w-max px-4 ${overflow ? 'carousel-marquee' : 'mx-auto'}`}
        style={
          overflow
            ? ({ ['--marquee-duration' as string]: `${duration}s` } as React.CSSProperties)
            : undefined
        }
      >
        {rendered.map((src, i) => (
          <div
            key={`${src}-${i}`}
            className="h-[8rem] sm:h-[11rem] w-auto flex-none aspect-[4/3] overflow-hidden rounded-[3px] ring-1 ring-white/10 shadow-md shadow-black/40"
          >
            <img
              src={src}
              alt=""
              loading="lazy"
              className="w-full h-full object-cover"
              style={{
                objectPosition: TILE_POSITIONS[i % TILE_POSITIONS.length],
                transform: `scale(${1.05 + (i % 3) * 0.08})`,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

interface ProjectCarouselProps {
  projects: ProjectItem[];
  backgroundImages?: string[]; // Optional background images for rotation
}

const ProjectCarousel: FC<ProjectCarouselProps> = ({ projects, backgroundImages = [] }) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [animating, setAnimating] = useState<boolean>(false);
  const [buttonsOverflow, setButtonsOverflow] = useState<boolean>(false);
  const [hasAnimated, setHasAnimated] = useState<boolean>(false);
  const [showDot, setShowDot] = useState<boolean>(false);
  const [dotPosition, setDotPosition] = useState<number>(0);
  const [activeButtonWidth, setActiveButtonWidth] = useState<number>(0);
  const [activeButtonTop, setActiveButtonTop] = useState<number>(0);
  const [activeButtonHeight, setActiveButtonHeight] = useState<number>(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const buttonsContainerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const touchHandledRef = useRef<boolean>(false);

  const onExiting = useCallback(() => setAnimating(true), []);
  const onExited = useCallback(() => setAnimating(false), []);

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

  // Function to scroll to active button
  const scrollToActiveButton = useCallback(() => {
    if (!scrollContainerRef.current || !buttonsContainerRef.current || !buttonsOverflow) return;

    const container = scrollContainerRef.current;
    const innerDiv = buttonsContainerRef.current;
    const activeButton = buttonRefs.current[activeIndex];

    if (!activeButton) return;

    // Get button and container dimensions
    const buttonRect = activeButton.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // Calculate mask area (15% on each side)
    const maskSize = containerRect.width * 0.15;
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
        // Scroll so button appears just after the left mask
        targetScroll = buttonLeft - maskSize - 30; // 30px padding
      }
      // If button is too far right
      else if (buttonRect.right > safeAreaRight) {
        // Scroll so button appears just before the right mask
        targetScroll = buttonLeft + buttonWidth - containerWidth + maskSize + 30; // 30px padding
      }

      // Ensure we don't scroll past boundaries
      const maxScroll = innerDiv.scrollWidth - containerWidth;
      targetScroll = Math.max(0, Math.min(targetScroll, maxScroll));

      container.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  }, [activeIndex, buttonsOverflow, projects.length]);

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
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [updateDotPosition]);

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
      {/* Background layer — the rotating background image fills the slide as
          before, with a sampled mosaic of this project's other views layered
          on top and fading out toward the center. */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none bg-gray-900">
        {backgroundImages.length > 0 ? (
          <>
            <img
              src={getBackgroundImage(index)}
              alt=""
              className="absolute inset-0 w-full h-full object-cover scale-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-black/30"></div>
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800"></div>
        )}

        {project.gallery && project.gallery.length > 0 && (
          <>
            {/* Sampled project views in a strip along the bottom; slowly
                marquees through them when there are more than fit. */}
            <BottomCardStrip tiles={mosaicTiles} />
            {/* Light vignette only — keep the cards visible while easing
                contrast behind the featured screenshot and controls. */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse at center, rgba(10,12,14,0.62) 0%, rgba(10,12,14,0.3) 45%, rgba(10,12,14,0.12) 75%, rgba(10,12,14,0) 100%)',
              }}
            ></div>
          </>
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
          <div className="relative mb-6 transform transition-all duration-300 ">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
            <div className="relative bg-white/10 backdrop-blur-sm rounded-lg p-2 shadow-xl">
              <img
                src={project.imageUrl}
                alt={project.name}
                className="w-full max-w-[min(28rem,80vw)] h-auto object-contain rounded-md shadow-lg"
                style={{ maxHeight: '500px' }}
              />
            </div>
          </div>

          {/* Show URL if provided — anchored above the image on every screen
              size with an equal top/bottom margin (3em on mobile/very narrow
              screens, 1em from the sm breakpoint up). Because the content
              column is top-aligned (not centered), the URL stays a fixed
              distance from the top and the image a fixed distance below it,
              regardless of hero image height. A mild backdrop keeps it legible
              over lighter imagery. */}
          {(project.url || project.description) && (
            <div className="order-first w-full my-[1em] flex flex-col items-center sm:my-[1em] sm:w-auto">
              <div
                className="flex flex-col items-center gap-0.5 px-6 py-1.5 rounded-sm"
                style={{
                  background:
                    'linear-gradient(to right, rgba(91,133,146,0) 0%, rgba(91,133,146,0.5) 28%, rgba(91,133,146,0.5) 72%, rgba(91,133,146,0) 100%)',
                }}
              >
                {project.url && (
                  <span className="text-white text-lg leading-tight opacity-90 group-hover:opacity-100 transition-opacity">
                    {project.url}
                  </span>
                )}
                {project.description && (
                  <span className="whitespace-nowrap text-center text-xs sm:text-sm leading-tight text-white opacity-90 group-hover:opacity-100 transition-opacity">
                    {project.description}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Call to action */}
          <div className="flex items-center gap-2 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-sm font-medium">View Project</span>
            <svg
              className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>

        </a>
      </div>
    </CarouselItem>
   );
  });


  return (
    <div className="relative w-full select-none shadow-[5px_6px_11px_0px_rgba(0,_0,_0,_0.3)] rounded-sm hover:duration-200 hover:shadow-[rgba(0,_0,_0,_0.4)]">

      <div
        className="relative overflow-hidden -mx-[50vw] left-[50%] right-[50%] w-screen"
      >

        <div
          ref={scrollContainerRef}
          className="relative z-10 overflow-x-auto scrollbar-hide scroll-smooth bg-[#5b8592] border-white border-b-[0.1em]"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <div
            ref={buttonsContainerRef}
            className={`
              flex gap-3 py-3 pb-3 relative
              ${buttonsOverflow ? 'pl-[6%] pr-[20%]' : 'justify-center px-12'}
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
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <Carousel
          activeIndex={activeIndex}
          next={next}
          previous={previous}
          className="shadow-2xl overflow-hidden bg-gray-900"
          interval={6000}
        >
          {slides}

          {/* Modern carousel controls with higher z-index */}
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
      </div>

    </div>
  );
};

export default ProjectCarousel;