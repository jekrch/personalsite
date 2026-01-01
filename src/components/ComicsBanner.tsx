import { FC, useState, useEffect } from "react"

const comicImages = [
  "/images/comics/assorted-crisis-events-1.jpg",
  "/images/comics/beneath-the-trees-1.jpg",
  "/images/comics/invisible-man-3.jpg",
  "/images/comics/were-taking-everyone-down-2.jpg",
]

interface ImageSlot {
  src: string
  originX: number
  originY: number
}

const getRandomOrigin = () => ({
  originX: Math.floor(Math.random() * 100),
  originY: Math.floor(Math.random() * 100),
})

const ComicsBanner: FC = () => {
  const [slots, setSlots] = useState<ImageSlot[]>([])
  const [ , setCurrentIndex] = useState(0)

  // Initialize two slots with random images and positions
  useEffect(() => {
    const initialSlots: ImageSlot[] = [
      {
        src: comicImages[0],
        ...getRandomOrigin(),
      },
      {
        src: comicImages[1 % comicImages.length],
        ...getRandomOrigin(),
      },
    ]
    setSlots(initialSlots)
    setCurrentIndex(2)
  }, [])

  // Rotate images every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setSlots((prevSlots) => {
        const slotToUpdate = Math.floor(Math.random() * 2)
        const newSlots = [...prevSlots]
        
        setCurrentIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % comicImages.length
          newSlots[slotToUpdate] = {
            src: comicImages[nextIndex],
            ...getRandomOrigin(),
          }
          return nextIndex
        })
        
        return newSlots
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative my-8">
      {/* Backing frame elements - offset behind the banner */}
      <div 
        className="absolute border-2 border-[var(--jk-teal)] opacity-70 pointer-events-none"
        style={{
          top: '-8px',
          left: '10px',
          right: '24px',
          bottom: '-6px',
        }}
      />
      <div 
        className="absolute border-2 border-[var(--jk-teal)] opacity-30 pointer-events-none"
        style={{
          top: '-4px',
          left: '32px',
          right: '8px',
          bottom: '-12px',
        }}
      />
      
      {/* Main banner */}
      <a 
        href="https://comics.jacobkrch.com" 
        className="block group no-underline relative z-10"
      >

        <div className="relative overflow-hidden bg-[var(--jk-teal)] px-5 py-4 border-2 border-white/80 hover:border-white/50 transition-colors hover:shadow-md">
                 
          {/* Comic background images */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Left image */}
            {slots[0] && (
              <div className="absolute left-0 top-0 w-1/2 h-full overflow-hidden">
                <img
                  src={slots[0].src}
                  alt=""
                  className="w-full h-full object-cover scale-[3] transition-all duration-1000"
                  style={{
                    objectPosition: `${slots[0].originX}% ${slots[0].originY}%`,
                  }}
                />
                {/* Fade toward center and down */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[var(--jk-teal)]" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--jk-teal)]" />
              </div>
            )}
            
            {/* Right image */}
            {slots[1] && (
              <div className="absolute right-0 top-0 w-1/2 h-full overflow-hidden">
                <img
                  src={slots[1].src}
                  alt=""
                  className="w-full h-full object-cover scale-[3] transition-all duration-1000"
                  style={{
                    objectPosition: `${slots[1].originX}% ${slots[1].originY}%`,
                  }}
                />
                {/* Fade toward center and down */}
                <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[var(--jk-teal)]" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--jk-teal)]" />
              </div>
            )}
          </div>
          
          {/* Content */}
          <div className="relative z-10 text-center">
            <p className="text-white  text-sm m-0 mb-1">
              What were my fav comics from 2025? 
            </p>
            <h3 className="text-white text-lg font-semibold m-0 group-hover:underline">
              I made a list →
            </h3>
          </div>
        </div>
      </a>
    </div>
  )
}

export default ComicsBanner