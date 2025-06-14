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
  pageLink: string;
  url?: string; // Optional external URL
}

interface ProjectCarouselProps {
  projects: ProjectItem[];
  backgroundImages?: string[]; // Optional background images for rotation
}

const ProjectCarousel: FC<ProjectCarouselProps> = ({ projects, backgroundImages = [] }) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [animating, setAnimating] = useState<boolean>(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  const onExiting = useCallback(() => setAnimating(true), []);
  const onExited = useCallback(() => setAnimating(false), []);



  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const innerDiv = container.firstChild as HTMLElement;
      const activeButton = innerDiv?.children[activeIndex] as HTMLElement;
      
      if (activeButton) {
        // Get button position and dimensions
        const buttonLeft = activeButton.offsetLeft;
        const buttonWidth = activeButton.clientWidth;
        const containerWidth = container.clientWidth;
        
        // Calculate the scroll position that centers the button
        const buttonCenter = buttonLeft + (buttonWidth / 2);
        const containerCenter = containerWidth / 2;
        const scrollPosition = buttonCenter - containerCenter;
        
        // Scroll to center the button
        container.scrollTo({
          left: Math.max(0, scrollPosition),
          behavior: 'smooth'
        });
      }
    }
  }, [activeIndex]);

  
  // Rotate through background images if provided
  const getBackgroundImage = (index: number) => {
    if (backgroundImages.length === 0) return '';
    return backgroundImages[index % backgroundImages.length];
  };

  const slides = projects.map((project, index) => (
    <CarouselItem
      onExiting={onExiting}
      onExited={onExited}
      key={project.pageLink}
      className="relative"
    >
      {/* Background layer with subtle overlay */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {backgroundImages.length > 0 && (
          <>
            <img 
              src={getBackgroundImage(index)} 
              alt="" 
              className="w-full h-full object-cover scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-black/30"></div>
          </>
        )}
        {backgroundImages.length === 0 && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800"></div>
        )}
      </div>

      {/* Project content - contained within bounds to not overlap controls */}
      <div className="relative z-[5] flex flex-col items-center justify-center min-h-[500px] p-8 pointer-events-none">
        <a 
          href={project.pageLink}
          className="group cursor-pointer flex flex-col items-center pointer-events-auto"
        >
          {/* Project image container with hover effects */}
          <div className="relative mb-6 transform transition-all duration-300 ">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
            <div className="relative bg-white/10 backdrop-blur-sm rounded-lg p-2 shadow-2xl">
              <img 
                src={project.imageUrl} 
                alt={project.name}
                className="w-full max-w-md h-auto object-contain rounded-md shadow-lg"
                style={{ maxHeight: '300px' }}
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
    <div className="relative w-full select-none">
      {/* Scrollable button navigation at the top with blurred background */}
      <div className="relative overflow-hidden">
        {/* Background image that matches the current slide */}
        {backgroundImages.length > 0 && (
          <div className="absolute inset-0">
            <img 
              src={getBackgroundImage(activeIndex)} 
              alt="" 
              className="w-full h-full object-cover"
            />
            {/* Blur overlay */}
            <div className="absolute inset-0 backdrop-blur-md bg-black/40"></div>
          </div>
        )}
        {backgroundImages.length === 0 && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800"></div>
        )}
        
        {/* Gradient fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-black/60 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-black/60 to-transparent z-10 pointer-events-none"></div>
        
        <div 
          ref={scrollContainerRef}
          className="relative z-10 overflow-x-auto scrollbar-hide scroll-smooth"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <div className="flex gap-2 px-12 py-3 justify-center items-center w-[50em] sm:w-auto">
            {projects.map((project, index) => (
              <button
                key={project.pageLink}
                onClick={() => goToIndex(index)}
                className={`
                  whitespace-nowrap
                  px-4 py-2 rounded-sm text-sm font-medium transition-all duration-300 flex-shrink-0
                  ${activeIndex === index 
                    ? 'bg-[#5b8592]/80 text-white shadow-lg' 
                    : 'bg-white/20 text-white/90 hover:bg-white/30 hover:text-white backdrop-blur-sm'
                  }
                `}
              >
                {project.name}
              </button>
            ))}
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