import { FC, useState } from "react";
import { ComicSeries } from "../types/ComicTypes";
import { topComics2025 } from "../data/topComics2025";
import ComicRankCard from "./shared/ComicRankCard";
import ComicInlineDetail from "./shared/ComicInlineDetail";

const TopComics2025: FC = () => {
  const [expandedRank, setExpandedRank] = useState<number | null>(null);

  // Sort by rank descending (10 to 1) for the list
  const sortedComics = [...topComics2025].sort((a, b) => b.rank - a.rank);

  // Handle click - toggle expansion
  const handleCardClick = (comic: ComicSeries) => {
    setExpandedRank(expandedRank === comic.rank ? null : comic.rank);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 -mt-12">


      {/* Decorative Header Section */}
      <div className="relative bg-zinc-900 border-b border-zinc-800 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-jk-teal rotate-45 -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-jk-teal rotate-45 translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-end gap-6">
            {/* Title Block */}
            <div className="flex items-center gap-4">
              <div className="w-2 h-16 bg-jk-teal" />
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-jk-teal font-semibold">
                  Year in Review
                </p>
                <h1 className="text-4xl font-black tracking-tight">
                  Top <span className="text-jk-teal">10</span> Comics
                </h1>
                <p className="text-zinc-500 text-sm mt-1">2025</p>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="hidden md:flex items-center gap-3 ml-auto">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-4 h-4 rotate-45 border border-zinc-700"
                  style={{ opacity: 1 - i * 0.15 }}
                />
              ))}
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
            <span className="text-zinc-600 text-xs font-mono">
              tap to expand
            </span>
          </div>
        </div>

        {/* Accordion List */}
        <div className="divide-y divide-zinc-800/50">
          {sortedComics.map((comic) => (
            <div key={comic.rank}>
              <ComicRankCard
                comic={comic}
                isSelected={expandedRank === comic.rank}
                onClick={() => handleCardClick(comic)}
                showExpandIcon={true}
              />
              <ComicInlineDetail
                comic={comic}
                isOpen={expandedRank === comic.rank}
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