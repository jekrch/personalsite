import React, { useState, useEffect, useCallback } from "react"
import {
  Carousel,
  CarouselItem,
  CarouselControl,
  CarouselIndicators,
} from "reactstrap"
import "bootstrap/dist/css/bootstrap.min.css"

const ImageCarousel = ({ items }) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [animating, setAnimating] = useState(false)

  const next = () => {
    if (animating) return
    const nextIndex = activeIndex === items.length - 1 ? 0 : activeIndex + 1
    setActiveIndex(nextIndex)
  }

  const previous = () => {
    if (animating) return
    const nextIndex = activeIndex === 0 ? items.length - 1 : activeIndex - 1
    setActiveIndex(nextIndex)
  }

  const goToIndex = (newIndex) => {
    if (animating) return
    setActiveIndex(newIndex)
  }

  const slides = items.map((src) => (
    <CarouselItem
      onExiting={() => setAnimating(true)}
      onExited={() => setAnimating(false)}
      key={src}
      className="flex items-center justify-center"
    >
      <img 
        src={src} 
        alt="" 
        className="w-full h-auto max-h-full object-contain"
      />
    </CarouselItem>
  ))

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
          items={items.map((src) => ({ src }))}
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
  )
}

export default ImageCarousel