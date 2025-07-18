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
}

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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const buttonsContainerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

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
    }
  }, [activeIndex]);

  // Function to scroll to active button
  const scrollToActiveButton = useCallback(() => {
    if (!scrollContainerRef.current || !buttonsContainerRef.current || !buttonsOverflow) return;
    
    const container = scrollContainerRef.current;
    const innerDiv = buttonsContainerRef.current;
    const activeButton = innerDiv.children[activeIndex] as HTMLElement;
    
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
      
      // If button is too far left
      if (buttonRect.left < safeAreaLeft) {
        // Scroll so button appears just after the left mask
        let padding = 30;
        if (activeIndex === 0) {
            padding = -50;
        }
        targetScroll = buttonLeft - maskSize - padding; // 30px padding
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
  }, [activeIndex, buttonsOverflow]);

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
  
  // Rotate through background images if provided
  const getBackgroundImage = (index: number) => {
    if (backgroundImages.length === 0) return '';
    return backgroundImages[index % backgroundImages.length];
  };

  const slides = projects.map((project, index) => (
    <CarouselItem
      onExiting={onExiting}
      onExited={onExited}
      key={project.name}
      className="relative"
    >
      {/* Background layer with subtle overlay */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {backgroundImages.length > 0 && (
          <>
            <img 
              src={getBackgroundImage(index)} 
              alt="" 
              className="w-full h-full object-cover scale-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-black/30"></div>
          </>
        )}
        {backgroundImages.length === 0 && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800"></div>
        )}
      </div>

      {/* Project content - contained within bounds to not overlap controls */}
      <div className="relative z-[5] flex flex-col items-center justify-center h-[450px] min-h-[300px] p-8 pointer-events-none">
        <a 
          href={project.pageLink || '#'}
          className="group cursor-pointer flex flex-col items-center pointer-events-auto"
          onClick={(e) => {
            // If it's an external URL without pageLink, open in new tab
            if (!project.pageLink && project.url) {
              e.preventDefault();
              window.open(project.url.startsWith('http') ? project.url : `https://${project.url}`, '_blank');
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
                className="w-full max-w-md h-auto object-contain rounded-md shadow-lg"
                style={{ maxHeight: '500px' }}
              />
            </div>
          </div>
          
          {/* Show URL if provided */}
          {project.url && (
            <div className="text-slate-200 text-lg mb-2 opacity-80 group-hover:opacity-100 transition-opacity">
              {project.url}
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
  ));


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
              flex gap-2 py-3 pb-3 relative
              ${buttonsOverflow ? 'px-[10%]' : 'justify-center px-12'}
            `}
            style={{
              minWidth: buttonsOverflow ? 'max-content' : 'auto'
            }}
          >
            {projects.map((project, index) => (
              <button
                key={project.name}
                ref={(el) => buttonRefs.current[index] = el}
                onClick={() => goToIndex(index)}
                className={`
                  whitespace-nowrap
                  border-white border-1 mt-[0.1em]
                  px-4 py-2 rounded-sm text-sm font-medium flex-shrink-0
                  ios-optimize
                  ${activeIndex === index 
                    ? 'bg-[#5b8592]/80 text-white shadow-lg' 
                    : 'bg-white/20 text-white/90 hover:bg-white/30 hover:text-white'
                  }
                  ${hasAnimated ? 'smooth-reveal' : 'button-initial'}
                  ${activeIndex !== index ? 'button-backdrop' : ''}
                `}
                style={{
                  animationDelay: hasAnimated ? `${index * 0.1}s` : '0s',
                  animationFillMode: 'both',
                  // Separate transition for color/background changes only
                  transition: 'background-color 0.6s, color 0.6s, box-shadow 0.6s',
                  WebkitTransition: 'background-color 0.6s, color 0.6s, box-shadow 0.6s'
                }}
              >
                {project.name}
              </button>
            ))}
            
            {/* Single sliding dot indicator */}
            {showDot && (
              <>
              <div 
                className="absolute bottom-[0.44em] w-[5.5em] h-[0.08em] bg-slate-300 rounded-fullx shadow-sm dot-fade-in ios-optimize"
                style={{
                  left: `${dotPosition}px`,
                  transform: 'translateX(-50%)',
                  transition: 'left 0.3s ease-out',
                  WebkitTransition: 'left 0.3s ease-out',
                }}
              />
              <div 
                className="absolute top-[0.54em] w-[5.5em] h-[0.08em] bg-slate-300 rounded-fullx shadow-sm dot-fade-in ios-optimize"
                style={{
                  left: `${dotPosition}px`,
                  transform: 'translateX(-50%)',
                  transition: 'left 0.3s ease-out',
                  WebkitTransition: 'left 0.3s ease-out',
                }}
              />
              </>
            )}
          </div>
        </div>
      </div>

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
  );
};

export default ProjectCarousel;