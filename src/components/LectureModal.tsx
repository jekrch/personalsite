import { FC, useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { resampleSafariChrome } from '../utils/safariChrome';
import { textbookPageUrl } from './lectures';

interface LectureModalProps {
  isOpen: boolean;
  toggle: () => void;
  lectureName: string;
  lectureNumber?: number;
  // Assigned pages in the course textbook (Klenk), e.g. "74–83, 95–100"
  readingPages?: string;
  url: string;
}

// The PowerPoint viewer is still drawing its first slide when the iframe's
// load event fires, so hold the loader a moment longer.
const PAINT_DELAY_MS = 1200;
// Give up on the loader if the load event never arrives.
const LOAD_TIMEOUT_MS = 12000;
// Chromium-only API; see .lecture-viewer--zoom in App.css
const ZOOMS_IFRAMES = 'userAgentData' in navigator;

const ICON_BTN =
  'flex size-[2.5rem] flex-none items-center justify-center rounded-[2px] bg-transparent !text-white/80 no-underline transition-colors duration-150 hover:bg-white/15 hover:!text-white hover:no-underline focus-visible:bg-white/15 focus-visible:outline-none';

const READING_LINE = 'flex min-w-0 items-center gap-[0.375rem]';

// Marks a textbook reading, here and in the lecture list
export const BookIcon: FC = () => (
  <svg className="size-[0.8rem] flex-none" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden>
    <path d="M12 6.5C10.5 5.3 8.2 4.5 4 4.5v13c4.2 0 6.5.8 8 2 1.5-1.2 3.8-2 8-2v-13c-4.2 0-6.5.8-8 2zM12 6.5v13" />
  </svg>
);

const LectureModal: FC<LectureModalProps> = ({ isOpen, toggle, lectureName, lectureNumber, readingPages, url }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const paintTimer = useRef<number>();

  // Handle open/close animations
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      let frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => {
          setIsAnimating(true);
          closeRef.current?.focus({ preventScroll: true });
        });
      });
      return () => cancelAnimationFrame(frame);
    } else {
      setIsAnimating(false);

      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Hand focus back to whatever opened the modal once it closes
  useEffect(() => {
    if (!isOpen) return;

    const previousFocus = document.activeElement as HTMLElement | null;
    return () => previousFocus?.focus({ preventScroll: true });
  }, [isOpen]);

  // Lock page scroll while the modal is on screen (through its fade-out too).
  // Pin the page where it is (body fixed at its scroll offset) so there is
  // nothing left to scroll: wheel, touch, keys, scrollbar drags and scroll
  // chaining out of the iframe all do nothing. A classic scrollbar is kept
  // (as an empty track) because hiding it would change the viewport width
  // and shift the page and everything fixed to it.
  useEffect(() => {
    if (!isVisible) return;

    const html = document.documentElement;
    const { body } = document;
    const scrollY = window.scrollY;
    const hasScrollbar = window.innerWidth > html.clientWidth;
    const previous = {
      overflowY: html.style.overflowY,
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
    };

    html.dataset.scrollLocked = '';
    if (hasScrollbar) html.style.overflowY = 'scroll';
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.left = '0';
    body.style.right = '0';

    return () => {
      html.style.overflowY = previous.overflowY;
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.left = previous.left;
      body.style.right = previous.right;
      // 'instant' so Bootstrap's smooth scroll-behavior doesn't animate it
      window.scrollTo({ top: scrollY, behavior: 'instant' });
      delete html.dataset.scrollLocked;
      // Otherwise iOS Safari keeps its bars tinted with the pinned body's teal
      resampleSafariChrome();
    };
  }, [isVisible]);

  // Reset loading state when modal opens or URL changes
  useEffect(() => {
    if (!isOpen) return;

    setIsLoading(true);
    window.clearTimeout(paintTimer.current);
    const fallback = window.setTimeout(() => setIsLoading(false), LOAD_TIMEOUT_MS);
    return () => window.clearTimeout(fallback);
  }, [isOpen, url]);

  useEffect(() => () => window.clearTimeout(paintTimer.current), []);

  // Handle escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      toggle();
    }
  }, [isOpen, toggle]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleIframeLoad = () => {
    window.clearTimeout(paintTimer.current);
    paintTimer.current = window.setTimeout(() => setIsLoading(false), PAINT_DELAY_MS);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      toggle();
    }
  };

  if (!isVisible) return null;

  const readingUrl = readingPages ? textbookPageUrl(readingPages) : undefined;
  const reading = (
    <>
      <BookIcon />
      <span className="truncate">
        <span className="sr-only">Reading: </span>
        Klenk <span aria-hidden className="text-white/45">·</span> pp. <span className="tabular-nums">{readingPages}</span>
      </span>
    </>
  );

  // Portaled to <body> so no ancestor transform can break `position: fixed`.
  return createPortal(
    <div
      className={`lecture-viewer ${ZOOMS_IFRAMES ? 'lecture-viewer--zoom' : ''} fixed inset-0 z-[1050] flex items-center justify-center touch-none overscroll-contain backdrop-blur-[3px]`}
      style={{
        backgroundColor: 'rgba(38, 50, 54, 0.72)',
        opacity: isAnimating ? 1 : 0,
        transition: 'opacity 300ms ease-out',
      }}
      onClick={handleBackdropClick}
    >
      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="lecture-viewer-title"
        className="relative"
        style={{
          transform: isAnimating ? 'none' : 'scale(0.96) translateY(12px)',
          transition: 'transform 300ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <div className="lecture-viewer__frame relative flex flex-col overflow-hidden rounded-[2px] border-[1px] border-solid border-white bg-jk-teal shadow-[5px_6px_18px_0px_rgba(0,0,0,0.35)]">
          {/* Header */}
          <div className="lecture-viewer__bar flex flex-none items-center gap-[0.75rem] pl-[0.875rem] pr-[0.375rem] text-white">
            {lectureNumber !== undefined && (
              <span className="grid size-[1.75rem] flex-none place-items-center rounded-[2px] border-[1px] border-solid border-white/70 text-[0.75rem] font-semibold tabular-nums">
                {lectureNumber}
              </span>
            )}
            <div className="lecture-viewer__title min-w-0 flex-1">
              <h2
                id="lecture-viewer-title"
                className="m-0 text-[0.95rem] font-semibold leading-[1.15] line-clamp-2"
              >
                {lectureName}
              </h2>
              {readingPages && (
                <p className="mb-0 mt-[0.1875rem] flex min-w-0 text-[0.68rem] font-light uppercase leading-[1rem] tracking-wider">
                  {readingUrl ? (
                    <a
                      href={readingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${READING_LINE} !text-white/75 no-underline decoration-white/40 underline-offset-2 transition-colors duration-150 hover:!text-white hover:underline focus-visible:!text-white focus-visible:underline focus-visible:outline-none`}
                      title="Open Understanding Symbolic Logic on the Internet Archive"
                    >
                      {reading}
                    </a>
                  ) : (
                    <span
                      className={`${READING_LINE} text-white/75`}
                      title={`Reading: Klenk, Understanding Symbolic Logic, pp. ${readingPages}`}
                    >
                      {reading}
                    </span>
                  )}
                </p>
              )}
            </div>
            <div className="lecture-viewer__actions flex flex-none items-center">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className={ICON_BTN}
                aria-label="Open slides in a new tab"
                title="Open in a new tab"
              >
                <svg className="size-[1.1rem]" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden>
                  <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
                </svg>
              </a>
              <button
                ref={closeRef}
                type="button"
                onClick={toggle}
                className={ICON_BTN}
                aria-label="Close slides"
              >
                <svg className="size-[1.25rem]" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" viewBox="0 0 24 24" aria-hidden>
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Slides */}
          <div className="lecture-viewer__stage relative flex-none bg-[#263236]">
            <div
              className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-jk-teal"
              style={{
                opacity: isLoading ? 1 : 0,
                pointerEvents: isLoading ? 'auto' : 'none',
                transition: 'opacity 500ms ease-in-out',
              }}
            >
              <div className="logo-loader scale-75 sm:scale-100">
                <div className="frame frame-1"></div>
                <div className="frame frame-2"></div>
                <div className="frame frame-3"></div>
              </div>
              <div className="mt-[1.75rem] text-sm font-light uppercase tracking-wider text-white sm:mt-10">
                Loading slides...
              </div>
            </div>

            <iframe
              key={url}
              className="lecture-viewer__embed block"
              style={{
                opacity: isLoading ? 0 : 1,
                transition: 'opacity 500ms ease-in-out',
              }}
              src={url}
              title={`${lectureName} presentation`}
              allow="fullscreen"
              allowFullScreen
              onLoad={handleIframeLoad}
            />
          </div>
        </div>

        {/* Invisible buffer under the slide toolbar so a tap that lands just
            short of its small controls doesn't hit the backdrop and close */}
        <div className="absolute inset-x-0 top-full h-[3rem]" aria-hidden />

        <p className="lecture-viewer__hint pointer-events-none absolute inset-x-0 top-full m-0 px-[1rem] pt-[0.375rem] text-center text-[0.7rem] font-light uppercase leading-[1rem] tracking-wider text-white/80">
          <span className="lecture-viewer__hint--mouse">Click the slide for the next step · After a click, ← goes back</span>
          <span className="lecture-viewer__hint--touch">Tap slide for the next step · Swipe right to go back</span>
        </p>
      </div>
    </div>,
    document.body
  );
};

export default LectureModal;
