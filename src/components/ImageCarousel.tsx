import { useState, useCallback, FC } from "react";
import {
  Carousel,
  CarouselItem,
  CarouselControl,
  CarouselIndicators,
} from "reactstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import classNames from "classnames";

interface ImageCarouselProps {
  items: string[];
  className?: string;
}

interface CarouselIndicatorItem {
  src: string;
}

const ImageCarousel: FC<ImageCarouselProps> = ({ items, className }) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [animating, setAnimating] = useState<boolean>(false);

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

  const slides = items.map((src) => (
    <CarouselItem
      onExiting={onExiting}
      onExited={onExited}
      key={src}
      className="flex items-center justify-center"
    >
      <img 
        src={src} 
        alt="" 
        className={classNames("w-full h-auto object-contain max-h-[41.5em] bg-jk-teal", className)}
      />
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
        interval={5000}
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
    </div>
  );
};

export default ImageCarousel;