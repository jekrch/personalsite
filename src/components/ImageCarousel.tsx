import { useState, useCallback, useEffect, FC } from "react";
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
  const [minAspectRatio, setMinAspectRatio] = useState<number | null>(null);

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
        <img
          src={src}
          alt=""
          className="max-w-full max-h-full object-contain"
        />
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