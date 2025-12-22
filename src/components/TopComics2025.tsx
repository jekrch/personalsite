import { FC, useState, useRef } from "react";
import { ComicSeries } from "../types/ComicTypes";
import { topComics2025 } from "../data/topComics2025";
import ComicRankCard from "./shared/ComicRankCard";
import ComicInlineDetail from "./shared/ComicInlineDetail";

const ChevronUp: FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15" />
  </svg>
);

const ChevronDown: FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const TopComics2025: FC = () => {
  const [expandedRanks, setExpandedRanks] = useState<Set<number>>(new Set());
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Sort by rank descending (10 to 1) for the list
  const sortedComics = [...topComics2025].sort((a, b) => b.rank - a.rank);

  // Find current visible item index based on scroll position
  const getCurrentVisibleIndex = (): number => {
    const scrollTop = window.scrollY;
    let currentIndex = 0;
    
    for (let i = 0; i < sortedComics.length; i++) {
      const rank = sortedComics[i].rank;
      const el = cardRefs.current.get(rank);
      if (el && el.offsetTop <= scrollTop + 100) {
        currentIndex = i;
      }
    }
    return currentIndex;
  };

  // Navigate to an item: expand it and scroll to it
  const navigateToIndex = (index: number) => {
    const comic = sortedComics[index];
    if (!comic) return;

    // Expand this item (add to set, don't toggle)
    setExpandedRanks(prev => {
      const next = new Set(prev);
      next.add(comic.rank);
      return next;
    });

    // Scroll to it after a brief delay for expansion animation
    const cardEl = cardRefs.current.get(comic.rank);
    if (cardEl) {
      setTimeout(() => {
        cardEl.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
  };

  // Navigate to previous item (up the list, toward rank 10)
  const goToPrev = () => {
    const currentIndex = getCurrentVisibleIndex();
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : sortedComics.length - 1;
    navigateToIndex(prevIndex);
  };

  // Navigate to next item (down the list, toward rank 1)
  const goToNext = () => {
    const currentIndex = getCurrentVisibleIndex();
    const nextIndex = currentIndex < sortedComics.length - 1 ? currentIndex + 1 : 0;
    navigateToIndex(nextIndex);
  };

  // Handle click - toggle expansion and scroll
  const handleCardClick = (comic: ComicSeries) => {
    const isExpanding = !expandedRanks.has(comic.rank);

    setExpandedRanks(prev => {
      const next = new Set(prev);
      if (next.has(comic.rank)) {
        next.delete(comic.rank);
      } else {
        next.add(comic.rank);
      }
      return next;
    });

    // If expanding a card, scroll to it after animations complete
    if (isExpanding) {
      const cardEl = cardRefs.current.get(comic.rank);
      if (cardEl) {
        setTimeout(() => {
          cardEl.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }, 500);
      }
    }
  };

  // Store ref for each card
  const setCardRef = (rank: number, el: HTMLDivElement | null) => {
    if (el) {
      cardRefs.current.set(rank, el);
    } else {
      cardRefs.current.delete(rank);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 -mb-8">
      {/* Decorative Header Section */}
      <div className="relative bg-zinc-900 border-b border-zinc-800 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-jk-teal rotate-45 -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-jk-teal rotate-45 translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col gap-6">
            {/* Title Block */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-2 h-20 bg-jk-teal" />
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-jk-teal font-semibold">
                    Jenny & Jacob's
                  </p>
                  <h1 className="text-4xl font-black tracking-tight">
                    Top <span className="text-jk-teal">10</span> Comic Series
                  </h1>
                  <p className="text-zinc-400 text-sm mt-1">
                    Our Favorite Reads of <span className="text-jk-teal font-semibold">2025</span>
                  </p>
                </div>
              </div>

              {/* Year Badge */}
              <div className="hidden md:flex flex-col items-center">
                <div className="w-16 h-16 bg-zinc-800 rotate-45 flex items-center justify-center border border-zinc-700">
                  <span className="text-jk-teal text-2xl font-black -rotate-45">25</span>
                </div>
                <span className="text-zinc-600 text-xs mt-3 uppercase tracking-wider">Year in Review</span>
              </div>
            </div>

            {/* Intro Note */}
            <div className="max-w-2xl">
              <p className="text-zinc-400 text-sm leading-relaxed border-l-2 border-zinc-700 pl-4">
                 Jenny and I read a truly obnoxious number of comics this year, both new and old. For fun--and to soberly reflect on this recent obsession--we wrote up a list of just the 2025 series that we enjoyed. 
                 
                 And then we narrowed that down (!) to a tidy top ten in the following order. 
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Accordion Style */}
      <div className="max-w-3xl mx-auto">
        {/* List Header */}
        <div className="sticky top-0 z-10 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-zinc-800 rotate-45 flex items-center justify-center">
                <span className="text-jk-teal text-xs font-bold -rotate-45">10</span>
              </div>
              <span className="text-zinc-400 text-sm uppercase tracking-wider">to</span>
              <div className="w-8 h-8 bg-jk-teal rotate-45 flex items-center justify-center">
                <span className="text-zinc-900 text-xs font-bold -rotate-45">1</span>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={goToPrev}
                className="w-8 h-8 flex items-center justify-center rounded transition-colors bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-jk-teal"
                title="Previous item"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                onClick={goToNext}
                className="w-8 h-8 flex items-center justify-center rounded transition-colors bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-jk-teal"
                title="Next item"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <span className="text-zinc-600 text-xs font-mono ml-2">
                {expandedRanks.size > 0 ? `` : 'tap to expand'}
              </span>
            </div>
          </div>
        </div>

        {/* Accordion List */}
        <div className="divide-y divide-zinc-800/50">
          {sortedComics.map((comic) => (
            <div 
              key={comic.rank} 
              ref={(el) => setCardRef(comic.rank, el)}
              className="scroll-mt-14"
            >
              <ComicRankCard
                comic={comic}
                isSelected={expandedRanks.has(comic.rank)}
                onClick={() => handleCardClick(comic)}
                showExpandIcon={true}
              />
              <ComicInlineDetail
                comic={comic}
                isOpen={expandedRanks.has(comic.rank)}
              />
            </div>
          ))}
        </div>

        {/* Bottom Decoration */}
        <div className="p-8 flex justify-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-jk-teal/40 rotate-45" />
            <div className="w-3 h-3 bg-jk-teal/60 rotate-45" />
            <div className="w-4 h-4 bg-jk-teal rotate-45" />
            <div className="w-3 h-3 bg-jk-teal/60 rotate-45" />
            <div className="w-2 h-2 bg-jk-teal/40 rotate-45" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopComics2025;