import { FC, useState, useEffect, useCallback } from 'react';

interface LectureModalProps {
  isOpen: boolean;
  toggle: () => void;
  lectureName: string;
  url: string;
}

const LectureModal: FC<LectureModalProps> = ({ isOpen, toggle, lectureName, url }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle open/close animations
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });

      // Prevent scrolling via event listeners
      const preventScroll = (e: Event) => {
        e.preventDefault();
      };

      document.addEventListener('wheel', preventScroll, { passive: false });
      document.addEventListener('touchmove', preventScroll, { passive: false });

      return () => {
        document.removeEventListener('wheel', preventScroll);
        document.removeEventListener('touchmove', preventScroll);
      };
    } else {
      setIsAnimating(false);
      
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Reset loading state when modal opens or URL changes
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
    }
  }, [isOpen, url]);

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
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      toggle();
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >

      {/* Modal Container */}
      <div
        className="relative w-full max-w-2xl bg-white border-1 border-gray-600  rounded-lg shadow-2xl overflow-hidden pb-10"
        style={{
          opacity: isAnimating ? 1 : 0,
          transform: isAnimating ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(-20px)',
          transition: 'opacity 300ms ease-out, transform 300ms ease-out',
          maxHeight: 'calc(100dvh - 2rem)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h5 className="text-base font-semibold text-gray-600 m-0 pr-4 break-words">
            {lectureName}
          </h5>
          <button
            onClick={toggle}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-sm text-gray-500 hover:text-gray-700 hover:bg-gray-200 transition-colors duration-150"
            aria-label="Close modal"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="relative" style={{ minHeight: '481px' }}>
          {/* Loader */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center z-10"
            style={{
              backgroundColor: '#5b8592',
              opacity: isLoading ? 1 : 0,
              pointerEvents: isLoading ? 'all' : 'none',
              transition: 'opacity 500ms ease-in-out',
            }}
          >
            <div className="logo-loader">
              <div className="frame frame-1"></div>
              <div className="frame frame-2"></div>
              <div className="frame frame-3"></div>
            </div>
            <div
              className="text-white mt-10 text-sm uppercase tracking-wider font-light"
              style={{ fontFamily: 'sans-serif' }}
            >
              Loading slides...
            </div>
          </div>

          {/* Iframe */}
          <iframe
            key={url}
            className="block mx-auto"
            style={{
              opacity: isLoading ? 0 : 1,
              transition: 'opacity 500ms ease-in-out',
            }}
            src={url}
            width="100%"
            height="481px"
            frameBorder="0"
            title={`${lectureName} presentation`}
            onLoad={handleIframeLoad}
          />
        </div>
      </div>
    </div>
  );
};

export default LectureModal;