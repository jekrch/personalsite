import { FC, useEffect, useCallback, useState, useRef, MouseEvent, TouchEvent } from "react";

interface ImageModalProps {
  images: string[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
  seriesName: string;
}

const ImageModal: FC<ImageModalProps> = ({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
  seriesName,
}) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const goNext = useCallback(() => {
    if (isZoomed) return;
    onNavigate((currentIndex + 1) % images.length);
  }, [currentIndex, images.length, onNavigate, isZoomed]);

  const goPrev = useCallback(() => {
    if (isZoomed) return;
    onNavigate((currentIndex - 1 + images.length) % images.length);
  }, [currentIndex, images.length, onNavigate, isZoomed]);

  const toggleZoom = () => {
    // Only ignore if we actually dragged (moved), not just clicked
    if (hasMoved) return;
    
    if (!isZoomed) {
      // Zoom in - center on click position
      setPosition({ x: 0, y: 0 });
      setIsZoomed(true);
    } else {
      // Zoom out
      setIsZoomed(false);
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleMouseDown = (e: MouseEvent) => {
    if (!isZoomed) return;
    e.preventDefault();
    setIsDragging(true);
    setHasMoved(false);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !isZoomed) return;
    e.preventDefault();
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    // Check if we've moved enough to consider it a drag
    if (Math.abs(newX - position.x) > 3 || Math.abs(newY - position.y) > 3) {
      setHasMoved(true);
    }
    
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    // Reset hasMoved after a short delay to allow click event to check it
    setTimeout(() => setHasMoved(false), 10);
  };

  // Touch handlers for mobile
  const handleTouchStart = (e: TouchEvent) => {
    if (!isZoomed) return;
    const touch = e.touches[0];
    setIsDragging(true);
    setHasMoved(false);
    setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging || !isZoomed) return;
    const touch = e.touches[0];
    
    const newX = touch.clientX - dragStart.x;
    const newY = touch.clientY - dragStart.y;
    
    // Check if we've moved enough to consider it a drag
    if (Math.abs(newX - position.x) > 3 || Math.abs(newY - position.y) > 3) {
      setHasMoved(true);
    }
    
    setPosition({ x: newX, y: newY });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setTimeout(() => setHasMoved(false), 10);
  };

  // Reset zoom and position when changing images or closing
  useEffect(() => {
    setIsZoomed(false);
    setPosition({ x: 0, y: 0 });
  }, [currentIndex, isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          if (isZoomed) {
            setIsZoomed(false);
            setPosition({ x: 0, y: 0 });
          } else {
            onClose();
          }
          break;
        case "ArrowLeft":
          goPrev();
          break;
        case "ArrowRight":
          goNext();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose, goNext, goPrev, isZoomed]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={() => isZoomed ? null : onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />

      {/* Modal Content */}
      <div
        className="relative z-10 w-full h-full flex flex-col items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar */}
        <div className={`
          absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4
          transition-opacity duration-200
          ${isZoomed ? 'opacity-30 hover:opacity-100' : 'opacity-100'}
        `}>
          {/* Image Counter */}
          <div className="px-3 py-1.5 bg-zinc-900/80 text-zinc-300 text-sm font-mono border border-zinc-700">
            {currentIndex + 1} / {images.length}
          </div>

          {/* Zoom hint + Close */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:block text-zinc-500 text-xs">
              {isZoomed ? "drag to pan • click to zoom out" : "click image to zoom"}
            </span>
            <button
              onClick={onClose}
              className="
                w-10 h-10 flex items-center justify-center
                bg-zinc-900/80 text-zinc-300
                hover:bg-jk-teal hover:text-zinc-900
                transition-colors duration-200
                border border-zinc-700 hover:border-jk-teal
              "
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Main Image Container */}
        <div 
          ref={containerRef}
          className={`
            relative flex-1 w-full flex items-center justify-center
            overflow-hidden
          `}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Desktop Navigation Arrows - Hidden on mobile */}
          {images.length > 1 && !isZoomed && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
                className="
                  hidden md:flex
                  absolute left-4 z-20
                  w-12 h-12 items-center justify-center
                  bg-zinc-900/80 text-zinc-300
                  hover:bg-jk-teal hover:text-zinc-900
                  transition-colors duration-200
                  border border-zinc-700 hover:border-jk-teal
                "
                aria-label="Previous image"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
                className="
                  hidden md:flex
                  absolute right-4 z-20
                  w-12 h-12 items-center justify-center
                  bg-zinc-900/80 text-zinc-300
                  hover:bg-jk-teal hover:text-zinc-900
                  transition-colors duration-200
                  border border-zinc-700 hover:border-jk-teal
                "
                aria-label="Next image"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Image */}
          <div 
            className={`
              flex items-center justify-center
              ${isZoomed ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'}
              ${!isZoomed ? 'md:px-20' : ''}
            `}
            onClick={toggleZoom}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            style={isZoomed ? {
              transform: `translate(${position.x}px, ${position.y}px)`,
            } : undefined}
          >
            <img
              ref={imageRef}
              src={images[currentIndex]}
              alt={`${seriesName} sample ${currentIndex + 1}`}
              draggable={false}
              className={`
                shadow-2xl select-none
                transition-all duration-300
                ${isZoomed 
                  ? 'max-w-none w-auto scale-150 md:scale-[1.5]' 
                  : 'max-w-full max-h-[70vh] md:max-h-[75vh] object-contain'
                }
              `}
            />
          </div>

          {/* Click to exit zoom overlay hint */}
          {isZoomed && (
            <button
              onClick={() => {
                setIsZoomed(false);
                setPosition({ x: 0, y: 0 });
              }}
              className="absolute bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 z-20 px-4 py-2 bg-zinc-900/80 text-zinc-400 text-xs border border-zinc-700 hover:bg-zinc-800 transition-colors"
            >
              Click here or press Esc to exit zoom
            </button>
          )}
        </div>

        {/* Bottom Controls */}
        <div className={`
          w-full flex flex-col items-center gap-3 mt-4
          ${isZoomed ? 'opacity-0 pointer-events-none' : 'opacity-100'}
          transition-opacity duration-200
        `}>
          {/* Mobile Navigation Arrows */}
          {images.length > 1 && (
            <div className="flex md:hidden items-center gap-4">
              <button
                onClick={goPrev}
                className="
                  w-12 h-12 flex items-center justify-center
                  bg-zinc-900/80 text-zinc-300
                  hover:bg-jk-teal hover:text-zinc-900
                  active:bg-jk-teal active:text-zinc-900
                  transition-colors duration-200
                  border border-zinc-700
                "
                aria-label="Previous image"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <span className="text-zinc-500 text-sm font-mono min-w-[4rem] text-center">
                {currentIndex + 1} / {images.length}
              </span>

              <button
                onClick={goNext}
                className="
                  w-12 h-12 flex items-center justify-center
                  bg-zinc-900/80 text-zinc-300
                  hover:bg-jk-teal hover:text-zinc-900
                  active:bg-jk-teal active:text-zinc-900
                  transition-colors duration-200
                  border border-zinc-700
                "
                aria-label="Next image"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}

          {/* Thumbnail Strip - Desktop only */}
          {images.length > 1 && (
            <div className="hidden md:flex gap-2 p-2 bg-zinc-900/60 border border-zinc-800">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => onNavigate(idx)}
                  className={`
                    w-12 h-16 overflow-hidden flex-shrink-0
                    transition-all duration-200
                    ${idx === currentIndex
                      ? 'ring-2 ring-jk-teal scale-105'
                      : 'ring-1 ring-zinc-700 opacity-60 hover:opacity-100 hover:ring-jk-teal/50'
                    }
                  `}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Keyboard hint - Desktop only */}
          <p className="hidden md:block text-zinc-600 text-xs">
            Use arrow keys to navigate • Esc to close
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;